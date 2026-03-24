import { useState, type FormEvent } from "react";
import { CheckCircle, Pencil, Scale, Trash2, X } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import {
  useBodyWeights,
  useUpsertBodyWeight,
  useUpdateBodyWeight,
  useDeleteBodyWeight,
} from "../hooks/useBodyWeight";
import type { BodyWeight } from "../types";

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${month}/${day}/${year}`;
}

export default function WeightPage() {
  const { user } = useAuth();
  const upsert = useUpsertBodyWeight();
  const updateMutation = useUpdateBodyWeight();
  const deleteMutation = useDeleteBodyWeight();
  const { data: entries = [], isLoading } = useBodyWeights(user?.id);

  const [date, setDate] = useState(todayISO);
  const [weight, setWeight] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");

  // Delete confirmation state
  const [deletingEntry, setDeletingEntry] = useState<BodyWeight | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    const parsed = parseFloat(weight);
    if (isNaN(parsed) || parsed <= 0) return;

    await upsert.mutateAsync({
      user_id: user.id,
      date,
      weight: parsed,
    });

    setShowSuccess(true);
    setWeight("");
    setTimeout(() => setShowSuccess(false), 3000);
  }

  function startEdit(entry: BodyWeight) {
    setEditingId(entry.id);
    setEditWeight(String(entry.weight));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditWeight("");
  }

  async function saveEdit(entry: BodyWeight) {
    const parsed = parseFloat(editWeight);
    if (isNaN(parsed) || parsed <= 0) return;
    await updateMutation.mutateAsync({ id: entry.id, weight: parsed });
    setEditingId(null);
    setEditWeight("");
  }

  async function confirmDelete() {
    if (!deletingEntry) return;
    await deleteMutation.mutateAsync(deletingEntry.id);
    setDeletingEntry(null);
  }

  return (
    <div className="min-h-svh bg-white px-4 pt-6 pb-20 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Log Weight
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="bw-date"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Date
            </label>
            <input
              id="bw-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-[48px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </div>

          <div>
            <label
              htmlFor="bw-weight"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Weight (lbs)
            </label>
            <input
              id="bw-weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 175.5"
              className="min-h-[48px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
            />
          </div>

          {upsert.isError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {upsert.error?.message ?? "Failed to save"}
            </div>
          )}

          {showSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle className="h-5 w-5 shrink-0" />
              Weight saved successfully!
            </div>
          )}

          <button
            type="submit"
            disabled={upsert.isPending}
            className="min-h-[48px] w-full rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-950"
          >
            {upsert.isPending ? "Saving…" : "Save"}
          </button>
        </form>

        {/* History List */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            History
          </h2>

          {isLoading ? (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Loading…
            </p>
          ) : entries.length === 0 ? (
            <div className="mt-3 flex flex-col items-center rounded-lg border border-dashed border-gray-300 py-8 dark:border-gray-700">
              <Scale className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No entries yet. Log your first weight above!
              </p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-gray-200 overflow-y-auto dark:divide-gray-800">
              {entries.map((entry) => (
                <li key={entry.id} className="py-3">
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(entry.date)}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0"
                        autoFocus
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveEdit(entry);
                          } else if (e.key === "Escape") {
                            cancelEdit();
                          }
                        }}
                        className="min-h-[36px] w-24 rounded-md border border-indigo-400 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-indigo-500 dark:bg-gray-900 dark:text-gray-100"
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        lbs
                      </span>
                      <div className="ml-auto flex gap-1">
                        <button
                          type="button"
                          onClick={() => saveEdit(entry)}
                          disabled={updateMutation.isPending}
                          className="min-h-[36px] min-w-[36px] rounded-md bg-indigo-600 px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                          {updateMutation.isPending ? "…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="min-h-[36px] min-w-[36px] rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          aria-label="Cancel edit"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(entry.date)}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {entry.weight} lbs
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(entry)}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-gray-400 transition-colors hover:text-indigo-600 dark:text-gray-500 dark:hover:text-indigo-400"
                          aria-label={`Edit weight for ${formatDate(entry.date)}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingEntry(entry)}
                          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-gray-400 transition-colors hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                          aria-label={`Delete weight for ${formatDate(entry.date)}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Delete confirmation modal */}
      {deletingEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setDeletingEntry(null)}
        >
          <div
            className="w-full max-w-xs rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Delete Entry
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Delete the {deletingEntry.weight} lbs entry from{" "}
              {formatDate(deletingEntry.date)}? This cannot be undone.
            </p>

            {deleteMutation.isError && (
              <div className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                {deleteMutation.error?.message ?? "Failed to delete"}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className="min-h-[44px] flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="min-h-[44px] flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
