/** Standard lane width in meters */
export const LANE_WIDTH = 1.22;

/** Lane 1 total distance in meters */
export const LANE_1_LENGTH = 537;

/** Painted distance marks on lane 1 (all end at the same finish line) */
export const PAINTED_MARKS = [
  60, 80, 100, 150, 200, 300, 400, 600, 800, 1000, 1500, 2000, 3000, 5000,
] as const;

/**
 * Semicircle inner radius (lane 1, in meters).
 * Chosen for visual balance: π × 49 ≈ 153.94m per semicircle.
 */
export const INNER_RADIUS = 49;

/** Derived: each straight length in meters (lane 1) */
export const STRAIGHT_LENGTH =
  (LANE_1_LENGTH - 2 * Math.PI * INNER_RADIUS) / 2;

/**
 * Returns the total distance of a lane in meters.
 * Lane 1 = 537m. Each outer lane adds 2π × LANE_WIDTH per lane offset.
 */
export function laneLength(lane: 1 | 2 | 3): number {
  const offset = (lane - 1) * LANE_WIDTH;
  return LANE_1_LENGTH + 2 * Math.PI * offset;
}

/**
 * Returns the semicircle radius for a given lane.
 */
export function laneRadius(lane: 1 | 2 | 3): number {
  return INNER_RADIUS + (lane - 1) * LANE_WIDTH;
}
