import {
  INNER_RADIUS,
  STRAIGHT_LENGTH,
  LANE_WIDTH,
} from "../constants/track";

/**
 * SVG coordinate system:
 * - Track is centered in a viewBox.
 * - Finish line is at the bottom-right of the oval.
 * - Distance is measured backwards (clockwise) from the finish line.
 *
 * Oval layout (looking down):
 *
 *       ┌──── Straight 2 (top) ────┐
 *      ╱                            ╲
 *   Curve 1                      Curve 2
 *   (left)                       (right)
 *      ╲                            ╱
 *       └──── Straight 1 (bot) ────┘
 *                              ▲ finish line
 *
 * Going clockwise from the finish line:
 *   Segment 0: Straight 1 (bottom, right → left)
 *   Segment 1: Curve 1 (left semicircle, bottom → top)
 *   Segment 2: Straight 2 (top, left → right)
 *   Segment 3: Curve 2 (right semicircle, top → bottom)
 */

// SVG canvas sizing
const PADDING = 20;
const SCALE = 2; // meters to SVG units

function svgRadius(lane: 1 | 2 | 3): number {
  return (INNER_RADIUS + (lane - 1) * LANE_WIDTH) * SCALE;
}

function svgStraight(): number {
  return STRAIGHT_LENGTH * SCALE;
}

/** Total SVG width and height */
export const SVG_WIDTH = 2 * INNER_RADIUS * SCALE + svgStraight() + 2 * PADDING + 6 * LANE_WIDTH * SCALE;
export const SVG_HEIGHT = 2 * INNER_RADIUS * SCALE + 2 * PADDING + 6 * LANE_WIDTH * SCALE;

// Center of the left semicircle
const CX_LEFT = PADDING + (INNER_RADIUS + 2 * LANE_WIDTH) * SCALE;
// Center of the right semicircle
const CX_RIGHT = CX_LEFT + svgStraight();
// Vertical center of both semicircles
const CY = PADDING + (INNER_RADIUS + 2 * LANE_WIDTH) * SCALE;

export interface Point {
  x: number;
  y: number;
}

/**
 * Converts a distance (in meters, measured clockwise from the finish line)
 * to an SVG (x, y) coordinate for a given lane.
 */
export function distanceToSVGPoint(
  distanceBehindFinish: number,
  lane: 1 | 2 | 3 = 1,
): Point {
  const r = svgRadius(lane);
  const straight = svgStraight();
  const curveLen = Math.PI * r;
  const totalLaneLen = 2 * straight + 2 * curveLen;

  // Normalize to one lap
  let d = ((distanceBehindFinish * SCALE) % totalLaneLen + totalLaneLen) % totalLaneLen;

  // Segment 0: Bottom straight (right → left), from finish line going left
  if (d <= straight) {
    return { x: CX_RIGHT - d, y: CY + r };
  }
  d -= straight;

  // Segment 1: Left semicircle (bottom → top), going clockwise
  if (d <= curveLen) {
    const angle = (d / curveLen) * Math.PI; // 0 at bottom, π at top
    return {
      x: CX_LEFT - r * Math.sin(angle),
      y: CY + r * Math.cos(angle),
    };
  }
  d -= curveLen;

  // Segment 2: Top straight (left → right)
  if (d <= straight) {
    return { x: CX_LEFT + d, y: CY - r };
  }
  d -= straight;

  // Segment 3: Right semicircle (top → bottom), going clockwise
  const angle = (d / curveLen) * Math.PI; // 0 at top, π at bottom
  return {
    x: CX_RIGHT + r * Math.sin(angle),
    y: CY - r * Math.cos(angle),
  };
}

/**
 * Returns the finish line position for a given lane.
 */
export function finishLinePoint(lane: 1 | 2 | 3 = 1): Point {
  return distanceToSVGPoint(0, lane);
}

/**
 * Generates an SVG path string for a full lane oval.
 */
export function laneOvalPath(lane: 1 | 2 | 3): string {
  const r = svgRadius(lane);

  // Start at bottom-right (finish line area)
  const startX = CX_RIGHT;
  const startY = CY + r;

  return [
    `M ${startX} ${startY}`,
    // Bottom straight: right → left
    `L ${CX_LEFT} ${startY}`,
    // Left semicircle: bottom → top
    `A ${r} ${r} 0 1 1 ${CX_LEFT} ${CY - r}`,
    // Top straight: left → right
    `L ${CX_RIGHT} ${CY - r}`,
    // Right semicircle: top → bottom
    `A ${r} ${r} 0 1 1 ${CX_RIGHT} ${CY + r}`,
    "Z",
  ].join(" ");
}
