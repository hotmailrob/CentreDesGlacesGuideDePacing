import type { SegmentResult } from "../types/workout";
import { formatTime } from "../lib/split-calculator";
import { laneLength, LANE_1_LENGTH, PAINTED_MARKS } from "../constants/track";

interface Props {
  results: SegmentResult[];
  onSelectSegment: (segmentIndex: number) => void;
  selectedSegmentIndex: number | null;
}

/**
 * Find the painted mark closest to `targetDist` meters into a section
 * that starts at `startPos` on the track and covers `sectionLength` meters.
 */
function findMidMark(
  startPos: number,
  trackLen: number,
  sectionLength: number,
  targetDist: number,
): { label: string; dist: number } | null {
  const marks = PAINTED_MARKS.map((m) => ({
    label: m >= 1000 ? `${m / 1000}k` : `${m}`,
    pos: m % LANE_1_LENGTH,
  }));

  let best: { label: string; dist: number } | null = null;
  let bestDiff = Infinity;

  for (const mark of marks) {
    // Distance from startPos to this mark in running direction (decreasing pos)
    const dist =
      startPos >= mark.pos
        ? startPos - mark.pos
        : startPos + trackLen - mark.pos;

    // Must be well within the section (not too close to edges)
    if (dist < 20 || dist > sectionLength - 20) continue;

    const diff = Math.abs(dist - targetDist);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = { label: mark.label, dist };
    }
  }

  return best;
}

interface Row {
  label: string;
  time: number;
  highlight?: boolean;
}

export default function SplitTable({
  results,
  onSelectSegment,
  selectedSegmentIndex,
}: Props) {
  return (
    <div className="space-y-3">
      {results.map((segResult) => {
        const { segment, segmentIndex } = segResult;
        const trackLen =
          segment.lane === 1 ? LANE_1_LENGTH : laneLength(segment.lane);
        const secsPerMeter = segment.paceSeconds / 1000;
        const startPos = segment.distance % trackLen;
        const isShort = segment.distance <= trackLen;
        const isSelected = selectedSegmentIndex === segmentIndex;

        const rows: Row[] = [];

        if (isShort) {
          // Short run: start → mid mark → finish
          const midMark = findMidMark(
            startPos,
            trackLen,
            segment.distance,
            segment.distance / 2,
          );
          if (midMark) {
            rows.push({
              label: `Start → ${midMark.label}m`,
              time: midMark.dist * secsPerMeter,
            });
            rows.push({
              label: `${midMark.label}m → Finish`,
              time: (segment.distance - midMark.dist) * secsPerMeter,
            });
          }
          rows.push({
            label: `Total (${segment.distance}m)`,
            time: segment.distance * secsPerMeter,
            highlight: true,
          });
        } else {
          // Long run: lap splits with mid-mark reference

          // Full lap time
          rows.push({
            label: `Lap (${Math.round(trackLen)}m)`,
            time: trackLen * secsPerMeter,
            highlight: true,
          });

          // Find mid-mark for full laps (starting from finish line = pos 0)
          const midMark = findMidMark(0, trackLen, trackLen, trackLen / 2);
          // Hmm, from pos 0 the runner wraps. findMidMark uses:
          //   startPos=0, mark.pos>0 → dist = 0 + trackLen - mark.pos = trackLen - mark.pos
          // target = trackLen/2. So we want trackLen - pos ≈ trackLen/2, i.e. pos ≈ trackLen/2
          // For lane 1: 800m mark at pos 263, dist = 537-263 = 274 ≈ 268.5 ✓

          if (midMark) {
            rows.push({
              label: `Finish line → ${midMark.label}m`,
              time: midMark.dist * secsPerMeter,
            });
            rows.push({
              label: `${midMark.label}m → Finish line`,
              time: (trackLen - midMark.dist) * secsPerMeter,
            });
          }

          // First partial (start → finish line) if the run doesn't start at the finish
          if (startPos > 0) {
            rows.push({ label: "", time: -1 }); // separator
            const partialMid =
              startPos > 100
                ? findMidMark(startPos, trackLen, startPos, startPos / 2)
                : null;

            if (partialMid) {
              rows.push({
                label: `1st: Start → ${partialMid.label}m`,
                time: partialMid.dist * secsPerMeter,
              });
              rows.push({
                label: `1st: ${partialMid.label}m → Finish line`,
                time: (startPos - partialMid.dist) * secsPerMeter,
              });
            } else {
              rows.push({
                label: `1st partial (${Math.round(startPos)}m)`,
                time: startPos * secsPerMeter,
              });
            }
          }

          // Total
          rows.push({ label: "", time: -1 }); // separator
          rows.push({
            label: `Total (${segment.distance}m)`,
            time: segment.distance * secsPerMeter,
            highlight: true,
          });
        }

        return (
          <div key={segmentIndex} className="bg-slate-800 rounded-lg overflow-hidden">
            {/* Segment header */}
            <button
              type="button"
              onClick={() => onSelectSegment(segmentIndex)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                isSelected
                  ? "bg-slate-700"
                  : "hover:bg-slate-750"
              }`}
            >
              <span className="font-medium text-sm">
                {segment.reps}×{segment.distance}m
                <span className="text-slate-400 ml-2">
                  @ {Math.floor(segment.paceSeconds / 60)}:
                  {Math.round(segment.paceSeconds % 60)
                    .toString()
                    .padStart(2, "0")}
                  /km · Lane {segment.lane}
                </span>
              </span>
            </button>

            <div className="px-3 pb-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-500 text-xs">
                    <th className="text-left py-1">Section</th>
                    <th className="text-right py-1">Split</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) =>
                    row.time === -1 ? (
                      <tr key={i}>
                        <td colSpan={2} className="py-1">
                          <div className="border-t border-slate-700/50" />
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={i}
                        className={`border-t border-slate-700/50 ${
                          row.highlight
                            ? "font-medium text-blue-300"
                            : "text-slate-400"
                        }`}
                      >
                        <td className="py-1.5">{row.label}</td>
                        <td className="py-1.5 text-right tabular-nums">
                          {formatTime(row.time)}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
