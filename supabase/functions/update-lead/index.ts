import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://spryfi-landing-launchpad.lovable.app',
  'Access-Control-Allow-Methods': 'OPTIONS, GET, POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.json()
    console.log('📥 update-lead input:', body)

    const { 
      lead_id,
      qualified,
      network_type,
      error_message,
      qualification_source,
      request_id
    } = body
    
    // Validate required fields
    if (!lead_id) {
      console.error('❌ Missing lead_id')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'lead_id is required'
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

    // Update the lead with qualification results
    const updateData: any = {
      qualification_checked_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (qualified !== undefined) {
      updateData.qualified = qualified;
    }
    
    if (network_type) {
      updateData.verizon_network_type = network_type;
    }
    
    if (qualification_source) {
      updateData.qualification_source = qualification_source;
    }

    if (error_message) {
      updateData.reason = error_message;
      updateData.status = 'error';
    } else {
      updateData.status = qualified ? 'qualified' : 'not_qualified';
    }

    console.log('💾 Updating lead with data:', updateData)

    const { data: updatedLead, error: updateError } = await supabase
      .from('leads_fresh')
      .update(updateData)
      .eq('id', lead_id)
      .select()
      .single()

    if (updateError) {
      console.error('🔥 Update lead error:', updateError)
      throw updateError
    }

    console.log('✅ Lead updated successfully:', updatedLead.id)

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: updatedLead.id,
        qualified: updatedLead.qualified
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('🔥 Update lead error:', error)
    
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