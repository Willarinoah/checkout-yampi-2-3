import { supabase } from "@/integrations/supabase/client";

type LocationInfo = {
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
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    const data = await response.json();
    
    return {
      country_code: data.countryCode,
      city: data.city,
      region: data.principalSubdivision,
      is_brazil: data.countryCode === 'BR',
      detected_by: 'browser'
    };
  } catch (error) {
    console.error('Error getting country from coordinates:', error);
    throw error;
  }
};

export const detectUserLocation = async (): Promise<LocationInfo> => {
  try {
    // First try: Vercel Edge Runtime geolocation
    const response = await fetch('/api/geo');
    if (response.ok) {
      const data = await response.json();
      console.log('Location detected by Vercel:', data);
      return {
        country_code: data.country,
        city: data.city,
        region: data.region,
        is_brazil: data.country === 'BR',
        detected_by: 'vercel'
      };
    }
  } catch (error) {
    console.error('Vercel geolocation failed:', error);
  }

  try {
    // Second try: Browser Geolocation API
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

  // Final fallback: Default to US
  console.log('Using fallback location');
  return {
    country_code: 'US',
    is_brazil: false,
    detected_by: 'fallback'
  };
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