import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode } from "https://deno.land/std@0.192.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TAX_RATE = 0.18; // 18% tax

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { credential } = await req.json();

    console.log('Checkout request received');

    if (!credential) {
      throw new Error('No credential provided');
    }

    // Verify JWT (same as check-in)
    const jwtSecret = Deno.env.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const parts = credential.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(jwtSecret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureInput = `${headerB64}.${payloadB64}`;
    const signatureBytes = decode(signatureB64 + '==');
    const signatureArray = new Uint8Array(signatureBytes);
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureArray,
      encoder.encode(signatureInput)
    );

    if (!isValid) {
      throw new Error('Invalid JWT signature');
    }

    const payloadBytes = decode(payloadB64 + '==');
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes));

    console.log('JWT verified for stayId:', payload.stayId);

    // Fetch stay details
    const { data: stayLog, error: fetchError } = await supabase
      .from('staylog')
      .select('*, guest(*), hotel(*), room(*)')
      .eq('stayid', payload.stayId)
      .eq('credentialnonce', payload.nonce)
      .single();

    if (fetchError || !stayLog) {
      console.error('StayLog fetch error:', fetchError);
      throw new Error('Invalid credential');
    }

    if (stayLog.status !== 'Checked-In') {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Cannot checkout. Current status: ${stayLog.status}`
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate billing
    const checkInTime = new Date(stayLog.checkintime);
    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - checkInTime.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) || 1; // At least 1 day

    const pricePerNight = parseFloat(stayLog.room.pricepernight);
    const roomAmount = pricePerNight * durationDays * stayLog.roomcount;
    const taxAmount = roomAmount * TAX_RATE;
    const finalAmount = roomAmount + taxAmount;

    console.log('Billing calculation:', { durationDays, roomAmount, taxAmount, finalAmount });

    // Update StayLog
    const { error: updateError } = await supabase
      .from('staylog')
      .update({
        status: 'Checked-Out',
        checkouttime: checkOutTime.toISOString(),
        totalamount: finalAmount
      })
      .eq('stayid', payload.stayId);

    if (updateError) {
      console.error('Checkout update error:', updateError);
      throw new Error('Failed to update checkout status');
    }

    // Update room availability
    await supabase
      .from('room')
      .update({ availability_status: 'Available' })
      .eq('roomid', stayLog.roomid);

    // Create Billing record
    const { data: billing, error: billingError } = await supabase
      .from('billing')
      .insert({
        stayid: stayLog.stayid,
        generationdate: checkOutTime.toISOString(),
        tax: taxAmount,
        finalamount: finalAmount
      })
      .select()
      .single();

    if (billingError) {
      console.error('Billing creation error:', billingError);
      throw new Error('Failed to create billing record');
    }

    // Create Payment record (pending)
    const { data: payment, error: paymentError } = await supabase
      .from('payment')
      .insert({
        billingid: billing.billingid,
        amount: finalAmount,
        method: 'Cash',
        status: 'Pending',
        paymentdate: null
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
    }

    console.log('Checkout successful for:', stayLog.guest.emailid);

    return new Response(
      JSON.stringify({
        success: true,
        stayId: stayLog.stayid,
        guestName: `${stayLog.guest.fname} ${stayLog.guest.lname}`,
        hotelName: stayLog.hotel.name,
        roomNumber: stayLog.room.roomnumber,
        checkInTime: stayLog.checkintime,
        checkOutTime: checkOutTime.toISOString(),
        durationDays: durationDays,
        roomRate: pricePerNight,
        roomAmount: roomAmount,
        taxAmount: taxAmount,
        finalAmount: finalAmount,
        billingId: billing.billingid,
        paymentId: payment?.paymentid,
        message: 'Checkout successful! Thank you for your stay.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});