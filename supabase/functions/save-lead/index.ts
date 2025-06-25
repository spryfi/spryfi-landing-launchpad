
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

    const body = await req.json()
    console.log('📥 save-lead input:', body)

    const { 
      email, 
      first_name, 
      last_name, 
      anchor_address_id
    } = body
    
    // Validate required fields
    if (!email || !first_name || !last_name) {
      console.error('❌ Missing required fields:', { email: !!email, first_name: !!first_name, last_name: !!last_name })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email, first name, and last name are required'
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

    // Check if lead already exists
    const { data: existingLead, error: checkError } = await supabase
      .from('leads_fresh')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (checkError) {
      console.error('🔥 Check existing lead error:', checkError)
      throw checkError
    }

    let leadResult;

    if (existingLead) {
      // Update existing lead
      console.log('📝 Updating existing lead:', existingLead.id)
      
      const updateData: any = {
        first_name,
        last_name,
        status: 'started',
        lead_type: 'address_check',
        qualified: false
      };

      // Only include anchor_address_id if it's provided and not already set
      if (anchor_address_id) {
        updateData.anchor_address_id = anchor_address_id;
      }

      const { data: updatedLead, error: updateError } = await supabase
        .from('leads_fresh')
        .update(updateData)
        .eq('id', existingLead.id)
        .select()
        .single()

      if (updateError) {
        console.error('🔥 Update lead error:', updateError)
        throw updateError
      }

      leadResult = updatedLead;
    } else {
      // Create new lead
      const leadData: any = {
        email,
        first_name,
        last_name,
        status: 'started',
        lead_type: 'address_check',
        qualified: false
      };

      // Only include anchor_address_id if it's provided
      if (anchor_address_id) {
        leadData.anchor_address_id = anchor_address_id;
      }

      console.log('💾 Inserting new lead data:', leadData)

      const { data: newLead, error: insertError } = await supabase
        .from('leads_fresh')
        .insert(leadData)
        .select()
        .single()

      if (insertError) {
        console.error('🔥 Insert lead error:', insertError)
        throw insertError
      }

      leadResult = newLead;
    }

    console.log('✅ Lead saved successfully:', leadResult.id)

    // Now update anchor_address with the lead_id if anchor_address_id was provided
    if (anchor_address_id) {
      const { error: linkError } = await supabase
        .from('anchor_address')
        .update({ first_lead_id: leadResult.id })
        .eq('id', anchor_address_id)
        .is('first_lead_id', null); // Only update if not already set

      if (linkError) {
        console.log('⚠️ Could not link lead to anchor_address (may already be linked):', linkError);
      } else {
        console.log('🔗 Linked lead to anchor_address');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadResult.id
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('🔥 Save lead error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error'
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
