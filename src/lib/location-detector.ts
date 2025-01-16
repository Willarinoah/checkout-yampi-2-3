interface LocationInfo {
  is_brazil: boolean;
  city?: string;
  region?: string;
  country?: string;
  detected_by?: string;
  ip?: string;
}

export const detectUserLocation = async (): Promise<LocationInfo> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      is_brazil: data.country_code === 'BR',
      city: data.city,
      region: data.region,
      country: data.country_name,
      detected_by: 'ipapi',
      ip: data.ip
    };
  } catch (error) {
    console.error('Error detecting location:', error);
    return { is_brazil: false, detected_by: 'fallback' };
  }
};

export const saveLocationAnalytics = async (info: LocationInfo) => {
  // Implementar quando necessário
  console.log('Location info:', info);
};