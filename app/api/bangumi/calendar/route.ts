import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure the route is re-fetched on every request

export async function GET() {
  // --- Start Test Code ---
  console.log('[API Bangumi Calendar TEST] Route handler reached!');
  return NextResponse.json({ message: "Calendar API test successful!" });
  // --- End Test Code ---
/* 
  // Original code commented out for testing
  const apiUrl = 'https://api.bgm.tv/calendar';
  const userAgent = 'yukito0209/my-personal-docs (https://github.com/yukito0209/my-personal-docs)'; // Recommended User-Agent format

  try {
    console.log(`[API Bangumi Calendar] Fetching from ${apiUrl}`);
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json', // Request JSON response
      },
      // Optional: Revalidate cache every hour, adjust as needed
      next: { revalidate: 3600 } 
    });

    console.log(`[API Bangumi Calendar] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Bangumi Calendar] Error fetching calendar data: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json({ error: `Failed to fetch Bangumi calendar: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    console.log('[API Bangumi Calendar] Data fetched successfully.');
    // console.log('[API Bangumi Calendar] Sample data:', JSON.stringify(data[0], null, 2)); // Log first day's data for inspection

    // You might want to filter or transform the data here if needed
    // For now, just return the raw data

    return NextResponse.json(data);

  } catch (error) {
    console.error('[API Bangumi Calendar] Exception caught:', error);
    return NextResponse.json({ error: 'Internal server error while fetching Bangumi calendar' }, { status: 500 });
  }
*/
} 