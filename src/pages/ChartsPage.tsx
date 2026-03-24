import { useMemo, useState } from "react";
import { Scale, TrendingUp } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  useLoggedExercises,
  useExerciseProgress,
} from "../hooks/useExerciseProgress";
import { useBodyWeights } from "../hooks/useBodyWeight";
import ExerciseProgressChart from "../components/ExerciseProgressChart";
import BodyWeightChart from "../components/BodyWeightChart";
import TimeRangeFilter from "../components/TimeRangeFilter";
import {
  DEFAULT_TIME_RANGE,
  filterByDateRange,
  type TimeRange,
} from "../lib/timeRange";

export default function ChartsPage() {
  const { user } = useAuth();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [timeRange, setTimeRange] = useState<TimeRange>(DEFAULT_TIME_RANGE);

  const { data: exercises, isLoading: exercisesLoading } = useLoggedExercises(
    user?.id,
  );

  const { data: progressData, isLoading: progressLoading } =
    useExerciseProgress(selectedExerciseId || undefined);

  const { data: bodyWeightData, isLoading: bodyWeightLoading } =
    useBodyWeights(user?.id);

  const filteredProgressData = useMemo(
    () => (progressData ? filterByDateRange(progressData, timeRange) : []),
    [progressData, timeRange],
  );

  const filteredBodyWeightData = useMemo(() => {
    if (!bodyWeightData) return [];
    const sorted = [...bodyWeightData].sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    return filterByDateRange(sorted, timeRange);
  }, [bodyWeightData, timeRange]);

  return (
    <div className="min-h-svh bg-white px-4 pt-6 pb-4 dark:bg-gray-950">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Charts
        </h1>
        <TimeRangeFilter value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Exercise Progression */}
      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Exercise Progression
        </h2>

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
          className="mb-4 min-h-[44px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
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

        {!selectedExerciseId && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
            <TrendingUp className="mb-3 h-12 w-12" />
            <p className="text-sm">Select an exercise to view progression</p>
          </div>
        )}

        {selectedExerciseId && progressLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        )}

        {selectedExerciseId &&
          !progressLoading &&
          filteredProgressData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <TrendingUp className="mb-3 h-12 w-12" />
              <p className="text-sm">
                No data for this exercise in the selected range
              </p>
            </div>
          )}

        {selectedExerciseId &&
          !progressLoading &&
          filteredProgressData.length > 0 && (
            <ExerciseProgressChart data={filteredProgressData} />
          )}
      </section>

      {/* Body Weight */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
          Body Weight
        </h2>

        {bodyWeightLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        )}

        {!bodyWeightLoading && filteredBodyWeightData.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
            <Scale className="mb-3 h-12 w-12" />
            <p className="text-sm">
              No body weight data in the selected range
            </p>
          </div>
        )}

        {!bodyWeightLoading && filteredBodyWeightData.length > 0 && (
          <BodyWeightChart data={filteredBodyWeightData} />
        )}
      </section>
    </div>
  );
}
