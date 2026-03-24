import { useState } from "react";
import { Plus, Dumbbell, Loader2, Trash2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import {
  useTodayWorkout,
  useCreateWorkout,
  useWorkoutExercises,
  useAddWorkoutExercise,
  useDeleteWorkoutExercise,
} from "../hooks/useWorkoutSession";
import type { Exercise } from "../types";
import ExercisePicker from "../components/ExercisePicker";
import SetEntry from "../components/SetEntry";

export default function WorkoutPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const userId = user?.id;

  const { data: todayWorkouts = [], isLoading: loadingWorkout } =
    useTodayWorkout(userId);
  const workout = todayWorkouts[0] ?? null;

  const { data: workoutExercises = [], isLoading: loadingExercises } =
    useWorkoutExercises(workout?.id);

  const createWorkout = useCreateWorkout();
  const addExercise = useAddWorkoutExercise();
  const deleteExercise = useDeleteWorkoutExercise();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleStartWorkout = () => {
    if (!userId) return;
    createWorkout.mutate({ user_id: userId });
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (!workout) return;
    addExercise.mutate({
      workout_id: workout.id,
      exercise_id: exercise.id,
      order: workoutExercises.length + 1,
    });
  };

  const handleDeleteExercise = (id: string) => {
    deleteExercise.mutate(id, {
      onSettled: () => setConfirmDeleteId(null),
    });
  };

  if (loadingWorkout) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-white dark:bg-gray-950" role="status" aria-label="Loading workout">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  // No workout today — show Start Workout
  if (!workout) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-white px-4 dark:bg-gray-950">
        <Dumbbell className="h-16 w-16 text-gray-300 dark:text-gray-700" aria-hidden="true" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Start a Workout
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400">
          {profile?.display_name
            ? `Ready to train, ${profile.display_name}?`
            : "No workout started today"}
        </p>
        <button
          onClick={handleStartWorkout}
          disabled={createWorkout.isPending}
          className="flex min-h-[44px] items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          {createWorkout.isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Starting…
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              Start Workout
            </>
          )}
        </button>
        {createWorkout.isError && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {createWorkout.error.message}
          </p>
        )}
      </div>
    );
  }

  // Active workout
  return (
    <div className="min-h-svh bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-800">
        {profile?.display_name && (
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            Hey, {profile.display_name} 👋
          </p>
        )}
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Today&rsquo;s Workout
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {new Date(workout.date).toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Exercise List */}
      <div className="px-4 py-4">
        {loadingExercises ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : workoutExercises.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Dumbbell className="h-10 w-10 text-gray-300 dark:text-gray-700" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No exercises yet — tap below to add one
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {workoutExercises.map((we) => (
              <li
                key={we.id}
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                    {we.order}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {we.exercises.name}
                    </p>
                    {we.exercises.category && (
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {we.exercises.category}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setConfirmDeleteId(we.id)}
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                    aria-label={`Remove ${we.exercises.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {userId && workout && (
                  <SetEntry
                    workoutExerciseId={we.id}
                    exerciseId={we.exercise_id}
                    workoutId={workout.id}
                    userId={userId}
                  />
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Add Exercise Button */}
        <button
          onClick={() => setPickerOpen(true)}
          disabled={addExercise.isPending}
          className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
        >
          <Plus className="h-4 w-4" />
          {addExercise.isPending ? "Adding…" : "Add Exercise"}
        </button>

        {addExercise.isError && (
          <p role="alert" className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
            {addExercise.error.message}
          </p>
        )}
      </div>

      {/* Exercise Picker */}
      {userId && (
        <ExercisePicker
          userId={userId}
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onSelect={handleSelectExercise}
        />
      )}

      {/* Delete Exercise Confirmation */}
      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm exercise removal"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Remove Exercise?
            </h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This will delete the exercise and all its sets from this workout.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="min-h-[44px] flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteExercise(confirmDeleteId)}
                disabled={deleteExercise.isPending}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
              >
                {deleteExercise.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
