import { PAINTED_MARKS, LANE_1_LENGTH, laneLength } from "../constants/track";
import type { Segment, Split, RepResult, SegmentResult } from "../types/workout";

/**
 * Position of a painted mark on the track (meters behind the finish line).
 * A mark labeled Xm sits at (X % trackLength) behind the finish.
 */
function markPositionOnTrack(markDistance: number, trackLen: number): number {
  return markDistance % trackLen;
}

/**
 * Calculate splits for a single rep.
 *
 * The runner starts at (repDistance % trackLen) meters behind the finish line
 * and runs `repDistance` meters total, finishing at the finish line.
 *
 * We track which painted marks the runner passes, in order,
 * computing distance-into-rep and elapsed time for each.
 */
function calculateRepSplits(
  repDistance: number,
  paceSecondsPerKm: number,
  lane: 1 | 2 | 3,
): Split[] {
  const trackLen = lane === 1 ? LANE_1_LENGTH : laneLength(lane);
  const secsPerMeter = paceSecondsPerKm / 1000;

  // Start position: how far behind the finish line the runner begins
  const startPos = repDistance % trackLen;

  // Build a list of (markLabel, positionOnTrack) for all painted marks
  // Painted marks are defined for lane 1 distances. Their physical position
  // on the track is the same regardless of which lane you run in.
  const markPositions = PAINTED_MARKS.map((m) => ({
    label: `${m}m`,
    pos: markPositionOnTrack(m, LANE_1_LENGTH),
  }));

  const splits: Split[] = [];

  // Total laps (including partial first lap)
  const fullLaps = Math.floor(repDistance / trackLen);
  const hasPartialFirstLap = startPos > 0;

  if (hasPartialFirstLap) {
    // Partial first lap: from startPos → 0 (finish line)
    // Marks with position ∈ (0, startPos] are passed, ordered by distance-into-rep
    // A mark at position P is reached at (startPos - P) meters into the rep
    // (runner goes from startPos down to 0)

    const firstLapMarks = markPositions
      .filter((m) => m.pos > 0 && m.pos < startPos) // exclude marks at exact start position
      .map((m) => ({
        label: m.label,
        distanceIntoRep: startPos - m.pos,
      }))
      .sort((a, b) => a.distanceIntoRep - b.distanceIntoRep);

    splits.push(...firstLapMarks.map((m) => ({
      ...m,
      elapsedSeconds: m.distanceIntoRep * secsPerMeter,
    })));

    // Finish line crossing at end of partial first lap
    // (only add if there are more laps to go — otherwise the final "Finish" covers it)
    if (fullLaps > 0) {
      splits.push({
        label: "Finish line",
        distanceIntoRep: startPos,
        elapsedSeconds: startPos * secsPerMeter,
      });
    }
  }

  // Full laps: runner passes all marks once per lap
  for (let lap = 0; lap < fullLaps; lap++) {
    const lapStartDist = startPos + lap * trackLen;

    // All marks with pos > 0 are passed during a full lap
    // A mark at position P is reached at (trackLen - P) meters into the lap
    const fullLapMarks = markPositions
      .filter((m) => m.pos > 0)
      .map((m) => ({
        label: m.label,
        distanceIntoRep: lapStartDist + (trackLen - m.pos),
      }))
      .sort((a, b) => a.distanceIntoRep - b.distanceIntoRep);

    splits.push(...fullLapMarks.map((m) => ({
      ...m,
      elapsedSeconds: m.distanceIntoRep * secsPerMeter,
    })));

    // Finish line at end of this full lap
    const finishDist = lapStartDist + trackLen;
    // Only add finish line if it's not the very end (we add a final split below)
    if (finishDist < repDistance) {
      splits.push({
        label: "Finish line",
        distanceIntoRep: finishDist,
        elapsedSeconds: finishDist * secsPerMeter,
      });
    }
  }

  // Final split: the end of the rep
  const totalTime = repDistance * secsPerMeter;
  splits.push({
    label: "Finish",
    distanceIntoRep: repDistance,
    elapsedSeconds: totalTime,
  });

  return splits;
}

/**
 * Calculate all splits for a workout segment.
 */
export function calculateSegment(
  segment: Segment,
  segmentIndex: number,
): SegmentResult {
  const reps: RepResult[] = [];

  for (let i = 0; i < segment.reps; i++) {
    const splits = calculateRepSplits(
      segment.distance,
      segment.paceSeconds,
      segment.lane,
    );
    reps.push({
      repIndex: i,
      splits,
      totalDistance: segment.distance,
      totalTime: segment.distance * (segment.paceSeconds / 1000),
    });
  }

  return { segment, segmentIndex, reps };
}

/**
 * Calculate splits for an entire workout (multiple segments).
 */
export function calculateWorkout(segments: Segment[]): SegmentResult[] {
  return segments.map((seg, i) => calculateSegment(seg, i));
}

/**
 * Format seconds to mm:ss.s string.
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const secsStr = secs < 10 ? `0${secs.toFixed(1)}` : secs.toFixed(1);
  return `${mins}:${secsStr}`;
}

/**
 * Parse a mm:ss pace string to total seconds.
 * Returns NaN if invalid.
 */
export function parsePace(input: string): number {
  const parts = input.split(":");
  if (parts.length !== 2) return NaN;
  const mins = parseInt(parts[0], 10);
  const secs = parseFloat(parts[1]);
  if (isNaN(mins) || isNaN(secs) || mins < 0 || secs < 0 || secs >= 60) {
    return NaN;
  }
  return mins * 60 + secs;
}
