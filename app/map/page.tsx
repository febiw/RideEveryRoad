'use client';

import { useEffect, useRef, useState, useCallback, act } from 'react';
import { APIProvider, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps';
import polyline from '@mapbox/polyline';
import { fetchActivitiesProgressively, getActivityDetail } from '@/lib/strava';
import { readStorage, writeStorage, deleteStorage } from '@/lib/storage';
import { SummaryActivity } from '@/lib/types';
import { getActivityIcon } from '@/lib/activity-icons';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const DEFAULT_CENTER = { lat: 51.50757, lng: -0.127811 };

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

function formatDistance(metres: number): string {
  if (metres >= 1000) return `${(metres / 1000).toFixed(2)} km`;
  return `${Math.round(metres)} m`;
}

function formatSpeed(metres: number, seconds: number): string {
  if (seconds === 0) return '—';
  const kmh = (metres / 1000) / (seconds / 3600);
  return `${kmh.toFixed(1)} km/h`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// --- Mobile popup ---
function MobilePopup({
  activity,
  onClose,
}: {
  activity: SummaryActivity;
  onClose: () => void;
}) {
  return (
    <div className="absolute bottom-4 left-2 right-2 z-20 bg-white rounded-lg shadow-xl p-4 animate-in">
      <button onClick={onClose} className="absolute top-2 right-3 text-gray-400 hover:text-gray-700 text-lg">✕</button>
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5" role="img" aria-label={activity.type}>{getActivityIcon(activity.type)}</span>
        <div className="min-w-0">
          <p className="font-semibold text-base pr-6">{activity.name}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(activity.start_date_local)} · {formatDistance(activity.distance)} · {formatDuration(activity.moving_time)}</p>
        </div>
      </div>
      <a
        href={`https://www.strava.com/activities/${activity.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-sm text-[#fc4c02] font-medium hover:underline"
      >
        View on Strava →
      </a>
    </div>
  );
}

// --- Desktop sidebar ---
function DesktopSidebar({
  activity,
  onClose,
}: {
  activity: SummaryActivity;
  onClose: () => void;
}) {
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDescription(null);
    getActivityDetail(activity.id)
      .then((detail) => {
        if (!cancelled) setDescription(detail.description);
      })
      .catch(() => {
        if (!cancelled) setDescription('');
      });
    return () => { cancelled = true; };
  }, [activity.id]);

  return (
    <div className="absolute top-0 right-0 bottom-0 z-20 w-80 bg-white shadow-xl border-l border-gray-200 overflow-y-auto">
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 pr-4">
          <span className="text-2xl leading-none" role="img" aria-label={activity.type}>{getActivityIcon(activity.type)}</span>
          <h3 className="font-semibold text-lg leading-tight">{activity.name}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg shrink-0 mt-0.5">✕</button>
      </div>
      <div className="p-4 space-y-3">
        <Row label="Type" value={activity.type} />
        <Row label="Date" value={formatDate(activity.start_date_local)} />
        {description === null ? (
          <div className="h-4 w-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
        ) : description ? (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Description</p>
            <div className="text-sm text-gray-800 max-h-32 overflow-y-auto whitespace-pre-wrap">{description}</div>
          </div>
        ) : null}
        <Row label="Distance" value={formatDistance(activity.distance)} />
        <Row label="Duration" value={formatDuration(activity.moving_time)} />
        <Row label="Avg Speed" value={formatSpeed(activity.distance, activity.moving_time)} />
        <Row label="Elevation" value={`${Math.round(activity.total_elevation_gain)} m`} />
        <a
          href={`https://www.strava.com/activities/${activity.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-sm text-[#fc4c02] font-medium hover:underline"
        >
          View on Strava →
        </a>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

function ActivityPolylines({
  activities,
  shouldFitBounds,
  onBoundsFit,
  onActivityClick,
}: {
  activities: SummaryActivity[];
  shouldFitBounds: boolean;
  onBoundsFit: () => void;
  onActivityClick: (activity: SummaryActivity) => void;
}) {
  const map = useMap();
  const drawnRef = useRef(new window.Map<number, google.maps.Polyline>());
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const hasFittedOnceRef = useRef(false);
  const onClickRef = useRef(onActivityClick);
  onClickRef.current = onActivityClick;

  // Build a lookup once so click listeners can find the activity
  const activityMapRef = useRef(new window.Map<number, SummaryActivity>());
  useEffect(() => {
    for (const a of activities) {
      activityMapRef.current.set(a.id, a);
    }
  }, [activities]);

  useEffect(() => {
    if (!map) return;

    if (!boundsRef.current) {
      boundsRef.current = new google.maps.LatLngBounds();
    }

    for (const activity of activities) {
      if (drawnRef.current.has(activity.id)) continue;
      if (!activity.map?.summary_polyline) continue;

      const decoded = polyline.decode(activity.map.summary_polyline);
      const path = decoded.map(([lat, lng]) => ({ lat, lng }));
      if (path.length === 0) continue;

      for (const point of path) {
        boundsRef.current.extend(point);
      }

      const line = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 0.4,
        strokeWeight: 3,
        map,
      });

      const activityId = activity.id;
      line.addListener('click', () => {
        const a = activityMapRef.current.get(activityId);
        if (a) onClickRef.current(a);
      });

      drawnRef.current.set(activity.id, line);
    }
  }, [map, activities]);

  // Fit bounds once to the most recent activity only
  useEffect(() => {
    if (!map || !shouldFitBounds || hasFittedOnceRef.current) return;
    if (activities.length === 0) return;

    // Find the first activity with a polyline (most recent, since Strava returns newest first)
    const mostRecent = activities.find((a) => a.map?.summary_polyline);
    if (!mostRecent?.map?.summary_polyline) return;

    const decoded = polyline.decode(mostRecent.map.summary_polyline);
    const recentBounds = new google.maps.LatLngBounds();
    for (const [lat, lng] of decoded) {
      recentBounds.extend({ lat, lng });
    }
    map.fitBounds(recentBounds);
    hasFittedOnceRef.current = true;
    onBoundsFit();
  }, [map, shouldFitBounds, activities, onBoundsFit]);

  return null;
}

function LoadingBar({ count, done }: { count: number; done: boolean }) {
  if (done && count === 0) return null;
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-black/60 text-white text-sm px-4 py-2 flex items-center gap-3">
      {!done && (
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      <span>
        {done
          ? `${count} activities loaded`
          : `Loading activities… ${count} loaded`}
      </span>
    </div>
  );
}

export default function MapPage() {
  const [activities, setActivities] = useState<SummaryActivity[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [done, setDone] = useState(false);
  const [shouldFitBounds, setShouldFitBounds] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SummaryActivity | null>(null);
  const allNewRef = useRef<SummaryActivity[]>([]);
  const cachedRef = useRef<SummaryActivity[]>([]);
  const isMobile = useIsMobile();

  const handleBoundsFit = useCallback(() => {
    setShouldFitBounds(false);
  }, []);

  const handleActivityClick = useCallback((activity: SummaryActivity) => {
    setSelectedActivity(activity);
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      // Load cached activities and render them immediately
      const cached = readStorage<SummaryActivity[]>('cached_activity_data');
      let lastPulledDate = new Date(2000, 0, 1);

      if (cached && cached.length > 0) {
        cachedRef.current = cached;
        setActivities(cached);
        setLoadedCount(cached.length);
        lastPulledDate = new Date(cached[cached.length - 1].start_date);
        setShouldFitBounds(true);
      }

      // Progressively fetch new activities (newest first, no 'after' param)
      allNewRef.current = [];
      const cachedIds = new Set(cachedRef.current.map((a) => a.id));

      await fetchActivitiesProgressively((batch, isDone) => {
        // Filter out anything already in cache
        const newOnly = batch.filter((a) => !cachedIds.has(a.id));
        allNewRef.current.push(...newOnly);

        if (newOnly.length > 0) {
          setActivities((prev) => [...prev, ...newOnly]);
          setLoadedCount((prev) => prev + newOnly.length);
        }

        // Trigger bounds fit on first batch (scoped to most recent activity)
        if (allNewRef.current.length === newOnly.length && newOnly.length > 0) {
          setShouldFitBounds(true);
        }

        if (isDone) {
          setDone(true);
          // Update cache: new activities (newest) prepended to existing cache
          const merged = [...allNewRef.current, ...cachedRef.current];
          deleteStorage('cached_activity_data');
          writeStorage('cached_activity_data', merged);
        }
      }, cachedIds);
    } catch (err) {
      console.error('Failed to load activities:', err);
      setDone(true);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return (
    <div className="w-full relative" style={{ height: 'calc(100vh - 140px)' }}>
      <LoadingBar count={loadedCount} done={done} />
      <APIProvider apiKey={GOOGLE_MAPS_KEY}>
        <GoogleMap
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={13}
          mapTypeId="roadmap"
          style={{ width: '100%', height: '100%' }}
        >
          <ActivityPolylines
            activities={activities}
            shouldFitBounds={shouldFitBounds}
            onBoundsFit={handleBoundsFit}
            onActivityClick={handleActivityClick}
          />
        </GoogleMap>
      </APIProvider>
      {selectedActivity && (
        isMobile
          ? <MobilePopup activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
          : <DesktopSidebar activity={selectedActivity} onClose={() => setSelectedActivity(null)} />
      )}
    </div>
  );
}
