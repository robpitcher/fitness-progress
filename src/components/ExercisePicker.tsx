import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Plus, Dumbbell, User } from "lucide-react";
import { useExercises } from "../hooks/useExercises";
import { useCategories } from "../hooks/useCategories";
import { useCreateExercise } from "../hooks/useCreateExercise";
import type { Exercise } from "../types";

interface ExercisePickerProps {
  userId: string;
  open: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

/**
 * Outer wrapper — conditionally renders the inner panel so that
 * all local state resets naturally on unmount/remount.
 */
export default function ExercisePicker(props: ExercisePickerProps) {
  if (!props.open) return null;
  return <ExercisePickerInner {...props} />;
}

type View = "list" | "create";

function ExercisePickerInner({
  userId,
  onClose,
  onSelect,
}: ExercisePickerProps) {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("list");
  const [newName, setNewName] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<string>("");
  const searchRef = useRef<HTMLInputElement>(null);

  const { data: exercises = [], isLoading } = useExercises(userId);
  const { data: categories = [] } = useCategories(userId);
  const createExercise = useCreateExercise();

  // Focus search input on mount
  useEffect(() => {
    const id = setTimeout(() => searchRef.current?.focus(), 100);
    return () => clearTimeout(id);
  }, []);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((e) => e.name.toLowerCase().includes(q));
  }, [exercises, search]);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;

    createExercise.mutate(
      {
        name,
        category: null, // Keep for backward compatibility
        category_id: newCategoryId || null,
        user_id: userId,
      },
      {
        onSuccess: (exercise) => {
          onSelect(exercise);
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label="Exercise picker"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white sm:max-w-lg sm:rounded-2xl dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {view === "list" ? "Add Exercise" : "New Custom Exercise"}
          </h2>
          <button
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {view === "list" ? (
          <>
            {/* Search */}
            <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-800">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search exercises…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="min-h-[44px] w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-sm text-gray-500 dark:text-gray-400">
                  Loading exercises…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-sm text-gray-500 dark:text-gray-400">
                  <span>No exercises found</span>
                  {search.trim() && (
                    <button
                      onClick={() => {
                        setNewName(search.trim());
                        setView("create");
                      }}
                      className="text-indigo-600 underline dark:text-indigo-400"
                    >
                      Create &ldquo;{search.trim()}&rdquo;
                    </button>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filtered.map((exercise) => (
                    <li key={exercise.id}>
                      <button
                        onClick={() => {
                          onSelect(exercise);
                          onClose();
                        }}
                        className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-800 dark:active:bg-gray-700"
                      >
                        {exercise.user_id ? (
                          <User className="h-5 w-5 shrink-0 text-indigo-500 dark:text-indigo-400" />
                        ) : (
                          <Dumbbell className="h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                            {exercise.name}
                          </p>
                          {exercise.category && (
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {exercise.category}
                            </p>
                          )}
                        </div>
                        {exercise.user_id && (
                          <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                            Custom
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add Custom Exercise button */}
              <div className="border-t border-gray-200 p-3 dark:border-gray-800">
                <button
                  onClick={() => setView("create")}
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Exercise
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Create Exercise Form */
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <div>
              <label
                htmlFor="exercise-name"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Exercise Name
              </label>
              <input
                id="exercise-name"
                type="text"
                placeholder="e.g. Bulgarian Split Squat"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="exercise-category"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category <span className="text-gray-400">(optional)</span>
              </label>
              <select
                id="exercise-category"
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">None</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.user_id === null ? ' (Default)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-auto flex gap-3 pt-4">
              <button
                onClick={() => setView("list")}
                className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || createExercise.isPending}
                className="flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {createExercise.isPending ? "Creating…" : "Create & Add"}
              </button>
            </div>

            {createExercise.isError && (
              <p className="text-center text-sm text-red-600 dark:text-red-400">
                {createExercise.error.message}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
