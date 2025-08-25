import React from 'react';
import { DollarSign, CreditCard, TrendingUp, Clock } from 'lucide-react';

interface PaymentStatsProps {
  stats: {
    totalCollected: number;
    pendingPayments: number;
    successRate: number;
    avgPaymentTime: string;
    todayCollected: number;
    thisMonthCollected: number;
  };
  currencySymbol?: string;
}

export const PaymentStats: React.FC<PaymentStatsProps> = ({ 
  stats, 
  currencySymbol = '$' 
}) => {
  const statCards = [
    {
      title: 'Total Collected',
      value: `${currencySymbol}${stats.totalCollected.toLocaleString()}`,
      icon: DollarSign,
      isIcon: false,
      html: <span className="text-[#008ea2]">{currencySymbol}</span>,
      color: '#008ea2',
      bgColor: 'bg-teal-50',
      iconBg: 'bg-teal-100',
      textColor: 'text-teal-600',
      trend: '+12.5%'
    },
    {
      title: 'Pending Payments',
      value: `${currencySymbol}${stats.pendingPayments.toLocaleString()}`,
      isIcon: true,
      icon: Clock,
      color: '#F59E0B',
      bgColor: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      trend: '-5.2%'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      isIcon: true,
      icon: TrendingUp,
      color: '#10B981',
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      textColor: 'text-green-600',
      trend: '+2.1%'
    },
    {
      title: 'Avg. Payment Time',
      value: stats.avgPaymentTime,
      isIcon: true,
      icon: CreditCard,
      color: '#8B5CF6',
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      textColor: 'text-purple-600',
      trend: '-8m'
    }
  ];

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {statCards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="bg-white shadow-sm hover:shadow-md p-6 border border-gray-200 rounded-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-600 text-sm">{card.title}</h3>
              <div className={`${card.iconBg} p-2 rounded-lg`}>
                {card?.isIcon && <IconComponent className={`h-4 w-4 ${card.textColor}`} />}
                {!card?.isIcon && <>{card.html}</>}
              </div>
            </div>
            <div className="mb-2 font-bold text-gray-900 text-2xl">{card.value}</div>
            <div className="flex items-center">
              <TrendingUp className="mr-1 w-3 h-3 text-green-500" />
              <span className="font-medium text-green-600 text-xs">{card.trend}</span>
              <span className="ml-1 text-gray-500 text-xs">from last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PaymentStats;