
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

    console.log('🔄 Starting drip marketing enrollment process...')

    // Find incomplete leads that should be enrolled in drip marketing
    const { data: incompleteLeads, error: fetchError } = await supabase
      .from('leads_fresh')
      .select(`
        id,
        email,
        first_name,
        last_name,
        qualified,
        started_at,
        flow_completed
      `)
      .is('flow_completed', false)
      .lt('started_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // 30 minutes ago
      .not('email', 'is', null)

    if (fetchError) {
      console.error('Error fetching incomplete leads:', fetchError)
      throw fetchError
    }

    if (!incompleteLeads || incompleteLeads.length === 0) {
      console.log('📭 No incomplete leads found for drip enrollment')
      return new Response(
        JSON.stringify({
          success: true,
          enrolled_count: 0,
          message: 'No incomplete leads found'
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    console.log(`📋 Found ${incompleteLeads.length} potential leads for drip enrollment`)

    let enrolledCount = 0

    // Process each incomplete lead
    for (const lead of incompleteLeads) {
      try {
        // Check if lead already exists in drip_marketing
        const { data: existingDrip } = await supabase
          .from('drip_marketing')
          .select('id')
          .eq('lead_id', lead.id)
          .single()

        if (existingDrip) {
          console.log(`⏭️ Lead ${lead.email} already in drip marketing`)
          continue
        }

        // Check if lead has become a customer
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', lead.email)
          .single()

        if (existingCustomer) {
          console.log(`👤 Lead ${lead.email} is already a customer, skipping`)
          continue
        }

        // Check for active subscriptions
        const { data: existingSubscription } = await supabase
          .from('customer_subscriptions')
          .select('id')
          .eq('customer_id', lead.id)
          .single()

        if (existingSubscription) {
          console.log(`💳 Lead ${lead.email} has active subscription, skipping`)
          continue
        }

        // Enroll in drip marketing
        const { error: insertError } = await supabase
          .from('drip_marketing')
          .insert({
            lead_id: lead.id,
            email: lead.email,
            name: `${lead.first_name} ${lead.last_name}`,
            qualified: lead.qualified || false,
            added_at: new Date().toISOString(),
            status: 'active'
          })

        if (insertError) {
          console.error(`❌ Error enrolling lead ${lead.email}:`, insertError)
          continue
        }

        console.log(`✅ Enrolled ${lead.email} into drip marketing`)
        enrolledCount++

      } catch (error) {
        console.error(`❌ Error processing lead ${lead.email}:`, error)
        continue
      }
    }

    console.log(`🎯 Drip enrollment complete: ${enrolledCount} leads enrolled`)

    return new Response(
      JSON.stringify({
        success: true,
        enrolled_count: enrolledCount,
        processed_leads: incompleteLeads.length
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('❌ Drip enrollment error:', error)
    
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
