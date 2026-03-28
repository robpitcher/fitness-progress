import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { Dumbbell, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { useWorkoutDates } from "../hooks/useWorkouts";
import {
  useWorkoutDetail,
  type WorkoutDetailExercise,
} from "../hooks/useWorkoutDetail";
import { useDeleteWorkout } from "../hooks/useWorkoutSession";

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

  const deleteWorkout = useDeleteWorkout();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleStartWorkout = () => {
    // If a past date is selected, navigate to workout creation for that date
    if (selectedDateStr && !isSameDay(selectedDate!, new Date())) {
      navigate(`/workout/${selectedDateStr}`);
    } else {
      // For today, navigate to the default workout page
      navigate("/workout");
    }
  };

  const handleEditWorkout = (date: string) => {
    navigate(`/workout/${date}`);
  };

  // Check if selected date is in the future
  const isFutureDate = selectedDate && selectedDate > new Date();

  return (
    <div className="min-h-svh bg-white px-4 pt-6 pb-4 dark:bg-gray-950">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Calendar
      </h1>

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
          ) : detail?.exercises ? (
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

              {/* Edit / Delete Workout buttons */}
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleEditWorkout(detail.workout.date)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white active:bg-indigo-700 dark:bg-indigo-500 dark:active:bg-indigo-600"
                >
                  <Pencil className="h-4 w-4" />
                  Edit Workout
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white active:bg-red-700 dark:bg-red-500 dark:active:bg-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>

              {/* Delete confirmation modal */}
              {showDeleteConfirm && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <div
                    className="w-full max-w-xs rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Delete Workout
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Delete workout on{" "}
                      {format(selectedDate!, "MMMM d, yyyy")}? All exercises
                      and sets will be permanently removed.
                    </p>

                    {deleteWorkout.isError && (
                      <div className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {deleteWorkout.error?.message ?? "Failed to delete"}
                      </div>
                    )}

                    <div className="mt-5 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteWorkout.mutate(detail.workout.id, {
                            onSuccess: () => {
                              setShowDeleteConfirm(false);
                              setSelectedDate(null);
                            },
                          });
                        }}
                        disabled={deleteWorkout.isPending}
                        className="min-h-[44px] flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
                      >
                        {deleteWorkout.isPending ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No workout logged
              </p>
              {!isFutureDate && (
                <button
                  type="button"
                  onClick={handleStartWorkout}
                  className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white active:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Start a workout
                </button>
              )}
              {isFutureDate && (
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Cannot create workouts for future dates
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
