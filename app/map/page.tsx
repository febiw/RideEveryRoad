'use client';

import { useEffect, useState, useCallback } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import polyline from '@mapbox/polyline';
import { getActivitiesSince } from '@/lib/strava';
import { readStorage, writeStorage, deleteStorage } from '@/lib/storage';
import { SummaryActivity } from '@/lib/types';
import Spinner from '@/components/Spinner';

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const DEFAULT_CENTER = { lat: 51.50757, lng: -0.127811 };

function ActivityPolylines({ activities }: { activities: SummaryActivity[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || activities.length === 0) return;

    const polylines: google.maps.Polyline[] = [];
    const bounds = new google.maps.LatLngBounds();

    for (const activity of activities) {
      if (!activity.map?.summary_polyline) continue;

      const decoded = polyline.decode(activity.map.summary_polyline);
      const path = decoded.map(([lat, lng]) => ({ lat, lng }));

      if (path.length === 0) continue;

      // Extend bounds
      for (const point of path) {
        bounds.extend(point);
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

      polylines.push(line);
    }

    if (polylines.length > 0) {
      map.fitBounds(bounds);
    }

    return () => {
      polylines.forEach((p) => {
        p.setMap(null);
        google.maps.event.clearInstanceListeners(p);
      });
    };
  }, [map, activities]);

  return null;
}

export default function MapPage() {
  const [activities, setActivities] = useState<SummaryActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    try {
      const cached = readStorage<SummaryActivity[]>('cached_activity_data');
      let lastPulledDate = new Date(2000, 0, 1);

      if (cached && cached.length > 0) {
        lastPulledDate = new Date(cached[cached.length - 1].start_date);
      }

      const newActivities = await getActivitiesSince(lastPulledDate);
      const merged = [...(cached || []), ...newActivities];

      deleteStorage('cached_activity_data');
      writeStorage('cached_activity_data', merged);

      setActivities(merged);
    } catch (err) {
      console.error('Failed to load activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return (
    <>
      {loading && <Spinner />}
      <div className="w-full" style={{ height: 'calc(100vh - 140px)' }}>
        <APIProvider apiKey={GOOGLE_MAPS_KEY}>
          <Map
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={13}
            mapTypeId="roadmap"
            style={{ width: '100%', height: '100%' }}
          >
            <ActivityPolylines activities={activities} />
          </Map>
        </APIProvider>
      </div>
    </>
  );
}
