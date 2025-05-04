'use client'; // This component will use hooks like useState/useEffect for client-side logic like getting today's date

import React, { useState, useEffect, useCallback } from 'react';
import { CalendarClock, AlertCircle, Tv2, ExternalLink, Loader2, User, List } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Define interfaces based on expected API response structure
interface Weekday {
  en: string;
  cn: string;
  ja: string;
  id: number; // 1 for Monday, ..., 7 for Sunday
}

interface ImageSources {
  large: string;
  common: string;
  medium: string;
  small: string;
  grid: string;
}

interface CalendarItem {
  id: number;
  url: string;
  type: number;
  name: string;
  name_cn: string;
  summary: string;
  air_date: string;
  air_weekday: number;
  rating: {
    total: number;
    count: { [key: string]: number };
    score: number;
  } | null;
  rank: number | null;
  images: ImageSources | null;
  collection: {
    doing: number;
  } | null;
}

interface CalendarDay {
  weekday: Weekday;
  items: CalendarItem[];
}

interface WatchingSubject {
    id: number;
    url: string;
    type: number;
    name: string;
    name_cn: string;
    summary: string;
    eps: number;
    eps_count: number;
    air_date: string;
    air_weekday: number;
    score: number | null;
    images: ImageSources | null;
    collection: { doing: number };
}

interface WatchingItem {
    name: string;
    subject_id: number;
    ep_status: number;
    subject: WatchingSubject;
    rate?: number;
}

interface BangumiWidgetProps { // Renamed props interface
  initialCalendarData: CalendarDay[] | null;
  calendarError: string | null;
}

export default function BangumiWidget({ initialCalendarData, calendarError }: BangumiWidgetProps) { // Renamed component
  const [viewMode, setViewMode] = useState<'calendar' | 'watching'>('calendar');

  // Calendar State
  const [todaysData, setTodaysData] = useState<CalendarItem[] | null>(null);
  const [currentWeekday, setCurrentWeekday] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [calendarLoading] = useState(!initialCalendarData && !calendarError); // Use initial props directly
  const [calendarDisplayError, setCalendarDisplayError] = useState<string | null>(calendarError); // Local error state

  // Watching State
  const [watchingData, setWatchingData] = useState<WatchingItem[] | null>(null);
  const [watchingLoading, setWatchingLoading] = useState(false);
  const [watchingError, setWatchingError] = useState<string | null>(null);

  // --- Effects ---
  // Effect to process initial calendar data and set date/weekday
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    setCurrentDateStr(`${year}年${month}月${day}日`);

    if (initialCalendarData) {
      try {
        const jsDay = today.getDay();
        const bangumiDayId = jsDay === 0 ? 7 : jsDay;
        const todayEntry = initialCalendarData.find(day => day.weekday.id === bangumiDayId);

        if (todayEntry) {
          setTodaysData(todayEntry.items);
          setCurrentWeekday(todayEntry.weekday.cn);
        } else {
          setTodaysData([]);
          const weekdayEntry = initialCalendarData.find(day => day.weekday.id === bangumiDayId);
          setCurrentWeekday(weekdayEntry?.weekday.cn || '');
        }
        setCalendarDisplayError(null); // Clear error if processed successfully
      } catch (err) {
         console.error("Error processing Calendar data:", err);
         setCalendarDisplayError("处理放送数据时出错");
      }
    } else {
       // Handle case where initial data is null but no error (maybe still loading upstream?)
       if (!calendarError) console.log("Calendar: No initial data or error provided.");
    }
  }, [initialCalendarData, calendarError]);

  // --- Data Fetching ---
  const fetchWatchingData = useCallback(async () => {
    if (watchingData) return; // Don't refetch if already loaded

    console.log("Fetching watching data...");
    setWatchingLoading(true);
    setWatchingError(null);
    try {
       // Use relative URL, assuming fetch works correctly client-side
      const response = await fetch('/api/bangumi/watching');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch watching list (${response.status})`);
      }
      const data: WatchingItem[] = await response.json();
      setWatchingData(data.sort((a, b) => (b.subject.score ?? 0) - (a.subject.score ?? 0))); // Sort by score desc
    } catch (err) {
      console.error("Error fetching watching data:", err);
      setWatchingError(err instanceof Error ? err.message : "加载追番列表失败");
      setWatchingData([]); // Set empty array on error to stop loading indicator
    } finally {
      setWatchingLoading(false);
    }
  }, [watchingData]); // Depend on watchingData to prevent refetch

  // --- Event Handlers ---
  const handleToggleView = () => {
    const newMode = viewMode === 'calendar' ? 'watching' : 'calendar';
    setViewMode(newMode);
    if (newMode === 'watching' && !watchingData && !watchingLoading && !watchingError) {
      fetchWatchingData(); // Fetch only if switching to watching and data isn't loaded/loading/errored
    }
  };

  // --- Render Logic ---
  const renderCalendarList = () => {
    if (calendarLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    if (calendarDisplayError) return <div className="flex-1 flex flex-col items-center justify-center text-center px-4"><AlertCircle className="h-8 w-8 text-red-500 mb-2" /><p className="text-sm font-medium text-red-600">加载放送日历失败</p><p className="text-xs text-muted-foreground mt-1">{calendarDisplayError}</p></div>;
    if (!todaysData || todaysData.length === 0) return <div className="flex-1 flex items-center justify-center"><p className="text-sm text-muted-foreground">今天似乎没有新番放送</p></div>;

    return (
      <ul className="space-y-2.5 flex-1 pr-1 pb-4">
        {todaysData.map((item) => (
          <li key={`cal-${item.id}`} className="rounded-md bg-black/5 dark:bg-white/5 hover:bg-primary/10 transition-colors duration-200 group overflow-hidden">
             <Link href={`https://bgm.tv/subject/${item.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-2">
                <div className="flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                   {item.images?.common || item.images?.grid || item.images?.small ? (<Image src={item.images.common || item.images.grid || item.images.small} alt={item.name_cn || item.name} fill sizes="40px" className="object-cover" unoptimized />) : (<div className="w-full h-full flex items-center justify-center"><Tv2 className="w-5 h-5 text-muted-foreground" /></div>)}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium truncate group-hover:text-primary transition-colors" title={item.name_cn || item.name}>{item.name_cn || item.name}</p>
                   <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                     {item.rating?.score ? (<div className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-yellow-500 mr-0.5"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" /></svg><span>{item.rating.score.toFixed(1)}</span></div>) : (<span className="text-gray-400 dark:text-gray-600">-</span>)}
                     <span className="text-gray-300 dark:text-gray-600">|</span>
                     <div className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-0.5"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" /></svg><span>{item.collection?.doing ?? 0}</span></div>
                   </div>
                 </div>
                 <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto" />
             </Link>
           </li>
        ))}
      </ul>
    );
  };

  const renderWatchingList = () => {
    if (watchingLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
    if (watchingError) return <div className="flex-1 flex flex-col items-center justify-center text-center px-4"><AlertCircle className="h-8 w-8 text-red-500 mb-2" /><p className="text-sm font-medium text-red-600">加载追番列表失败</p><p className="text-xs text-muted-foreground mt-1">{watchingError}</p></div>;
    if (!watchingData || watchingData.length === 0) return <div className="flex-1 flex items-center justify-center"><p className="text-sm text-muted-foreground">你还没有在追的番剧</p></div>;

    return (
      <ul className="space-y-2.5 flex-1 overflow-y-auto pr-1 pb-4">
        {watchingData.map((item) => (
           <li key={`watch-${item.subject_id}`} className="rounded-md bg-black/5 dark:bg-white/5 hover:bg-primary/10 transition-colors duration-200 group overflow-hidden">
             <Link href={`https://bgm.tv/subject/${item.subject_id}`} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-2">
                 <div className="flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                   {item.subject.images?.common || item.subject.images?.grid || item.subject.images?.small ? (<Image src={item.subject.images.common || item.subject.images.grid || item.subject.images.small} alt={item.subject.name_cn || item.subject.name} fill sizes="40px" className="object-cover" unoptimized />) : (<div className="w-full h-full flex items-center justify-center"><Tv2 className="w-5 h-5 text-muted-foreground" /></div>)}
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium truncate group-hover:text-primary transition-colors" title={item.subject.name_cn || item.subject.name}>{item.subject.name_cn || item.subject.name}</p>
                   <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                      {/* Progress */}
                      <span className="font-mono">
                        Ep {item.ep_status} / {item.subject.eps || '?'} 
                      </span>
                       {/* Separator */}
                       <span className="text-gray-300 dark:text-gray-600">|</span>
                      {/* Rating */}
                      {item.subject.score != null && !isNaN(item.subject.score) ? (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-yellow-500 mr-0.5">
                              <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                          </svg>
                          <span>{item.subject.score.toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600">-</span>
                      )}
                   </div>
                 </div>
                 <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto" />
             </Link>
           </li>
        ))}
      </ul>
    );
  };

  // Determine title based on view mode
  let titleText;
  if (viewMode === 'calendar') {
    const titleWeekdayPart = currentWeekday ? ` ${currentWeekday}` : '';
    // titleText = `今日放送 (${currentDateStr}${titleWeekdayPart})`;
    titleText = `每日新番放送<br/>${currentDateStr}${titleWeekdayPart}`; // Using the title you added
  } else {
    titleText = "我的追番";
  }

  return (
    <div className="rounded-lg border bg-card shadow-sm glass-effect h-[600px]">
      <div className="p-4 h-full flex flex-col">
        {/* Header with Title and Toggle Button */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center space-x-2 min-w-0 mr-2 h-12">
            {viewMode === 'calendar' ? <CalendarClock className="h-5 w-5 text-primary flex-shrink-0" /> : <User className="h-5 w-5 text-primary flex-shrink-0" /> }
            <h3 className="font-medium text-base md:text-sm lg:text-base leading-tight" title={titleText}>
              {viewMode === 'calendar'
                ? <span dangerouslySetInnerHTML={{ __html: titleText.replace(' (', '<br/>(') }} />
                : titleText
              }
            </h3>
          </div>
          <button
            onClick={handleToggleView}
            className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
            aria-label={viewMode === 'calendar' ? "切换到我的追番" : "切换到每日放送"}
            title={viewMode === 'calendar' ? "切换到我的追番" : "切换到每日放送"}
          >
            {viewMode === 'calendar' ? <User className="h-4 w-4" /> : <List className="h-4 w-4" /> }
          </button>
        </div>

        {/* Content Area with Transition */}
        <div className="flex-1 overflow-hidden relative">
           {/* Calendar View Container - Add overflow-y-auto */}
           <div className={`absolute inset-0 transition-all duration-300 ease-in-out overflow-y-auto ${viewMode === 'calendar' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              {renderCalendarList()}
           </div>
           {/* Watching View Container - Add overflow-y-auto */}
           <div className={`absolute inset-0 transition-all duration-300 ease-in-out overflow-y-auto ${viewMode === 'watching' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
              {renderWatchingList()}
           </div>
        </div>
      </div>
    </div>
  );
} 