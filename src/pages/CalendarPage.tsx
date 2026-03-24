import { useMemo, useState } from "react";
import { format, isSameDay } from "date-fns";
import { Dumbbell } from "lucide-react";
import Calendar from "../components/Calendar";
import { useWorkoutDates } from "../hooks/useWorkouts";

export default function CalendarPage() {
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
  const selectedHasWorkout = selectedDateStr
    ? workoutDates.has(selectedDateStr)
    : false;

  return (
    <div className="min-h-svh bg-white px-4 pt-6 pb-20 dark:bg-gray-950">
      <Calendar
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        workoutDates={workoutDates}
      />

      {/* Selected date info */}
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

          {isLoading ? (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Loading…
            </p>
          ) : selectedHasWorkout ? (
            <div className="mt-2 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
              <Dumbbell className="h-4 w-4" />
              <span>Workout logged</span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No workouts
            </p>
          )}
        </div>
      )}
    </div>
  );
}
