
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
      lead_id,
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
      lead_id,
      google_place_id, 
      formatted_address, 
      address_line1, 
      city, 
      state, 
      zip_code, 
      latitude, 
      longitude 
    })

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
      
      // Update first_lead_id if provided and not already set
      if (lead_id) {
        const { error: updateLeadError } = await supabase
          .from('anchor_address')
          .update({ first_lead_id: lead_id })
          .eq('id', anchorAddressId)
          .is('first_lead_id', null) // Only update if not already set

        if (updateLeadError) {
          console.error('Error updating first_lead_id:', updateLeadError)
        } else {
          console.log('✅ Updated anchor address with lead ID')
        }
      }
    } else {
      // Insert new address into anchor_address table
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

      // Set first_lead_id if provided
      if (lead_id) {
        insertData.first_lead_id = lead_id
      }

      const { data: newAddress, error: insertError } = await supabase
        .from('anchor_address')
        .insert(insertData)
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
      console.log('📡 Calling Verizon API...')
      
      const verizonResponse = await callVerizonAPI({
        address_line1,
        city,
        state,
        zip_code,
        latitude,
        longitude
      });

      console.log('📡 Verizon API raw response:', JSON.stringify(verizonResponse, null, 2));

      // Fixed: Parse Verizon response correctly - qualified is a string, not boolean
      const isQualified = verizonResponse?.intelligenceResponse?.wirelessCoverages?.fwaCoverage?.[0]?.coverage?.qualified === 'true';
      
      console.log('📡 Verizon qualification result:', { 
        isQualified, 
        qualified: verizonResponse?.intelligenceResponse?.wirelessCoverages?.fwaCoverage?.[0]?.coverage?.qualified,
        apiSuccess: verizonResponse.success 
      });

      // Only proceed with Verizon result if API call was successful
      if (verizonResponse.success) {
        if (isQualified) {
          // Verizon qualified - use this result and do NOT fall back to bot
          qualificationResult = {
            qualified: true,
            network_type: '5G_HOME',
            coverage_type: 'OUTDOOR',
            max_speed_mbps: 300,
            source: 'verizon',
            raw_data: verizonResponse
          };
          source = 'verizon';
          console.log('✅ Verizon qualification successful - QUALIFIED (sapi1)')
        } else {
          // Verizon explicitly said not qualified - fallback to bot
          console.log('❌ Verizon said not qualified, trying bot fallback')
          throw new Error('Verizon said not qualified, trying bot')
        }
      } else {
        console.log('❌ Verizon API failed, trying bot fallback')
        throw new Error('Verizon API call failed')
      }
    } catch (verizonError) {
      console.log('🤖 Verizon failed/unavailable, using Bot Fallback')
      
      // Step 2: Fall back to bot logic only if Verizon API failed or returned not qualified
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
          address_line1,
          address_line2,
          city,
          state,
          zip_code
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
  
  // Mock realistic Verizon API response structure
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
