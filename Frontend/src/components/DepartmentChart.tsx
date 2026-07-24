import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface Props {
  data: {
    department: string;
    count: number;
  }[];
}

function DepartmentChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={450}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 70,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" />

        <XAxis
          dataKey="department"
          angle={-25}
          textAnchor="end"
          interval={0}
          height={80}
          tick={{
            fill: "#a1a1aa",
            fontSize: 13,
          }}
        />

        <YAxis
          allowDecimals={false}
          tick={{
            fill: "#a1a1aa",
          }}
        />

        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        />

        <Bar
          dataKey="count"
          fill="#6366f1"
          radius={[8, 8, 0, 0]}
          barSize={45}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default DepartmentChart;
