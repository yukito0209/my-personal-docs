'use client'; // <-- Mark as a Client Component

import dynamic from 'next/dynamic';

// Dynamically import BangumiWidget only on the client-side
const BangumiWidget = dynamic(
  () => import('./BangumiWidget'), // Import the actual widget
  { 
    ssr: false, // Disable Server-Side Rendering
    // Define the loading state here
    loading: () => (
      <div className="rounded-lg border bg-card shadow-sm glass-effect h-[600px]">
        <div className="p-4 h-full flex items-center justify-center">
          <p className='text-sm text-muted-foreground'>加载 Bangumi 小部件...</p>
        </div>
      </div>
    )
  }
);

// Export the dynamically loaded component
export default function DynamicBangumiWidget() {
  // Render the dynamically loaded BangumiWidget
  // Pass any necessary props here if BangumiWidget expected them from page.tsx initially
  // In this case, initialCalendarData and calendarError were null anyway in page.tsx
  return <BangumiWidget initialCalendarData={null} calendarError={null} />;
} 