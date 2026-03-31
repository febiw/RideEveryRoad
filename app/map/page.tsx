'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { APIProvider, Map as GoogleMap, useMap } from '@vis.gl/react-google-maps';
import polyline from '@mapbox/polyline';
import { fetchActivitiesProgressively } from '@/lib/strava';
import { readStorage, writeStorage, deleteStorage } from '@/lib/storage';
import { SummaryActivity } from '@/lib/types';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const DEFAULT_CENTER = { lat: 51.50757, lng: -0.127811 };

function ActivityPolylines({
  activities,
  shouldFitBounds,
  onBoundsFit,
}: {
  activities: SummaryActivity[];
  shouldFitBounds: boolean;
  onBoundsFit: () => void;
}) {
  const map = useMap();
  const drawnRef = useRef(new window.Map<number, google.maps.Polyline>());
  const boundsRef = useRef<google.maps.LatLngBounds | null>(null);
  const hasFittedOnceRef = useRef(false);

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
        window.open(`https://www.strava.com/activities/${activityId}`);
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
  const allNewRef = useRef<SummaryActivity[]>([]);
  const cachedRef = useRef<SummaryActivity[]>([]);

  const handleBoundsFit = useCallback(() => {
    setShouldFitBounds(false);
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
          />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
