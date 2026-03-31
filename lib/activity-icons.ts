/**
 * Maps Strava activity types to emoji icons and sport groups.
 * Based on https://support.strava.com/hc/en-us/articles/216919407
 */

export type SportGroup = 'foot' | 'cycle' | 'water' | 'winter' | 'other';

export const SPORT_GROUP_CONFIG: Record<SportGroup, { label: string; icon: string; color: string }> = {
  foot:   { label: 'Foot',   icon: '🏃', color: '#e53e3e' },   // red
  cycle:  { label: 'Cycle',  icon: '🚴', color: '#cc4fdc' },   // purple
  water:  { label: 'Water',  icon: '🏊', color: '#38a169' },   // green
  winter: { label: 'Winter', icon: '⛷️', color: '#1a202c' },   // black
  other:  { label: 'Other',  icon: '🏅', color: '#d69e2e' },   // amber
};

const ACTIVITY_ICONS: Record<string, string> = {
  // Foot sports
  Run: '🏃',
  TrailRun: '🥾',
  Hike: '🥾',
  Walk: '🚶',
  Wheelchair: '♿',

  // Cycle sports
  Ride: '🚴',
  EBikeRide: '🔋🚴',
  MountainBikeRide: '🚵',
  EMountainBikeRide: '🔋🚵',
  GravelRide: '🚴',
  Velomobile: '🚴',
  Handcycle: '🚴',

  // Water sports
  Canoe: '🛶',
  Kayaking: '🛶',
  StandUpPaddling: '🏄',
  Surf: '🏄',
  Kitesurf: '🪁',
  Windsurf: '🏄',
  Swim: '🏊',
  Rowing: '🚣',
  Sailing: '⛵',

  // Winter sports
  IceSkate: '⛸️',
  NordicSki: '⛷️',
  AlpineSki: '⛷️',
  Snowboard: '🏂',
  BackcountrySki: '⛷️',
  Snowshoe: '🥾',

  // Other sports
  Workout: '💪',
  Golf: '⛳',
  Badminton: '🏸',
  Elliptical: '🏋️',
  Basketball: '🏀',
  InlineSkate: '🛼',
  Skateboard: '🛹',
  Tennis: '🎾',
  StairStepper: '🪜',
  Padel: '🎾',
  RockClimbing: '🧗',
  Soccer: '⚽',
  Pickleball: '🎾',
  WeightTraining: '🏋️',
  Volleyball: '🏐',
  RollerSki: '⛷️',
  Squash: '🎾',
  Crossfit: '💪',
  Yoga: '🧘',
  Dance: '💃',
  TableTennis: '🏓',
  Pilates: '🧘',
  Racquetball: '🎾',
  HIIT: '🔥',
  Cricket: '🏏',

  // Virtual
  VirtualRide: '🖥️🚴',
  VirtualRun: '🖥️🏃',
  VirtualRow: '🖥️🚣',
};

const SPORT_GROUP_MAP: Record<string, SportGroup> = {
  // Foot
  Run: 'foot', TrailRun: 'foot', Hike: 'foot', Walk: 'foot', Wheelchair: 'foot',
  VirtualRun: 'foot',
  // Cycle
  Ride: 'cycle', EBikeRide: 'cycle', MountainBikeRide: 'cycle', EMountainBikeRide: 'cycle',
  GravelRide: 'cycle', Velomobile: 'cycle', Handcycle: 'cycle', VirtualRide: 'cycle',
  // Water
  Canoe: 'water', Kayaking: 'water', StandUpPaddling: 'water', Surf: 'water',
  Kitesurf: 'water', Windsurf: 'water', Swim: 'water', Rowing: 'water', Sailing: 'water',
  VirtualRow: 'water',
  // Winter
  IceSkate: 'winter', NordicSki: 'winter', AlpineSki: 'winter', Snowboard: 'winter',
  BackcountrySki: 'winter', Snowshoe: 'winter',
};

export function getActivityIcon(type: string): string {
  return ACTIVITY_ICONS[type] ?? '🏅';
}

export function getSportGroup(type: string): SportGroup {
  return SPORT_GROUP_MAP[type] ?? 'other';
}

export function getSportGroupColor(type: string): string {
  return SPORT_GROUP_CONFIG[getSportGroup(type)].color;
}

