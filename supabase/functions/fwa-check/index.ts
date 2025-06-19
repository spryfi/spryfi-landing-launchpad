
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

    const { address, place_id, latitude, longitude } = await req.json()
    
    console.log('FWA check request:', { address, place_id, latitude, longitude })

    // Mock Verizon API call - replace with actual Verizon API integration
    const mockVerizonResponse = {
      qualified: Math.random() > 0.3, // 70% qualification rate for demo
      network_type: '5G_HOME',
      coverage_type: 'OUTDOOR',
      max_speed_mbps: 300,
      raw_data: {
        address_validated: true,
        service_availability: true,
        signal_strength: 'STRONG'
      }
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Verizon API response:', mockVerizonResponse)

    return new Response(
      JSON.stringify({
        success: true,
        qualified: mockVerizonResponse.qualified,
        network_type: mockVerizonResponse.network_type,
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
