
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      google_place_id, 
      formatted_address, 
      address_line1, 
      address_line2, 
      city, 
      state, 
      zip_code, 
      latitude, 
      longitude 
    } = await req.json()
    
    console.log('FWA check request:', { 
      google_place_id, 
      formatted_address, 
      address_line1, 
      city, 
      state, 
      zip_code, 
      latitude, 
      longitude 
    })

    // Check if address already exists in anchor_address table
    const { data: existingAddress, error: checkError } = await supabase
      .from('anchor_address')
      .select('id, qualified_cband, last_qualified_at, qualification_source')
      .eq('address_line1', address_line1)
      .eq('city', city)
      .eq('zip_code', zip_code)
      .maybeSingle()

    if (checkError) {
      console.error('Database check error:', checkError)
    }

    let anchorAddressId: string;

    if (existingAddress) {
      // Address exists, use existing ID
      anchorAddressId = existingAddress.id
      console.log('Using existing address:', anchorAddressId)
    } else {
      // Insert new address into anchor_address table
      const { data: newAddress, error: insertError } = await supabase
        .from('anchor_address')
        .insert({
          address_line1,
          address_line2: address_line2 || null,
          city,
          state,
          zip_code,
          latitude,
          longitude,
          status: 'active'
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Address insert error:', insertError)
        throw new Error('Failed to save address')
      }

      anchorAddressId = newAddress.id
      console.log('Created new address:', anchorAddressId)
    }

    // Step 1: Try Verizon API first
    let qualificationResult = null;
    let source = 'none';

    try {
      console.log('📡 Verizon API Called')
      
      // Mock Verizon API call - replace with actual Verizon API integration
      const verizonResponse = await callVerizonAPI({
        address_line1,
        city,
        state,
        zip_code,
        latitude,
        longitude
      });

      if (verizonResponse.success && verizonResponse.qualified) {
        qualificationResult = {
          qualified: true,
          network_type: verizonResponse.network_type || '5G_HOME',
          coverage_type: 'OUTDOOR',
          max_speed_mbps: verizonResponse.max_speed_mbps || 300,
          source: 'verizon',
          raw_data: verizonResponse
        };
        source = 'verizon';
        console.log('✅ Verizon qualification successful')
      } else {
        console.log('❌ Verizon qualification failed, trying bot fallback')
        throw new Error('Verizon API returned unqualified or failed')
      }
    } catch (verizonError) {
      console.log('🤖 Bot Fallback Used')
      
      // Step 2: Fall back to bot logic
      const botResult = await callBotFallback({
        address_line1,
        city,
        state,
        zip_code,
        latitude,
        longitude
      });

      qualificationResult = {
        qualified: botResult.qualified,
        network_type: botResult.network_type || '5G_HOME',
        coverage_type: 'BOT_ANALYZED',
        max_speed_mbps: botResult.max_speed_mbps || 200,
        source: 'bot',
        raw_data: botResult
      };
      source = 'bot';
      console.log('✅ Bot qualification completed')
    }

    // Update the anchor_address with qualification results
    const updateData: any = {
      qualified_cband: qualificationResult.qualified,
      last_qualified_at: new Date().toISOString(),
      qualification_source: source
    };

    if (source === 'verizon') {
      updateData.raw_verizon_data = qualificationResult.raw_data;
    } else if (source === 'bot') {
      updateData.raw_bot_data = qualificationResult.raw_data;
    }

    const { error: updateError } = await supabase
      .from('anchor_address')
      .update(updateData)
      .eq('id', anchorAddressId)

    if (updateError) {
      console.error('Address update error:', updateError)
    }

    console.log('✅ Qualification complete:', {
      qualified: qualificationResult.qualified,
      source: source,
      anchor_address_id: anchorAddressId
    })

    return new Response(
      JSON.stringify({
        success: true,
        qualified: qualificationResult.qualified,
        network_type: qualificationResult.network_type,
        source: source,
        anchor_address_id: anchorAddressId,
        raw_data: qualificationResult.raw_data
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('FWA check error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        source: 'none'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})

// Mock Verizon API function - replace with actual implementation
async function callVerizonAPI(addressData: any) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock response - 60% success rate for demo
  const success = Math.random() > 0.4;
  
  if (success) {
    return {
      success: true,
      qualified: Math.random() > 0.3, // 70% qualification rate
      network_type: '5G_HOME',
      max_speed_mbps: 300,
      coverage_level: 'STRONG',
      service_availability: true
    };
  } else {
    throw new Error('Verizon API unavailable');
  }
}

// Bot fallback function
async function callBotFallback(addressData: any) {
  console.log('🤖 Running bot analysis for:', addressData.city, addressData.state);
  
  // Simulate bot processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Bot logic - higher qualification rate as fallback
  const qualified = Math.random() > 0.2; // 80% qualification rate for bot
  
  return {
    qualified,
    network_type: '5G_HOME',
    max_speed_mbps: qualified ? 200 : 0,
    analysis_method: 'geographic_proximity',
    confidence_score: Math.floor(Math.random() * 30) + 70, // 70-100%
    bot_version: '1.0'
  };
}
