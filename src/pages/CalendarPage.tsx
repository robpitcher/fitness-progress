import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { Dumbbell, Loader2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { useWorkoutDates } from "../hooks/useWorkouts";
import {
  useWorkoutDetail,
  type WorkoutDetailExercise,
} from "../hooks/useWorkoutDetail";

function ExerciseCard({ item }: { item: WorkoutDetailExercise }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <Dumbbell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {item.exercise.name}
        </h4>
        {item.exercise.category && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            {item.exercise.category}
          </span>
        )}
      </div>

      {item.sets.length > 0 ? (
        <table className="mt-2 w-full text-left text-xs">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400">
              <th className="pb-1 font-medium">Set</th>
              <th className="pb-1 font-medium">Reps</th>
              <th className="pb-1 font-medium">Weight</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-300">
            {item.sets.map((s) => (
              <tr key={s.id}>
                <td className="py-0.5">{s.set_number}</td>
                <td className="py-0.5">{s.reps ?? "—"}</td>
                <td className="py-0.5">
                  {s.weight != null ? `${s.weight} lbs` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          No sets recorded
        </p>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    () => new Date(),
  );

  const { data: workoutRows, isLoading } = useWorkoutDates(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
  );

  const workoutDates = useMemo(
    () => new Set((workoutRows ?? []).map((w) => w.date)),
    [workoutRows],
  );

  const selectedDateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : null;

  const { data: detail, isLoading: loadingDetail } =
    useWorkoutDetail(selectedDateStr);

  const handleStartWorkout = () => {
    navigate("/workout");
  };

  return (
    <div className="min-h-svh bg-white px-4 pt-6 pb-20 dark:bg-gray-950">
      <Calendar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        workoutDates={workoutDates}
      />

      {/* Selected date detail */}
      {selectedDate && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
            {isSameDay(selectedDate, new Date()) && (
              <span className="ml-2 text-xs font-normal text-indigo-600 dark:text-indigo-400">
                Today
              </span>
            )}
          </h3>

          {isLoading || loadingDetail ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading…</span>
            </div>
          ) : detail ? (
            <div className="mt-3 space-y-3">
              {/* Workout summary header */}
              <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                <Dumbbell className="h-4 w-4" />
                <span>
                  {detail.exercises.length}{" "}
                  {detail.exercises.length === 1 ? "exercise" : "exercises"}
                  {" · "}
                  {detail.exercises.reduce(
                    (acc, ex) => acc + ex.sets.length,
                    0,
                  )}{" "}
                  {detail.exercises.reduce(
                    (acc, ex) => acc + ex.sets.length,
                    0,
                  ) === 1
                    ? "set"
                    : "sets"}
                </span>
              </div>

              {/* Exercise cards */}
              <div className="space-y-2">
                {detail.exercises.map((item) => (
                  <ExerciseCard key={item.id} item={item} />
                ))}
              </div>

              {detail.workout.notes && (
                <p className="text-xs text-gray-600 italic dark:text-gray-400">
                  {detail.workout.notes}
                </p>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No workout logged
              </p>
              <button
                type="button"
                onClick={handleStartWorkout}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white active:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Start a workout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
