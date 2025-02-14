
import { supabase } from "@/integrations/supabase/client";

export type LocationInfo = {
  country_code: string;
  city?: string;
  region?: string;
  is_brazil: boolean;
  detected_by: 'vercel' | 'browser' | 'fallback';
};

const getBrowserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });
  });
};

const getCountryFromCoordinates = async (latitude: number, longitude: number): Promise<LocationInfo> => {
  try {
    const response = await fetch('/api/geo');
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data = await response.json();
    
    return {
      country_code: data.country || 'US',
      city: data.city,
      region: data.region,
      is_brazil: (data.country === 'BR'),
      detected_by: 'browser'
    };
  } catch (error) {
    console.error('Error getting country from coordinates:', error);
    throw error;
  }
};

export const detectUserLocation = async (): Promise<LocationInfo> => {
  try {
    // First try: Local API geolocation
    try {
      const response = await fetch('/api/geo', {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Location detected by API:', data);
      
      return {
        country_code: data.country || 'US',
        city: data.city,
        region: data.region,
        is_brazil: data.country === 'BR',
        detected_by: 'vercel'
      };
    } catch (error) {
      console.error('API geolocation failed:', error);
    }

    // Second try: Browser Geolocation API
    try {
      console.log('Trying browser geolocation...');
      const position = await getBrowserLocation();
      const locationInfo = await getCountryFromCoordinates(
        position.coords.latitude,
        position.coords.longitude
      );
      console.log('Location detected by browser:', locationInfo);
      return locationInfo;
    } catch (error) {
      console.error('Browser geolocation failed:', error);
    }

    // Ultimate fallback: Default to US
    console.log('Using fallback location');
    return {
      country_code: 'US',
      is_brazil: false,
      detected_by: 'fallback'
    };
  } catch (error) {
    console.error('All location detection methods failed:', error);
    return {
      country_code: 'US',
      is_brazil: false,
      detected_by: 'fallback'
    };
  }
};

export const saveLocationAnalytics = async (locationInfo: LocationInfo) => {
  try {
    const { error } = await supabase
      .from('location_analytics')
      .insert([{
        country_code: locationInfo.country_code,
        city: locationInfo.city,
        region: locationInfo.region,
        is_brazil: locationInfo.is_brazil,
        detected_by: locationInfo.detected_by
      }]);

    if (error) {
      console.error('Error saving location analytics:', error);
      throw error;
    }
    
    console.log('Location analytics saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving location analytics:', error);
    throw error;
  }
};
