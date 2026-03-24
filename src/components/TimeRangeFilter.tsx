import { TIME_RANGE_OPTIONS, type TimeRange } from "../lib/timeRange";

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export default function TimeRangeFilter({
  value,
  onChange,
}: TimeRangeFilterProps) {
  return (
    <div className="flex gap-1.5" role="group" aria-label="Time range filter">
      {TIME_RANGE_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={`min-h-[36px] min-w-[44px] rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-indigo-600 text-white dark:bg-indigo-500"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
