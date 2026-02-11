import { PAINTED_MARKS, LANE_1_LENGTH } from "../../constants/track";
import {
  SVG_WIDTH,
  SVG_HEIGHT,
  laneOvalPath,
  distanceToSVGPoint,
  finishLinePoint,
} from "../../lib/track-geometry";
import RepOverlay from "./RepOverlay";
import type { Segment } from "../../types/workout";

interface Props {
  selectedSegment: Segment | null;
}

/** Length of tick marks in SVG units */
const TICK_LEN = 8;

/**
 * Calculate a perpendicular outward direction at a point on the track.
 * We approximate by sampling two nearby points and rotating 90°.
 */
function tickDirection(pos: number): { dx: number; dy: number } {
  const epsilon = 0.5;
  const p1 = distanceToSVGPoint(pos - epsilon);
  const p2 = distanceToSVGPoint(pos + epsilon);
  // Tangent direction (clockwise along the track)
  const tx = p2.x - p1.x;
  const ty = p2.y - p1.y;
  const len = Math.sqrt(tx * tx + ty * ty);
  if (len === 0) return { dx: 0, dy: -1 };
  // Perpendicular (outward = rotate 90° clockwise)
  return { dx: ty / len, dy: -tx / len };
}

export default function TrackSVG({ selectedSegment }: Props) {
  const finishInner = finishLinePoint(1);
  const finishOuter = finishLinePoint(3);

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      className="w-full"
      aria-label="Track diagram"
    >
      {/* Lane ovals */}
      {([3, 2, 1] as const).map((lane) => (
        <path
          key={lane}
          d={laneOvalPath(lane)}
          fill="none"
          stroke={lane === 1 ? "#475569" : "#334155"}
          strokeWidth={lane === 1 ? 1.5 : 0.8}
        />
      ))}

      {/* Finish line */}
      <line
        x1={finishInner.x}
        y1={finishInner.y}
        x2={finishOuter.x}
        y2={finishOuter.y}
        stroke="#ef4444"
        strokeWidth={2}
      />
      <text
        x={finishOuter.x + 4}
        y={finishOuter.y}
        fill="#ef4444"
        fontSize={8}
        dominantBaseline="middle"
      >
        FIN
      </text>

      {/* Painted mark ticks */}
      {PAINTED_MARKS.map((mark) => {
        const pos = mark % LANE_1_LENGTH;
        const pt = distanceToSVGPoint(pos);
        const { dx, dy } = tickDirection(pos);

        return (
          <g key={mark}>
            <line
              x1={pt.x}
              y1={pt.y}
              x2={pt.x + dx * TICK_LEN}
              y2={pt.y + dy * TICK_LEN}
              stroke="#64748b"
              strokeWidth={1}
            />
            <text
              x={pt.x + dx * (TICK_LEN + 5)}
              y={pt.y + dy * (TICK_LEN + 5)}
              fill="#64748b"
              fontSize={9}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {mark >= 1000 ? `${mark / 1000}k` : mark}
            </text>
          </g>
        );
      })}

      {/* Rep overlay */}
      {selectedSegment && <RepOverlay segment={selectedSegment} />}
    </svg>
  );
}
