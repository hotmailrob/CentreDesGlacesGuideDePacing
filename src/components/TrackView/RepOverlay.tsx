import type { Segment } from "../../types/workout";
import { LANE_1_LENGTH, laneLength } from "../../constants/track";
import { distanceToSVGPoint } from "../../lib/track-geometry";

interface Props {
  segment: Segment;
}

/**
 * Draws the start position marker and a direction arrow on the track SVG
 * for the given segment.
 */
export default function RepOverlay({ segment }: Props) {
  const trackLen =
    segment.lane === 1 ? LANE_1_LENGTH : laneLength(segment.lane);
  const startPos = segment.distance % trackLen;

  const startPt = distanceToSVGPoint(startPos, segment.lane);
  const finishPt = distanceToSVGPoint(0, segment.lane);

  // Direction arrow: sample a point slightly ahead of start
  // (the runner moves from startPos toward 0, i.e., decreasing position)
  const aheadPt = distanceToSVGPoint(startPos - 3, segment.lane);
  const dx = aheadPt.x - startPt.x;
  const dy = aheadPt.y - startPt.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = len > 0 ? dx / len : 0;
  const ny = len > 0 ? dy / len : 0;

  // Generate path along the track for the rep
  const pathPoints: string[] = [];
  const stepCount = Math.max(60, Math.ceil(segment.distance / 5));
  for (let i = 0; i <= stepCount; i++) {
    const d = startPos - (i / stepCount) * segment.distance;
    const pt = distanceToSVGPoint(d, segment.lane);
    pathPoints.push(`${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`);
  }

  return (
    <g>
      {/* Rep path highlight */}
      <path
        d={pathPoints.join(" ")}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={3}
        strokeOpacity={0.5}
        strokeLinecap="round"
      />

      {/* Start marker */}
      <circle cx={startPt.x} cy={startPt.y} r={5} fill="#22c55e" />
      <text
        x={startPt.x}
        y={startPt.y - 10}
        fill="#22c55e"
        fontSize={7}
        textAnchor="middle"
        fontWeight="bold"
      >
        START
      </text>

      {/* Direction arrow at start */}
      <polygon
        points={`
          ${startPt.x + nx * 12},${startPt.y + ny * 12}
          ${startPt.x + nx * 6 - ny * 4},${startPt.y + ny * 6 + nx * 4}
          ${startPt.x + nx * 6 + ny * 4},${startPt.y + ny * 6 - nx * 4}
        `}
        fill="#22c55e"
      />

      {/* Finish marker (if startPos > 0, i.e. not a full-lap exact) */}
      {startPos > 0 && (
        <circle cx={finishPt.x} cy={finishPt.y} r={4} fill="#ef4444" />
      )}
    </g>
  );
}
