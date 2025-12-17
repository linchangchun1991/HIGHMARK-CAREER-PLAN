import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { RadarDataPoint } from '../types';

interface RadarChartProps {
  data: RadarDataPoint[];
}

const RadarChartComponent: React.FC<RadarChartProps> = ({ data }) => {
  return (
    <div className="w-full h-[320px] flex items-center justify-center bg-white rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid gridType="polygon" stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar
            name="Before HM (现状)"
            dataKey="current"
            stroke="#94a3b8"
            strokeWidth={2}
            fill="#94a3b8"
            fillOpacity={0.3}
          />
          
          <Radar
            name="After HM (规划后)"
            dataKey="potential"
            stroke="#d4af37"
            strokeWidth={3}
            fill="#d4af37"
            fillOpacity={0.4}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;