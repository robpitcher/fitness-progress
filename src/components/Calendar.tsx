import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface CalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  workoutDates: Set<string>;
}

export default function Calendar({
  currentMonth,
  onMonthChange,
  selectedDate,
  onSelectDate,
  workoutDates,
}: CalendarProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  return (
    <div className="w-full">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between px-2 pb-4">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-600 transition-colors active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {format(currentMonth, "MMMM yyyy")}
        </h2>

        <button
          type="button"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-gray-600 transition-colors active:bg-gray-100 dark:text-gray-400 dark:active:bg-gray-800"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 pb-1">
        {WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;
          const hasWorkout = workoutDates.has(format(day, "yyyy-MM-dd"));

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              className={`relative flex min-h-[44px] flex-col items-center justify-center transition-colors ${
                !inMonth
                  ? "text-gray-300 dark:text-gray-700"
                  : selected
                    ? "rounded-full bg-indigo-600 font-semibold text-white dark:bg-indigo-500"
                    : today
                      ? "font-semibold text-indigo-600 dark:text-indigo-400"
                      : "text-gray-900 active:bg-gray-100 dark:text-gray-100 dark:active:bg-gray-800"
              }`}
            >
              <span className="text-sm">{format(day, "d")}</span>
              {hasWorkout && (
                <span
                  className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${
                    selected
                      ? "bg-white"
                      : "bg-indigo-500 dark:bg-indigo-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
