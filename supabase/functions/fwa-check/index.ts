
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
      .select('id, qualified_cband, last_qualified_at')
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

    // Mock Verizon API call - replace with actual Verizon API integration
    const mockVerizonResponse = {
      qualified: Math.random() > 0.3, // 70% qualification rate for demo
      network_type: '5G_HOME',
      coverage_type: 'OUTDOOR',
      max_speed_mbps: 300,
      source: Math.random() > 0.5 ? 'verizon' : 'bot', // Randomly assign source for demo
      raw_data: {
        address_validated: true,
        service_availability: true,
        signal_strength: 'STRONG'
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update the anchor_address with qualification results
    const { error: updateError } = await supabase
      .from('anchor_address')
      .update({
        qualified_cband: mockVerizonResponse.qualified,
        last_qualified_at: new Date().toISOString(),
        raw_verizon_data: mockVerizonResponse
      })
      .eq('id', anchorAddressId)

    if (updateError) {
      console.error('Address update error:', updateError)
    }

    console.log('Verizon API response:', mockVerizonResponse)

    return new Response(
      JSON.stringify({
        success: true,
        qualified: mockVerizonResponse.qualified,
        network_type: mockVerizonResponse.network_type,
        source: mockVerizonResponse.source,
        anchor_address_id: anchorAddressId,
        raw_data: mockVerizonResponse
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
