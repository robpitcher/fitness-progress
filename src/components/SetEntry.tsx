import { useCallback, useRef } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import {
  useSets,
  useAddSet,
  useUpdateSet,
  useDeleteSet,
  usePreviousPerformance,
} from "../hooks/useSets";
import type { Set } from "../types";

interface SetEntryProps {
  workoutExerciseId: string;
  exerciseId: string;
  workoutId: string;
  userId: string;
}

/** Formats previous performance as "Last: 3×10 @ 135 lbs" */
function formatPrevPerformance(
  sets: { set_number: number; reps: number | null; weight: number | null }[],
): string | null {
  if (sets.length === 0) return null;

  const parts = sets
    .filter((s) => s.reps != null)
    .map((s) => {
      const r = s.reps!;
      return s.weight != null ? `${r}×${s.weight}` : `${r} reps`;
    });

  if (parts.length === 0) return null;

  // If all sets have the same reps × weight, condense to "3×10 @ 135 lbs"
  const allSame = sets.every(
    (s) => s.reps === sets[0].reps && s.weight === sets[0].weight,
  );
  if (allSame && sets[0].reps != null) {
    const r = sets[0].reps;
    const w = sets[0].weight;
    const label =
      w != null
        ? `${sets.length}×${r} @ ${w} lbs`
        : `${sets.length}×${r}`;
    return `Last: ${label}`;
  }

  return `Last: ${parts.join(", ")}`;
}

function SetRow({
  set,
  onUpdate,
  onDelete,
  isDeleting,
}: {
  set: Set;
  onUpdate: (
    id: string,
    fields: { reps?: number | null; weight?: number | null },
  ) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleChange = useCallback(
    (field: "reps" | "weight", raw: string) => {
      clearTimeout(debounceRef.current);
      const value = raw === "" ? null : Number(raw);
      if (raw !== "" && isNaN(value as number)) return;

      debounceRef.current = setTimeout(() => {
        onUpdate(set.id, { [field]: value });
      }, 500);
    },
    [set.id, onUpdate],
  );

  return (
    <div className="flex items-center gap-2">
      {/* Set number badge */}
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        {set.set_number}
      </span>

      {/* Reps input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Reps"
          defaultValue={set.reps ?? ""}
          onChange={(e) => handleChange("reps", e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          aria-label={`Set ${set.set_number} reps`}
        />
      </div>

      {/* Weight input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="decimal"
          step="any"
          placeholder="Weight"
          defaultValue={set.weight ?? ""}
          onChange={(e) => handleChange("weight", e.target.value)}
          className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          aria-label={`Set ${set.set_number} weight`}
        />
      </div>

      {/* Delete set */}
      <button
        onClick={() => onDelete(set.id)}
        disabled={isDeleting}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-red-500 disabled:opacity-50 dark:text-gray-500 dark:hover:text-red-400"
        aria-label={`Delete set ${set.set_number}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function SetEntry({
  workoutExerciseId,
  exerciseId,
  workoutId,
  userId,
}: SetEntryProps) {
  const { data: sets = [], isLoading } = useSets(workoutExerciseId);
  const { data: prevSets = [] } = usePreviousPerformance(
    exerciseId,
    workoutId,
    userId,
  );

  const addSet = useAddSet();
  const updateSet = useUpdateSet();
  const deleteSet = useDeleteSet();

  const handleAddSet = () => {
    addSet.mutate({
      workout_exercise_id: workoutExerciseId,
      set_number: sets.length + 1,
      reps: null,
      weight: null,
    });
  };

  const handleUpdate = useCallback(
    (id: string, fields: { reps?: number | null; weight?: number | null }) => {
      updateSet.mutate({ id, ...fields });
    },
    [updateSet],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteSet.mutate(id);
    },
    [deleteSet],
  );

  const prevLabel = formatPrevPerformance(prevSets);

  return (
    <div className="mt-2 space-y-2">
      {/* Previous performance */}
      {prevLabel && (
        <p className="text-xs text-gray-400 dark:text-gray-500">{prevLabel}</p>
      )}

      {/* Column headers */}
      {sets.length > 0 && (
        <div className="flex items-center gap-2 px-0 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <span className="w-7 text-center">Set</span>
          <span className="flex-1 text-center">Reps</span>
          <span className="flex-1 text-center">Weight</span>
          <span className="w-[44px]" />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )}

      {/* Set rows */}
      {sets.map((s) => (
        <SetRow
          key={s.id}
          set={s}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isDeleting={deleteSet.isPending}
        />
      ))}

      {/* Add Set button */}
      <button
        onClick={handleAddSet}
        disabled={addSet.isPending}
        className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
      >
        {addSet.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        Add Set
      </button>
    </div>
  );
}
