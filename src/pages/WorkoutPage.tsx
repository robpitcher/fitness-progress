import { useState } from "react";
import { Plus, Dumbbell, Loader2, CheckCircle, Trophy } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";
import {
  useTodayWorkout,
  useCreateWorkout,
  useWorkoutExercises,
  useAddWorkoutExercise,
  useCompleteWorkout,
  useWorkoutSummary,
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
  const completeWorkout = useCompleteWorkout();

  const isCompleted = !!workout?.completed_at;

  const { data: summaryExercises = [], isLoading: loadingSummary } =
    useWorkoutSummary(isCompleted ? workout?.id : undefined);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const handleCompleteWorkout = () => {
    if (!workout) return;
    completeWorkout.mutate(
      { id: workout.id },
      { onSuccess: () => setConfirmOpen(false) },
    );
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

  // Completed workout — show summary
  if (isCompleted) {
    return (
      <div className="min-h-svh bg-white dark:bg-gray-950">
        <div className="border-b border-gray-200 px-4 py-6 text-center dark:border-gray-800">
          <Trophy className="mx-auto h-12 w-12 text-amber-500 dark:text-amber-400" aria-hidden="true" />
          <h1 className="mt-2 text-xl font-bold text-gray-900 dark:text-gray-100">
            Workout Complete!
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {new Date(workout.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="px-4 py-4">
          {loadingSummary ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          ) : summaryExercises.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No exercises were logged.
            </p>
          ) : (
            <ul className="space-y-3">
              {summaryExercises.map((ex) => (
                <li
                  key={ex.order}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-sm font-bold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {ex.name}
                      </p>
                      {ex.category && (
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {ex.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {ex.sets.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-2 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        <span className="w-7 text-center">Set</span>
                        <span className="flex-1 text-center">Reps</span>
                        <span className="flex-1 text-center">Weight</span>
                      </div>
                      {ex.sets.map((s) => (
                        <div
                          key={s.set_number}
                          className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-200 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            {s.set_number}
                          </span>
                          <span className="flex-1 text-center">
                            {s.reps ?? "\u2014"}
                          </span>
                          <span className="flex-1 text-center">
                            {s.weight != null ? `${s.weight} lbs` : "\u2014"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {ex.sets.length === 0 && (
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      No sets logged
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-center dark:border-indigo-800 dark:bg-indigo-950">
            <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              Great work! Come back tomorrow for your next session.
            </p>
          </div>
        </div>
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
              No exercises yet \u2014 tap below to add one
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
          {addExercise.isPending ? "Adding\u2026" : "Add Exercise"}
        </button>

        {addExercise.isError && (
          <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
            {addExercise.error.message}
          </p>
        )}

        {/* Complete Workout Button \u2014 visible when exercises have been added */}
        {workoutExercises.length > 0 && (
          <>
            {!confirmOpen ? (
              <button
                onClick={() => setConfirmOpen(true)}
                className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                <CheckCircle className="h-5 w-5" />
                Complete Workout
              </button>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-700 dark:bg-amber-950">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Finish this workout? You won&rsquo;t be able to edit it after.
                </p>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleCompleteWorkout}
                    disabled={completeWorkout.isPending}
                    className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
                  >
                    {completeWorkout.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {completeWorkout.isPending ? "Completing\u2026" : "Yes, Complete"}
                  </button>
                  <button
                    onClick={() => setConfirmOpen(false)}
                    disabled={completeWorkout.isPending}
                    className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
                {completeWorkout.isError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {completeWorkout.error.message}
                  </p>
                )}
              </div>
            )}
          </>
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
    </div>
  );
}
