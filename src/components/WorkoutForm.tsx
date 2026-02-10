import type { Segment, SegmentResult } from "../types/workout";
import SegmentInput from "./SegmentInput";

const DEFAULT_SEGMENT: Segment = {
  reps: 4,
  distance: 400,
  paceSeconds: 195, // 3:15/km
  lane: 1,
};

interface Props {
  segments: Segment[];
  onSegmentsChange: (segments: Segment[]) => void;
  onCalculate: () => void;
  results: SegmentResult[] | null;
}

export default function WorkoutForm({
  segments,
  onSegmentsChange,
  onCalculate,
  results,
}: Props) {
  function handleChange(index: number, updated: Segment) {
    const next = [...segments];
    next[index] = updated;
    onSegmentsChange(next);
  }

  function handleRemove(index: number) {
    onSegmentsChange(segments.filter((_, i) => i !== index));
  }

  function handleAdd() {
    onSegmentsChange([...segments, { ...DEFAULT_SEGMENT }]);
  }

  return (
    <div className="space-y-3">
      {segments.map((seg, i) => (
        <SegmentInput
          key={i}
          segment={seg}
          index={i}
          onChange={handleChange}
          onRemove={handleRemove}
          canRemove={segments.length > 1}
        />
      ))}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAdd}
          className="flex-1 py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 text-sm hover:border-slate-500 hover:text-slate-300 transition-colors"
        >
          + Add Segment
        </button>
        <button
          type="button"
          onClick={onCalculate}
          className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 transition-colors"
        >
          {results ? "Recalculate" : "Calculate Splits"}
        </button>
      </div>
    </div>
  );
}
