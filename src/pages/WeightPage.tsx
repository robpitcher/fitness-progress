import { useState, type FormEvent } from "react";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUpsertBodyWeight } from "../hooks/useBodyWeight";

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function WeightPage() {
  const { user } = useAuth();
  const upsert = useUpsertBodyWeight();

  const [date, setDate] = useState(todayISO);
  const [weight, setWeight] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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
      </div>
    </div>
  );
}
