import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = '#008ea2' 
}) => {
  return (
    <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium text-gray-600 text-sm">{title}</p>
          <p className="mt-2 font-bold text-gray-900 text-3xl">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="ml-2 text-gray-500 text-sm">vs last month</span>
            </div>
          )}
        </div>
        <div
          className="p-3 rounded-full"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-8 h-8" style={{ color }} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;