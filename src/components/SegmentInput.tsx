import type { Segment } from "../types/workout";

const COMMON_DISTANCES = [100, 200, 300, 400, 600, 800, 1000, 1500, 2000, 3000, 5000];

interface Props {
  segment: Segment;
  index: number;
  onChange: (index: number, segment: Segment) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export default function SegmentInput({
  segment,
  index,
  onChange,
  onRemove,
  canRemove,
}: Props) {
  const paceMinutes = Math.floor(segment.paceSeconds / 60);
  const paceSeconds = Math.round(segment.paceSeconds % 60);
  const paceStr = `${paceMinutes}:${paceSeconds.toString().padStart(2, "0")}`;

  function updateField(fields: Partial<Segment>) {
    onChange(index, { ...segment, ...fields });
  }

  function handlePaceChange(value: string) {
    const parts = value.split(":");
    if (parts.length !== 2) return;
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (isNaN(mins) || isNaN(secs)) return;
    if (mins < 0 || secs < 0 || secs >= 60) return;
    updateField({ paceSeconds: mins * 60 + secs });
  }

  return (
    <div className="bg-slate-800 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">
          Segment {index + 1}
        </span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-slate-500 hover:text-red-400 text-sm px-2"
            aria-label="Remove segment"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Reps */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Reps</label>
          <input
            type="number"
            min={1}
            max={100}
            value={segment.reps}
            onChange={(e) =>
              updateField({ reps: Math.max(1, parseInt(e.target.value, 10) || 1) })
            }
            className="w-full bg-slate-700 rounded px-3 py-2 text-sm tabular-nums"
          />
        </div>

        {/* Distance */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Distance (m)
          </label>
          <select
            value={
              COMMON_DISTANCES.includes(segment.distance)
                ? segment.distance
                : "custom"
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val !== "custom") {
                updateField({ distance: parseInt(val, 10) });
              }
            }}
            className="w-full bg-slate-700 rounded px-3 py-2 text-sm"
          >
            {COMMON_DISTANCES.map((d) => (
              <option key={d} value={d}>
                {d}m
              </option>
            ))}
            <option value="custom">Custom…</option>
          </select>
        </div>

        {/* Custom distance input */}
        {!COMMON_DISTANCES.includes(segment.distance) && (
          <div className="col-span-2">
            <label className="block text-xs text-slate-400 mb-1">
              Custom distance (m)
            </label>
            <input
              type="number"
              min={1}
              value={segment.distance}
              onChange={(e) =>
                updateField({
                  distance: Math.max(1, parseInt(e.target.value, 10) || 1),
                })
              }
              className="w-full bg-slate-700 rounded px-3 py-2 text-sm tabular-nums"
            />
          </div>
        )}

        {/* Pace */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">
            Pace (min:ss/km)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={paceStr}
            onChange={(e) => handlePaceChange(e.target.value)}
            placeholder="3:15"
            className="w-full bg-slate-700 rounded px-3 py-2 text-sm tabular-nums"
          />
        </div>

        {/* Lane */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Lane</label>
          <div className="flex gap-1">
            {([1, 2, 3] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => updateField({ lane: l })}
                className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                  segment.lane === l
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
