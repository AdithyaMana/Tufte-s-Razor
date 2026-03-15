
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface RatioChartProps {
  ratio: number;
  isDarkMode: boolean;
}

const RatioChart: React.FC<RatioChartProps> = ({ ratio, isDarkMode }) => {
  // Ensure ratio is between 0 and 1
  const validRatio = Math.max(0, Math.min(1, ratio));
  const dataInk = Math.round(validRatio * 100);
  const nonDataInk = 100 - dataInk;

  const data = [
    { name: 'Data Ink', value: dataInk },
    { name: 'Non-Data Ink', value: nonDataInk },
  ];

  // Colors adapted for mode (Zinc palette)
  const COLORS = isDarkMode 
    ? ['#f4f4f5', '#27272a']  // Zinc 100, Zinc 800
    : ['#18181b', '#e4e4e7']; // Zinc 900, Zinc 200

  return (
    <div className="h-full w-full flex flex-col items-center justify-center relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="65%"
            outerRadius="85%"
            paddingAngle={3}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value}%`}
            contentStyle={{ 
              backgroundColor: isDarkMode ? '#18181b' : '#ffffff', 
              borderColor: isDarkMode ? '#27272a' : '#f4f4f5',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              fontSize: '12px',
              fontWeight: 500
            }}
            itemStyle={{ color: isDarkMode ? '#e4e4e7' : '#18181b' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center justify-center">
        <div className={`text-4xl font-serif font-bold leading-none tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
          {dataInk}<span className="text-xl align-top opacity-50">%</span>
        </div>
      </div>
    </div>
  );
};

export default RatioChart;
