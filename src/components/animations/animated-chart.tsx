'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface AnimatedChartProps {
  data: ChartData[];
  type?: 'line' | 'bar' | 'area';
  dataKey?: string;
  title?: string;
  height?: number;
  delay?: number;
}

export function AnimatedChart({
  data,
  type = 'line',
  dataKey = 'value',
  title,
  height = 300,
  delay = 0,
}: AnimatedChartProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration: 0.5 },
    },
  };

  const chart =
    type === 'line' ? (
      <LineChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    ) : type === 'bar' ? (
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend />
        <Bar
          dataKey={dataKey}
          fill="#3b82f6"
          radius={[8, 8, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    ) : (
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" />
        <YAxis stroke="#6b7280" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#8b5cf6"
          fill="url(#colorArea)"
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    )

  return (
    <motion.div
      className="rounded-lg border border-border bg-card p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {title && <h3 className="mb-4 text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {chart}
      </ResponsiveContainer>
    </motion.div>
  )
}
