export interface Segment {
  reps: number;
  distance: number; // meters
  /** Pace in seconds per kilometer */
  paceSeconds: number;
  lane: 1 | 2 | 3;
}

export interface Split {
  /** Label shown to the user, e.g. "200m mark" or "Finish line" */
  label: string;
  /** Meters into this rep when the runner reaches this point */
  distanceIntoRep: number;
  /** Elapsed time in seconds at this point */
  elapsedSeconds: number;
}

export interface RepResult {
  repIndex: number;
  splits: Split[];
  totalDistance: number;
  totalTime: number;
}

export interface SegmentResult {
  segment: Segment;
  segmentIndex: number;
  reps: RepResult[];
}
