
import { geolocation, ipAddress } from '@vercel/edge';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const geo = geolocation(request);
    const ip = ipAddress(request);

    const locationData = {
      country: geo.country,
      city: geo.city,
      region: geo.countryRegion,
      ip,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(locationData), {
      headers: {
        'content-type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error in geo detection:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to detect location',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}
