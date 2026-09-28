/** Charts shared React component used by website or dashboards. */
import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
const fmt = (v) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(v);
const tooltip = {
  contentStyle: {
    border: "1px solid var(--chart-tooltip-border)",
    borderRadius: 12,
    boxShadow: "0 14px 32px var(--chart-tooltip-shadow)",
    background: "var(--chart-tooltip-bg)",
    color: "var(--chart-tooltip-text)",
    fontSize: 12,
  },
  itemStyle: { color: "var(--chart-accent)" },
  labelStyle: { color: "var(--chart-tooltip-text)", marginBottom: 5 },
  cursor: { fill: "var(--chart-hover)" },
};
const empty = (
  <div className="chart-empty">
    Add transactions to see your financial picture.
  </div>
);
export function TrendChart({ data = [], currency = "PKR" }) {
  if (!data.length) return empty;
  const rows = data.map((x) => ({
    name: x.label,
    Income: x.incomeMinor / 100,
    Expenses: x.expenseMinor / 100,
  }));
  return (
    <div className="chart-frame">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={rows}
          margin={{
            top: 8,
            right: 10,
            bottom: 0,
            left: -24,
          }}
        >
          <defs>
            <linearGradient id="area-income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#77f75b" stopOpacity=".24" />
              <stop offset="100%" stopColor="#77f75b" stopOpacity="0" />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="var(--chart-grid)"
            strokeDasharray="4 5"
          />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 12,
              fill: "var(--chart-axis)",
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={fmt}
            tick={{
              fontSize: 12,
              fill: "var(--chart-axis)",
            }}
          />
          <Tooltip
            {...tooltip}
            formatter={(v) => `${currency} ${Number(v).toLocaleString()}`}
          />
          <Area
            type="monotone"
            dataKey="Income"
            stroke="#76f758"
            strokeWidth={3}
            fill="url(#area-income)"
          />
          <Area
            type="monotone"
            dataKey="Expenses"
            stroke="#ffbb7f"
            strokeWidth={2.5}
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
const colors = [
  "#75f752",
  "#2cb964",
  "#b9fe9f",
  "#f1bc75",
  "#9ddbd8",
  "#b6a7eb",
  "#df9f86",
  "#557f56",
];
export function CategoryChart({ data = [], currency = "PKR" }) {
  if (!data.length) return empty;
  const rows = data.map((x) => ({
    name: x.name,
    value: x.amountMinor / 100,
  }));
  return (
    <div className="donut-wrap">
      <div className="donut-chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius="72%"
              outerRadius="93%"
              paddingAngle={3}
              stroke="none"
            >
              {rows.map((x, i) => (
                <Cell key={x.name} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              {...tooltip}
              formatter={(v) => `${currency} ${Number(v).toLocaleString()}`}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{rows.length}</strong>
          <span>categories</span>
        </div>
      </div>
      <div className="donut-legend">
        {rows.slice(0, 6).map((r, i) => (
          <div key={r.name}>
            <i
              style={{
                background: colors[i % colors.length],
              }}
            />
            <span>{r.name}</span>
            <strong>
              {currency} {fmt(r.value)}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
export function DailyChart({ data = [], currency = "PKR", maxBarSize = 68 }) {
  if (!data.length) return empty;
  return (
    <div className="chart-frame chart-short">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.map((x) => ({
            date: x.label || x.date.slice(8),
            Amount: x.amountMinor / 100,
          }))}
          margin={{
            top: 8,
            right: 10,
            bottom: 0,
            left: -25,
          }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--chart-grid)"
            strokeDasharray="4 5"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill: "var(--chart-axis)",
            }}
          />
          <YAxis
            tickFormatter={fmt}
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill: "var(--chart-axis)",
            }}
          />
          <Tooltip
            {...tooltip}
            formatter={(value) => [
              `${currency} ${Number(value).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`,
              "Spending",
            ]}
          />
          <Bar
            dataKey="Amount"
            fill="var(--chart-accent)"
            radius={[7, 7, 0, 0]}
            maxBarSize={maxBarSize}
            minPointSize={2}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
