import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const USERNAME = 'euphonya'; // Your Bangumi username

// Define the expected structure for collection items (adapt as needed)
interface CollectionItem {
  name: string;
  subject_id: number;
  ep_status: number; // User's watched episode count
  vol_status: number; // Not relevant for anime usually
  lasttouch: number; // Timestamp
  subject: {
    id: number;
    url: string;
    type: number; // Should be 2 for anime
    name: string;
    name_cn: string;
    summary: string;
    eps: number; // Total episodes (might be 0 if unknown)
    eps_count: number; // Alias for total episodes
    air_date: string;
    air_weekday: number;
    rating: {
      total: number;
      count: { [key: string]: number };
      score: number;
    } | null;
    rank: number | null;
    images: {
      large: string;
      common: string;
      medium: string;
      small: string;
      grid: string;
    } | null;
    collection: {
      wish: number;
      collect: number;
      doing: number; // Watching count
      on_hold: number;
      dropped: number;
    };
  };
}

// Define the expected structure for the collection response
interface CollectionResponse {
  data: CollectionItem[];
  total: number;
  limit: number;
  offset: number;
}


export async function GET(request: Request) {
  // Construct the API URL for fetching "watching" (type=3) anime (subject_type=2)
  // Using limit=50 as a reasonable default, adjust if needed
  const apiUrl = `https://api.bgm.tv/v0/users/${USERNAME}/collections?subject_type=2&type=3&limit=50&offset=0`;
  const userAgent = 'yukito0209/my-personal-docs (https://github.com/yukito0209/my-personal-docs)';

  try {
    console.log(`[API Bangumi Watching] Fetching from ${apiUrl}`);
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': 'application/json',
      },
      // Cache for a shorter duration maybe, e.g., 15 minutes
      next: { revalidate: 900 } 
    });

    console.log(`[API Bangumi Watching] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Bangumi Watching] Error fetching watching data: ${response.status} ${response.statusText}`, errorText);
      return NextResponse.json({ error: `Failed to fetch Bangumi watching list: ${response.statusText}` }, { status: response.status });
    }

    const data: CollectionResponse = await response.json();
    console.log(`[API Bangumi Watching] Data fetched successfully. Total: ${data.total}`);

    // Return only the 'data' array which contains the list of collections
    return NextResponse.json(data.data || []); // Return empty array if data is missing

  } catch (error) {
    console.error('[API Bangumi Watching] Exception caught:', error);
    return NextResponse.json({ error: 'Internal server error while fetching Bangumi watching list' }, { status: 500 });
  }
} 