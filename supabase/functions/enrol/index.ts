import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.192.0/encoding/base64.ts";

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

    const {
      fname,
      mname,
      lname,
      dob,
      nationality,
      address,
      emailID,
      main_phone,
      emergency_contacts,
      digilockerData,
      hotelId,
      roomId,
      selfieBase64
    } = await req.json();

    console.log('Enrollment request received for:', emailID);

    // Calculate age from DOB
    const birthDate = new Date(dob);
    const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    // Create Guest
    const { data: guest, error: guestError } = await supabase
      .from('guest')
      .insert({
        fname,
        mname,
        lname,
        dob,
        age,
        nationality,
        address,
        emailid: emailID,
        main_phone,
        emergency_contacts: emergency_contacts || {}
      })
      .select()
      .single();

    if (guestError) {
      console.error('Guest creation error:', guestError);
      throw new Error(`Failed to create guest: ${guestError.message}`);
    }

    console.log('Guest created:', guest.guestid);

    // Upload selfie if provided
    if (selfieBase64) {
      try {
        const base64Data = selfieBase64.split(',')[1] || selfieBase64;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const fileName = `${guest.guestid}_${Date.now()}.jpg`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('guest-selfies')
          .upload(fileName, bytes.buffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error('Selfie upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('guest-selfies')
            .getPublicUrl(fileName);
          
          await supabase
            .from('guest')
            .update({ selfie_url: publicUrl })
            .eq('guestid', guest.guestid);

          console.log('Selfie uploaded:', fileName);
        }
      } catch (uploadErr) {
        console.error('Selfie processing error:', uploadErr);
      }
    }

    // Create DigiLocker entry
    if (digilockerData) {
      const { error: digiError } = await supabase
        .from('digilockerid')
        .insert({
          guestid: guest.guestid,
          documenttype: digilockerData.documentType || 'Aadhaar',
          documentlink: digilockerData.documentLink,
          issuedate: digilockerData.issueDate,
          expirydate: digilockerData.expiryDate,
          verifiedstatus: true,
          verifiedusing: 'DigiLocker'
        });

      if (digiError) {
        console.error('DigiLocker entry error:', digiError);
      }
    }

    // Create StayLog with 'Enrolled' status
    const nonce = crypto.randomUUID();
    const issuedAt = new Date().toISOString();

    const { data: stayLog, error: stayError } = await supabase
      .from('staylog')
      .insert({
        guestid: guest.guestid,
        hotelid: hotelId,
        roomid: roomId,
        status: 'Enrolled',
        credentialnonce: nonce,
        credentialissuedat: issuedAt
      })
      .select()
      .single();

    if (stayError) {
      console.error('StayLog creation error:', stayError);
      throw new Error(`Failed to create stay log: ${stayError.message}`);
    }

    console.log('StayLog created:', stayLog.stayid);

    // Generate JWT credential
    const jwtSecret = Deno.env.get('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      stayId: stayLog.stayid,
      guestId: guest.guestid,
      nonce: nonce,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const encodedHeader = encode(JSON.stringify(header)).replace(/=/g, '');
    const encodedPayload = encode(JSON.stringify(payload)).replace(/=/g, '');
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(jwtSecret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(signatureInput));
    const signatureArray = new Uint8Array(signature);
    const encodedSignature = encode(signatureArray.buffer).replace(/=/g, '');
    const jwt = `${signatureInput}.${encodedSignature}`;

    console.log('JWT credential generated');

    // Generate QR code data URL (simple approach - client will render)
    const qrData = {
      credential: jwt,
      stayId: stayLog.stayid,
      guestName: `${fname} ${lname}`,
      hotelId: hotelId
    };

    return new Response(
      JSON.stringify({
        success: true,
        guestId: guest.guestid,
        stayId: stayLog.stayid,
        credential: jwt,
        qrData: qrData,
        message: 'Enrollment successful! Your QR credential has been generated.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Enrollment error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Enrollment failed';
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