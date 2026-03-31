/**
 * Maps Strava activity types to emoji icons.
 * Based on https://support.strava.com/hc/en-us/articles/216919407
 */

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

export function getActivityIcon(type: string): string {
  return ACTIVITY_ICONS[type] ?? '🏅';
}
