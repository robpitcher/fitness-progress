import { useMemo, useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Dumbbell, Loader2, Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useExercises } from "../hooks/useExercises";
import { useExerciseMuscles } from "../hooks/useExerciseMuscles";
import type { Exercise } from "../types";

interface ExerciseDetailProps {
  exercise: Exercise;
  onClose: () => void;
}

function ExerciseDetail({ exercise, onClose }: ExerciseDetailProps) {
  const { data: muscles = [], isLoading } = useExerciseMuscles(exercise.id);

  const primaryMuscles = muscles.filter((m) => m.muscle_role === "primary");
  const secondaryMuscles = muscles.filter((m) => m.muscle_role === "secondary");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {exercise.name}
            </h2>
            {exercise.category && (
              <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                {exercise.category}
              </span>
            )}
            {exercise.user_id && (
              <span className="ml-2 inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                Custom
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Training Notes */}
            {exercise.training_notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Training Notes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {exercise.training_notes}
                </p>
              </div>
            )}

            {/* Primary Muscles */}
            {primaryMuscles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Primary Muscles
                </h3>
                <ul className="space-y-1">
                  {primaryMuscles.map((muscle) => (
                    <li
                      key={muscle.id}
                      className="text-sm font-medium text-indigo-700 dark:text-indigo-400"
                    >
                      • {muscle.muscle_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Secondary Muscles */}
            {secondaryMuscles.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Muscles
                </h3>
                <ul className="space-y-1">
                  {secondaryMuscles.map((muscle) => (
                    <li
                      key={muscle.id}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      • {muscle.muscle_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!exercise.training_notes && muscles.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No muscle targeting information available for this exercise.
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full min-h-[44px] rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function ExerciseLibraryPage() {
  const { user } = useAuth();
  const { data: exercises = [], isLoading } = useExercises(user?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Group exercises by category
  const exercisesByCategory = useMemo(() => {
    const filtered = exercises.filter((ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped: Record<string, Exercise[]> = {};
    for (const exercise of filtered) {
      const category = exercise.category || "Uncategorized";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(exercise);
    }

    // Sort exercises within each category by name
    for (const category in grouped) {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name));
    }

    return grouped;
  }, [exercises, searchQuery]);

  const categories = Object.keys(exercisesByCategory).sort();

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="min-h-svh bg-white px-4 pt-6 pb-4 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Exercise Library
          </h1>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="min-h-[48px] w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 py-12 dark:border-gray-700">
            <Dumbbell className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? "No exercises found" : "No exercises available"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const categoryExercises = exercisesByCategory[category];
              const isExpanded = expandedCategory === category;

              return (
                <div
                  key={category}
                  className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Category header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {category}
                      </h2>
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {categoryExercises.length}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>

                  {/* Exercise list */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-800">
                      {categoryExercises.map((exercise) => (
                        <button
                          key={exercise.id}
                          type="button"
                          onClick={() => setSelectedExercise(exercise)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-800 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <Dumbbell className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {exercise.name}
                            </span>
                            {exercise.user_id && (
                              <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                Custom
                              </span>
                            )}
                          </div>
                          <svg
                            className="h-5 w-5 text-gray-400 dark:text-gray-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Exercise detail modal */}
      {selectedExercise && (
        <ExerciseDetail
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}
