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

export interface BodyWeightDataPoint {
  date: string;
  weight: number;
}

interface BodyWeightChartProps {
  data: BodyWeightDataPoint[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function BodyWeightChart({ data }: BodyWeightChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const axisColor = isDark ? "#9ca3af" : "#6b7280";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const lineColor = isDark ? "#34d399" : "#059669";
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
          domain={["dataMin - 2", "dataMax + 2"]}
          label={{
            value: "lbs",
            angle: -90,
            position: "insideLeft",
            fill: axisColor,
            fontSize: 12,
          }}
        />
        <Tooltip
          labelFormatter={(label) => formatDate(String(label))}
          formatter={(value) => [`${value} lbs`, "Weight"]}
          contentStyle={{
            backgroundColor: tooltipBg,
            border: `1px solid ${tooltipBorder}`,
            borderRadius: 8,
            color: isDark ? "#f3f4f6" : "#111827",
          }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke={lineColor}
          strokeWidth={2}
          dot={{ fill: lineColor, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
