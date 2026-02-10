import { useState } from "react";
import type { SegmentResult } from "../types/workout";
import { formatTime } from "../lib/split-calculator";
import { laneLength, LANE_1_LENGTH } from "../constants/track";

interface Props {
  results: SegmentResult[];
  selectedRep: { segmentIndex: number; repIndex: number } | null;
  onSelectRep: (segmentIndex: number, repIndex: number) => void;
}

export default function SplitTable({
  results,
  selectedRep,
  onSelectRep,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function toggleSegment(segIdx: number) {
    setExpanded((prev) => ({
      ...prev,
      [segIdx]: !prev[segIdx],
    }));
  }

  function isExpanded(segIdx: number) {
    // Default: first segment expanded
    return expanded[segIdx] ?? segIdx === 0;
  }

  return (
    <div className="space-y-3">
      {results.map((segResult) => {
        const { segment, segmentIndex } = segResult;
        const trackLen =
          segment.lane === 1 ? LANE_1_LENGTH : laneLength(segment.lane);
        const startPos = segment.distance % trackLen;
        const open = isExpanded(segmentIndex);

        return (
          <div key={segmentIndex} className="bg-slate-800 rounded-lg overflow-hidden">
            {/* Segment header */}
            <button
              type="button"
              onClick={() => toggleSegment(segmentIndex)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-750 transition-colors"
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
              <span
                className={`text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
              >
                ▾
              </span>
            </button>

            {open && (
              <div className="px-3 pb-3 space-y-2">
                {/* Start info */}
                <p className="text-xs text-slate-400">
                  Start: {Math.round(startPos)}m behind finish line
                </p>

                {/* Rep tabs */}
                {segment.reps > 1 && (
                  <div className="flex gap-1 flex-wrap">
                    {segResult.reps.map((rep) => {
                      const isSelected =
                        selectedRep?.segmentIndex === segmentIndex &&
                        selectedRep?.repIndex === rep.repIndex;
                      return (
                        <button
                          key={rep.repIndex}
                          type="button"
                          onClick={() =>
                            onSelectRep(segmentIndex, rep.repIndex)
                          }
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                          }`}
                        >
                          Rep {rep.repIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Split table for selected rep (or rep 1 if only 1) */}
                {(() => {
                  const repIdx =
                    selectedRep?.segmentIndex === segmentIndex
                      ? selectedRep.repIndex
                      : 0;
                  const rep = segResult.reps[repIdx];
                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-slate-500 text-xs">
                            <th className="text-left py-1 pr-3">Mark</th>
                            <th className="text-right py-1 px-3">Distance</th>
                            <th className="text-right py-1 pl-3">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rep.splits.map((split, i) => (
                            <tr
                              key={i}
                              className={`border-t border-slate-700/50 ${
                                split.label === "Finish"
                                  ? "font-medium text-blue-300"
                                  : split.label === "Finish line"
                                    ? "text-slate-300"
                                    : "text-slate-400"
                              }`}
                            >
                              <td className="py-1.5 pr-3">{split.label}</td>
                              <td className="py-1.5 px-3 text-right tabular-nums">
                                {split.distanceIntoRep}m
                              </td>
                              <td className="py-1.5 pl-3 text-right tabular-nums">
                                {formatTime(split.elapsedSeconds)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
