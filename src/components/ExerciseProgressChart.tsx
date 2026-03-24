import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTheme } from "../hooks/useTheme";
import type { ProgressDataPoint } from "../hooks/useExerciseProgress";

interface ExerciseProgressChartProps {
  data: ProgressDataPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function ExerciseProgressChart({
  data,
}: ExerciseProgressChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const axisColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const lineColor = isDark ? "#818cf8" : "#4f46e5";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: axisColor, fontSize: 12 }}
          stroke={gridColor}
        />
        <YAxis
          tick={{ fill: axisColor, fontSize: 12 }}
          stroke={gridColor}
          label={{
            value: "Weight",
            angle: -90,
            position: "insideLeft",
            fill: axisColor,
            fontSize: 12,
          }}
        />
        <Tooltip
          labelFormatter={(label) => formatDate(String(label))}
          formatter={(value) => [`${value}`, "Max Weight"]}
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 8,
            color: isDark ? "#f3f4f6" : "#111827",
          }}
        />
        <Line
          type="monotone"
          dataKey="maxWeight"
          stroke={lineColor}
          strokeWidth={2}
          dot={{ fill: lineColor, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
