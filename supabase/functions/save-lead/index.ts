
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

    const { email, first_name, last_name, started_at } = await req.json()
    
    console.log('Save lead request:', { email, first_name, last_name, started_at })

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
    const { data: leadData, error: leadError } = await supabase
      .from('leads_fresh')
      .upsert({
        email,
        first_name,
        last_name,
        started_at: started_at || new Date().toISOString(),
        status: 'new',
        lead_type: 'address_check',
        qualified: false,
        flow_completed: false
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (leadError) {
      console.error('Error saving lead:', leadError)
      throw leadError
    }

    console.log('✅ Lead saved successfully:', leadData.id)

    return new Response(
      JSON.stringify({
        success: true,
        lead_id: leadData.id
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
