import { useState } from "react";
import type { Segment, SegmentResult } from "./types/workout";
import { calculateWorkout } from "./lib/split-calculator";
import WorkoutForm from "./components/WorkoutForm";
import SplitTable from "./components/SplitTable";
import TrackSVG from "./components/TrackView/TrackSVG";

const INITIAL_SEGMENTS: Segment[] = [
  { reps: 4, distance: 400, paceSeconds: 195, lane: 1 },
];

export default function App() {
  const [segments, setSegments] = useState<Segment[]>(INITIAL_SEGMENTS);
  const [results, setResults] = useState<SegmentResult[] | null>(null);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);

  function handleCalculate() {
    const r = calculateWorkout(segments);
    setResults(r);
    setSelectedSegmentIndex(r.length > 0 ? 0 : null);
  }

  // Determine which segment to highlight on the track
  const highlightedSegment =
    selectedSegmentIndex !== null && results
      ? results[selectedSegmentIndex]?.segment ?? null
      : null;

  return (
    <div className="min-h-dvh max-w-lg mx-auto p-4 space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold">CDG Pacer</h1>
        <p className="text-slate-400 text-sm">537m track workout planner</p>
      </header>

      {/* Track visualization */}
      <TrackSVG selectedSegment={highlightedSegment} />

      {/* Workout form */}
      <WorkoutForm
        segments={segments}
        onSegmentsChange={(s) => {
          setSegments(s);
          setResults(null);
          setSelectedSegmentIndex(null);
        }}
        onCalculate={handleCalculate}
        results={results}
      />

      {/* Split results */}
      {results && (
        <SplitTable
          results={results}
          selectedSegmentIndex={selectedSegmentIndex}
          onSelectSegment={setSelectedSegmentIndex}
        />
      )}
    </div>
  );
}
