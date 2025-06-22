
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
      email, 
      first_name, 
      last_name, 
      anchor_address_id, 
      started_at, 
      status 
    } = await req.json()
    
    console.log('Save lead request:', { 
      email, 
      first_name, 
      last_name, 
      anchor_address_id, 
      started_at, 
      status 
    })

    // Validate required fields
    if (!email || !first_name || !last_name) {
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

    // Create or update lead in leads_fresh table
    const leadData: any = {
      email,
      first_name,
      last_name,
      started_at: started_at || new Date().toISOString(),
      status: status || 'started',
      lead_type: 'address_check',
      qualified: false
    };

    // Include anchor_address_id reference if provided
    if (anchor_address_id) {
      // Update the anchor_address with first_lead_id if not already set
      const { error: updateError } = await supabase
        .from('anchor_address')
        .update({ first_lead_id: null }) // We'll set this after creating the lead
        .eq('id', anchor_address_id)
        .is('first_lead_id', null);

      if (updateError) {
        console.log('Note: Could not update anchor_address first_lead_id (may already be set):', updateError);
      }
    }

    const { data: leadResult, error: leadError } = await supabase
      .from('leads_fresh')
      .upsert(leadData, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (leadError) {
      console.error('Error saving lead:', leadError)
      throw leadError
    }

    // Now update anchor_address with the lead_id if anchor_address_id was provided
    if (anchor_address_id) {
      const { error: linkError } = await supabase
        .from('anchor_address')
        .update({ first_lead_id: leadResult.id })
        .eq('id', anchor_address_id)
        .is('first_lead_id', null); // Only update if not already set

      if (linkError) {
        console.log('Note: Could not link lead to anchor_address (may already be linked):', linkError);
      } else {
        console.log('✅ Linked lead to anchor_address');
      }
    }

    console.log('✅ Lead saved successfully:', leadResult.id)

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
    console.error('Save lead error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message
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
