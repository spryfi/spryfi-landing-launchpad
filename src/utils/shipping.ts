import { supabase } from '@/integrations/supabase/client';

interface ShippingRate {
  cost: number;
  estimatedDays: string;
  zoneName: string;
}

interface ShippingOrigin {
  city: string;
  state: string;
  zip: string;
}

// Cache for shipping data
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = async <T>(key: string, fetchFunction: () => Promise<T>): Promise<T> => {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetchFunction();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

export const getShippingRate = async (state: string): Promise<ShippingRate> => {
  return getCachedData(`shipping-${state}`, async () => {
    try {
      // First try to find shipping zone that contains this state
      const { data: zones, error: zoneError } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('active', true);

      if (zoneError) throw zoneError;

      // Find the zone that contains this state
      const zone = zones?.find(z => z.states?.includes(state));

      if (zone) {
        return {
          cost: zone.base_cost,
          estimatedDays: zone.estimated_days,
          zoneName: zone.name
        };
      }

      // Fallback: try to get a default shipping rate
      const { data: defaultZone, error: defaultError } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('active', true)
        .eq('is_default', true)
        .single();

      if (defaultError) throw defaultError;

      return {
        cost: defaultZone.base_cost,
        estimatedDays: defaultZone.estimated_days,
        zoneName: defaultZone.name
      };

    } catch (error) {
      console.error('Error fetching shipping rate:', error);
      
      // Hard fallback based on state zones
      const shippingZones = {
        zone1: { states: ['TX', 'OK', 'AR', 'LA', 'NM'], rate: 12.95, days: '3' },
        zone2: { states: ['AZ', 'CA', 'NV', 'UT', 'CO', 'KS', 'MO', 'TN', 'MS', 'AL', 'GA', 'FL'], rate: 16.95, days: '5' },
        zone3: { states: ['WA', 'OR', 'ID', 'MT', 'WY', 'ND', 'SD', 'NE', 'IA', 'IL', 'IN', 'OH', 'KY', 'WV', 'VA', 'NC', 'SC'], rate: 19.95, days: '7' },
        zone4: { states: ['AK', 'HI', 'ME', 'VT', 'NH', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'DC'], rate: 24.95, days: '10' }
      };

      for (const [zoneName, zone] of Object.entries(shippingZones)) {
        if (zone.states.includes(state)) {
          return {
            cost: zone.rate,
            estimatedDays: zone.days,
            zoneName: `Zone ${zoneName.slice(-1)} Shipping`
          };
        }
      }

      // Ultimate fallback
      return {
        cost: 16.95,
        estimatedDays: '5',
        zoneName: 'Standard Shipping'
      };
    }
  });
};

export const getShippingOrigin = async (): Promise<ShippingOrigin> => {
  return getCachedData('shipping-origin', async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['shipping_origin_city', 'shipping_origin_state', 'shipping_origin_zip']);

      if (error) throw error;

      const origin: Partial<ShippingOrigin> = {};
      data?.forEach(setting => {
        if (setting.key === 'shipping_origin_city') origin.city = setting.value;
        if (setting.key === 'shipping_origin_state') origin.state = setting.value;
        if (setting.key === 'shipping_origin_zip') origin.zip = setting.value;
      });

      // Return with defaults if any values are missing
      return {
        city: origin.city || 'Austin',
        state: origin.state || 'TX',
        zip: origin.zip || '78701'
      };
    } catch (error) {
      console.error('Error fetching shipping origin:', error);
      return { city: 'Austin', state: 'TX', zip: '78701' };
    }
  });
};