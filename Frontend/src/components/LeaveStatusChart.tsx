import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#f59e0b", "#10b981", "#ef4444", "#6366f1"];

interface Props {
  data: {
    name: string;
    value: number;
  }[];
}

function LeaveStatusChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default LeaveStatusChart;
