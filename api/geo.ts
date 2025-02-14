
export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    // Simplified version without geolocation since we can't rely on it in dev
    const locationData = {
      country: 'BR', // Default to Brazil for testing
      city: 'São Paulo',
      region: 'SP',
      ip: request.headers.get('x-forwarded-for') || '0.0.0.0',
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
