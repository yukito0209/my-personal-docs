import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure the route is re-fetched on every request

export async function GET() {

  const apiUrl = 'https://api.bgm.tv/calendar';
  const userAgent = 'yukito0209/my-personal-docs (https://github.com/yukito0209/my-personal-docs)'; // Recommended User-Agent format

  try {
    console.log(`[API Bangumi Calendar] Fetching from external API: ${apiUrl}`); // Added log
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json', // Request JSON response
      },
      // Disable fetch caching for this request to always get fresh data
      cache: 'no-store'
    });

    console.log(`[API Bangumi Calendar] External API Response status: ${response.status}`); // Added log

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Bangumi Calendar] Error fetching data from external API: ${response.status} ${response.statusText}`, errorText);
      // Return a 502 Bad Gateway error if the external API fails
      return NextResponse.json({ error: `Failed to fetch data from Bangumi API: ${response.statusText}` }, { status: 502 });
    }

    const data = await response.json();
    console.log('[API Bangumi Calendar] External data fetched successfully.');
    
    // Return the actual data
    return NextResponse.json(data);

  } catch (error) {
    console.error('[API Bangumi Calendar] Exception caught during external API fetch:', error); // Added log
    return NextResponse.json({ error: 'Internal server error while fetching Bangumi calendar' }, { status: 500 });
  }
} 