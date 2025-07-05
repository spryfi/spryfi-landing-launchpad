
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
    console.log("📬 Received request to /fwa-check");
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log("Request body:", body);
    
    const { 
      lead_id,
      anchor_address_id,
      google_place_id, 
      formatted_address, 
      address_line1, 
      address_line2, 
      city, 
      state, 
      zip_code, 
      latitude, 
      longitude 
    } = body

    // Validate required inputs first
    if (!lead_id && !anchor_address_id) {
      console.error("❌ Missing both lead_id and anchor_address_id");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing lead_id or anchor_address_id" 
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      )
    }

    let anchorAddressId = anchor_address_id;
    let addressData: any = null;

    // If we have anchor_address_id, fetch the address data
    if (anchor_address_id) {
      const { data: address, error: addressError } = await supabase
        .from('anchor_address')
        .select('*')
        .eq('id', anchor_address_id)
        .single()

      if (addressError || !address) {
        console.error("❌ Address lookup failed:", addressError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Anchor address not found" 
          }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            }
          }
        )
      }

      addressData = address;
      console.log("✅ Found anchor address:", address.id);
    } else if (address_line1 && city && state && zip_code) {
      // If no anchor_address_id but we have address fields, create/find the address
      console.log('📍 Creating/finding address from provided fields');
      
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

      if (existingAddress) {
        anchorAddressId = existingAddress.id
        addressData = existingAddress;
        console.log('Using existing address:', anchorAddressId)
      } else {
        // Insert new address
        const insertData: any = {
          address_line1,
          address_line2: address_line2 || null,
          city,
          state,
          zip_code,
          latitude,
          longitude,
          status: 'active'
        }

        if (lead_id) {
          insertData.first_lead_id = lead_id
        }

        const { data: newAddress, error: insertError } = await supabase
          .from('anchor_address')
          .insert(insertData)
          .select('*')
          .single()

        if (insertError) {
          console.error('Address insert error:', insertError)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to save address' 
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

        anchorAddressId = newAddress.id
        addressData = newAddress;
        console.log('Created new address:', anchorAddressId)
      }
    } else {
      console.error("❌ No anchor_address_id and insufficient address data provided");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing address information" 
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          }
        }
      )
    }

    // Verify lead exists if lead_id provided
    if (lead_id) {
      const { data: leadData, error: leadError } = await supabase
        .from('leads_fresh')
        .select('id')
        .eq('id', lead_id)
        .single()

      if (leadError) {
        console.error('Lead verification error:', leadError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid lead ID'
          }),
          { 
            status: 400,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            }
          }
        )
      }
      console.log('✅ Lead verified:', leadData.id)
    }

    // Step 1: Try SpryFi Databases first
    let qualificationResult = null;
    let source = 'none';

    try {
      console.log('📡 Checking SpryFi Databases...')
      
      const verizonResponse = await callVerizonAPI({
        address_line1: addressData.address_line1,
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zip_code,
        latitude: addressData.latitude,
        longitude: addressData.longitude
      });

      console.log('📡 SpryFi Database response:', JSON.stringify(verizonResponse, null, 2));

      // Parse response correctly - qualified is a string, not boolean
      const isQualified = verizonResponse?.intelligenceResponse?.wirelessCoverages?.fwaCoverage?.[0]?.coverage?.qualified === 'true';
      
      console.log('📡 SpryFi Database qualification result:', { 
        isQualified, 
        qualified: verizonResponse?.intelligenceResponse?.wirelessCoverages?.fwaCoverage?.[0]?.coverage?.qualified,
        apiSuccess: verizonResponse.success 
      });

      // Only proceed with SpryFi Database result if API call was successful
      if (verizonResponse.success) {
        if (isQualified) {
          // SpryFi Database qualified - use this result and do NOT fall back to bot
          qualificationResult = {
            qualified: true,
            network_type: '5G_HOME',
            coverage_type: 'OUTDOOR',
            max_speed_mbps: 300,
            source: 'verizon',
            raw_data: verizonResponse
          };
          source = 'verizon';
          console.log('✅ SpryFi Database qualification successful - QUALIFIED (sapi1)')
        } else {
          // SpryFi Database explicitly said not qualified - fallback to bot
          console.log('❌ SpryFi Database said not qualified, trying bot fallback')
          throw new Error('SpryFi Database said not qualified, trying bot')
        }
      } else {
        console.log('❌ SpryFi Database failed, trying bot fallback')
        throw new Error('SpryFi Database call failed')
      }
    } catch (verizonError) {
      console.log('🤖 SpryFi Database failed/unavailable, using Bot Fallback')
      
      // Step 2: Fall back to bot logic only if SpryFi Database failed or returned not qualified
      const botResult = await callBotFallback({
        address_line1: addressData.address_line1,
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zip_code,
        latitude: addressData.latitude,
        longitude: addressData.longitude
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
      console.log('✅ Bot qualification completed (sapi2)')
    }

    console.log('📡 Final qualification result:', { qualified: qualificationResult.qualified, source });

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

    // Update the lead with qualification results if lead_id provided
    if (lead_id) {
      const { error: leadUpdateError } = await supabase
        .from('leads_fresh')
        .update({
          qualified: qualificationResult.qualified,
          qualification_checked_at: new Date().toISOString(),
          qualification_result: source,
          anchor_address_id: anchorAddressId
        })
        .eq('id', lead_id)

      if (leadUpdateError) {
        console.error('Lead update error:', leadUpdateError)
      } else {
        console.log('✅ Lead updated with qualification results')
      }
    }

    console.log('✅ Qualification complete:', {
      qualified: qualificationResult.qualified,
      source: source,
      anchor_address_id: anchorAddressId,
      lead_id: lead_id
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
        error: error.message || 'Unknown error occurred',
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

// Mock SpryFi Database function - replace with actual implementation
async function callVerizonAPI(addressData: any) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock realistic SpryFi Database response structure
  const success = Math.random() > 0.3; // 70% success rate
  
  if (success) {
    const qualified = Math.random() > 0.4; // 60% qualification rate when API succeeds
    
    return {
      success: true,
      intelligenceResponse: {
        wirelessCoverages: {
          fwaCoverage: [{
            coverage: {
              qualified: qualified ? 'true' : 'false',
              networkType: '5G_HOME',
              maxSpeedMbps: 300,
              coverageLevel: 'STRONG'
            }
          }]
        }
      },
      serviceAvailability: true
    };
  } else {
    throw new Error('SpryFi Database unavailable');
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
