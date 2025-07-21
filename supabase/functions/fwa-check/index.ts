
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
    
    // Extract address fields from request body for GIS API call
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

    // Support both nested and flat address payloads (defensive coding)
    let gisAddress = { address_line1, city, state, zip_code };
    if (body.address) {
      // If sent as { address: {...} }
      gisAddress = {
        address_line1: body.address.address_line1,
        city: body.address.city,
        state: body.address.state,
        zip_code: body.address.zip_code
      };
    }

    // Validate all required fields for GIS API
    if (!gisAddress.address_line1 || !gisAddress.city || !gisAddress.state || !gisAddress.zip_code) {
      console.error("❌ Missing required address fields for GIS API!", gisAddress);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing address fields for qualification",
          received_fields: gisAddress
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

    console.log("✅ Address fields extracted for GIS API:", gisAddress);

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

    // Step 1: Call GIS API for qualification
    let qualificationResult = null;
    let source = 'gis';

    try {
      console.log('📡 Calling GIS-powered API endpoint...')
      console.log('🌍 About to call GIS API with validated address data:', gisAddress);
      
      const gisResponse = await callGisAPI(gisAddress);

      console.log('📡 GIS API raw response:', JSON.stringify(gisResponse, null, 2));

      // Extract minsignal from attributes for qualification
      const attributes = gisResponse?.attributes || {};
      const minsignal = attributes?.minsignal;
      
      let qualified = false;
      let qualificationReason = 'No signal data available';

      // Qualification logic: minsignal must be a number >= -100
      if (typeof minsignal === 'number' && minsignal >= -100) {
        qualified = true;
        qualificationReason = `Signal strength ${minsignal} dBm meets qualification criteria (≥ -100 dBm)`;
      } else if (typeof minsignal === 'number') {
        qualified = false;
        qualificationReason = `Signal strength ${minsignal} dBm does not meet qualification criteria (< -100 dBm)`;
      } else {
        qualified = false;
        qualificationReason = `No valid signal data available (minsignal: ${minsignal})`;
      }

      console.log('📡 GIS qualification result:', { 
        qualified, 
        minsignal,
        qualificationReason,
        attributesReceived: !!attributes,
        fullAttributes: attributes
      });

      // Save GIS qualification data to database
      let gisQualificationId = null;
      if (attributes && Object.keys(attributes).length > 0) {
        try {
          const { data: gisQual, error: gisError } = await supabase
            .from('gis_qualifications')
            .insert({
              anchor_address_id: anchorAddressId,
              fid: attributes.fid || null,
              providerid: attributes.providerid ? String(attributes.providerid) : null,
              technology: attributes.technology ? String(attributes.technology) : null,
              minup: attributes.minup || null,
              mindown: attributes.mindown || null,
              minsignal: attributes.minsignal || null,
              brandname: attributes.brandname || null,
              raw_attributes: attributes,
              qualified: qualified,
              qualification_reason: qualificationReason
            })
            .select('id')
            .single();

          if (gisError) {
            console.error('Error saving GIS qualification:', gisError);
          } else {
            gisQualificationId = gisQual.id;
            console.log('✅ GIS qualification saved with ID:', gisQualificationId);
          }
        } catch (saveError) {
          console.error('Error saving GIS data:', saveError);
        }
      }

      qualificationResult = {
        qualified: qualified,
        minsignal: minsignal,
        network_type: qualified ? (gisResponse?.network_type || '5G_HOME') : null,
        source: 'gis',
        attributes: attributes,
        raw_data: gisResponse,
        qualification_reason: qualificationReason,
        gis_qualification_id: gisQualificationId
      };

      console.log('✅ GIS qualification completed:', { 
        qualified, 
        minsignal, 
        source: 'gis',
        networkType: qualificationResult.network_type 
      });

    } catch (gisError) {
      console.error('❌ GIS API call failed:', gisError);
      
      // If GIS fails, mark as not qualified
      qualificationResult = {
        qualified: false,
        minsignal: null,
        network_type: null,
        source: 'gis',
        attributes: {},
        raw_data: null,
        qualification_reason: `GIS service error: ${gisError.message}`,
        error: gisError.message
      };
      
      console.log('❌ GIS qualification failed - marking as not qualified');
    }

    console.log('📡 Final qualification result:', { 
      qualified: qualificationResult.qualified, 
      minsignal: qualificationResult.minsignal,
      source: qualificationResult.source 
    });

    // Update the anchor_address with qualification results
    const updateData: any = {
      qualified_cband: qualificationResult.qualified,
      last_qualified_at: new Date().toISOString(),
      qualification_source: source,
      gis_qualified: qualificationResult.qualified,
      gis_minsignal: qualificationResult.minsignal,
      gis_checked_at: new Date().toISOString(),
      gis_qualification_id: qualificationResult.gis_qualification_id
    };

    if (source === 'gis') {
      updateData.gis_coverage_attributes = qualificationResult.raw_data?.attributes || null;
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
        minsignal: qualificationResult.minsignal,
        network_type: qualificationResult.network_type,
        brandname: qualificationResult.brandname,
        attributes: qualificationResult.attributes,
        source: source,
        anchor_address_id: anchorAddressId,
        raw_data: qualificationResult.raw_data,
        qualification_reason: qualificationResult.qualification_reason,
        timestamp: new Date().toISOString()
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

// GIS-powered FastAPI function
async function callGisAPI(addressData: any) {
  console.log('🌍 Calling GIS FastAPI endpoint for:', addressData);
  
  try {
    console.log('🚀 CRITICAL: About to make fetch call to https://fwa.spry.network/api/fwa-check');
    console.log('🚀 CRITICAL: Payload being sent:', JSON.stringify({
      address_line1: addressData.address_line1,
      city: addressData.city,
      state: addressData.state,
      zip_code: addressData.zip_code
    }, null, 2));
    
    const response = await fetch('https://fwa.spry.network/api/fwa-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address_line1: addressData.address_line1,
        city: addressData.city,
        state: addressData.state,
        zip_code: addressData.zip_code
      })
    });

    if (!response.ok) {
      throw new Error(`GIS API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ GIS API response received:', data);
    
    return data;
  } catch (error) {
    console.error('❌ GIS API call failed:', error);
    throw error;
  }
}
