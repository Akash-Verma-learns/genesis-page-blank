import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Helper to add padding to base64 string
function addBase64Padding(str: string): string {
  while (str.length % 4 !== 0) {
    str += '=';
  }
  return str;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    console.log('Check-in request received');

    if (!credential) {
      throw new Error('No credential provided');
    }

    // Verify JWT
    const jwtSecret = Deno.env.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const parts = credential.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    // Verify JWT signature
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
    
    // Decode signature with proper padding
    const paddedSignature = addBase64Padding(signatureB64);
    const signatureBytes = Uint8Array.from(atob(paddedSignature), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(signatureInput)
    );

    if (!isValid) {
      throw new Error('Invalid JWT signature');
    }

    // Decode and parse payload with proper padding
    const paddedPayload = addBase64Padding(payloadB64);
    const payloadJson = atob(paddedPayload);
    const payload = JSON.parse(payloadJson);

    console.log('JWT verified for stayId:', payload.stayId);

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Credential expired');
    }

    // Verify nonce hasn't been used for check-in
    const { data: stayLog, error: fetchError } = await supabase
      .from('staylog')
      .select('*, guest(*), hotel(*), room(*)')
      .eq('stayid', payload.stayId)
      .eq('credentialnonce', payload.nonce)
      .single();

    if (fetchError || !stayLog) {
      console.error('StayLog fetch error:', fetchError);
      throw new Error('Invalid or used credential');
    }

    if (stayLog.status === 'Checked-In') {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Guest is already checked in'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (stayLog.status === 'Checked-Out') {
      throw new Error('This stay has already been checked out');
    }

    // Update StayLog to 'Checked-In'
    const { error: updateError } = await supabase
      .from('staylog')
      .update({
        status: 'Checked-In',
        checkintime: new Date().toISOString()
      })
      .eq('stayid', payload.stayId);

    if (updateError) {
      console.error('Check-in update error:', updateError);
      throw new Error('Failed to update check-in status');
    }

    // Update room availability
    await supabase
      .from('room')
      .update({ availability_status: 'Occupied' })
      .eq('roomid', stayLog.roomid);

    console.log('Check-in successful for:', stayLog.guest.emailid);

    return new Response(
      JSON.stringify({
        success: true,
        stayId: stayLog.stayid,
        guestName: `${stayLog.guest.fname} ${stayLog.guest.lname}`,
        hotelName: stayLog.hotel.name,
        roomNumber: stayLog.room.roomnumber,
        checkInTime: new Date().toISOString(),
        message: 'Check-in successful! Welcome to the hotel.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Check-in error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Check-in failed';
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