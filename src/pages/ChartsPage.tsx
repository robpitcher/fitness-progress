import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  useLoggedExercises,
  useExerciseProgress,
} from "../hooks/useExerciseProgress";
import ExerciseProgressChart from "../components/ExerciseProgressChart";

export default function ChartsPage() {
  const { user } = useAuth();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");

  const {
    data: exercises,
    isLoading: exercisesLoading,
  } = useLoggedExercises(user?.id);

  const {
    data: progressData,
    isLoading: progressLoading,
  } = useExerciseProgress(selectedExerciseId || undefined);

  return (
    <div className="min-h-svh bg-white px-4 pt-6 dark:bg-gray-950">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Charts
      </h1>

      {/* Exercise selector */}
      <label
        htmlFor="exercise-select"
        className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Exercise
      </label>
      <select
        id="exercise-select"
        value={selectedExerciseId}
        onChange={(e) => setSelectedExerciseId(e.target.value)}
        disabled={exercisesLoading}
        className="mb-6 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
      >
        <option value="">
          {exercisesLoading ? "Loading…" : "Select an exercise"}
        </option>
        {exercises?.map((ex) => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>

      {/* Chart area */}
      {!selectedExerciseId && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
          <TrendingUp className="mb-3 h-12 w-12" />
          <p className="text-sm">Select an exercise to view progression</p>
        </div>
      )}

      {selectedExerciseId && progressLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      )}

      {selectedExerciseId &&
        !progressLoading &&
        progressData &&
        progressData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <TrendingUp className="mb-3 h-12 w-12" />
            <p className="text-sm">No data recorded for this exercise yet</p>
          </div>
        )}

      {selectedExerciseId &&
        !progressLoading &&
        progressData &&
        progressData.length > 0 && (
          <ExerciseProgressChart data={progressData} />
        )}
    </div>
  );
}
