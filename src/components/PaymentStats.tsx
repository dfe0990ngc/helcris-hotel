import React from 'react';
import { DollarSign, CreditCard, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface PaymentStatsProps {
  stats: {
    totalCollected: number;
    pendingPayments: number;
    successRate: number;
    avgPaymentTime: string;
    todayCollected: number;
    thisMonthCollected: number;

    totalCollectedTrend: {value: number, isPositive: boolean};
    pendingPaymentsTrend: {value: number, isPositive: boolean};
    successRateTrend: {value: number, isPositive: boolean};
    avgPaymentTimeTrend: {value: number, isPositive: boolean};
  };
  currencySymbol?: string;
}

export const PaymentStats: React.FC<PaymentStatsProps> = ({ 
  stats, 
  currencySymbol = '$' 
}) => {
  const formatTrendValue = (trend: {value: number, isPositive: boolean}, isTime: boolean = false) => {
    if (isTime) {
      return `${trend.value}${trend.value === 1 ? ' min' : ' mins'}`;
    }
    return `${trend.value}%`;
  };

  const getTrendColor = (isPositive: boolean) => {
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? TrendingUp : TrendingDown;
  };

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
      trend: stats.totalCollectedTrend,
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
      trend: stats.pendingPaymentsTrend,
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
      trend: stats.successRateTrend,
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
      trend: stats.avgPaymentTimeTrend,
      isTime: true,
    }
  ];

  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {statCards.map((card, index) => {
        const IconComponent = card.icon;
        const TrendIcon = getTrendIcon(card.trend.isPositive);
        const trendColorClass = getTrendColor(card.trend.isPositive);
        
        return (
          <div key={index} className="bg-white shadow-sm hover:shadow-md p-6 border border-gray-200 rounded-lg transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-600 text-sm">{card.title}</h3>
              {card?.isIcon && (
                <div className={`${card.iconBg} p-2 rounded-lg`}>
                  <IconComponent className={`h-4 w-4 ${card.textColor}`} />
                </div>
              )}
              {!card?.isIcon && (
                <div className={`${card.iconBg} px-3 py-0 rounded-lg`}>
                  {card.html}
                </div>
              )}
            </div>
            <div className="mb-2 font-bold text-gray-900 text-2xl">{card.value}</div>
            <div className="flex items-center">
              <TrendIcon className={`mr-1 w-3 h-3 ${trendColorClass}`} />
              <span className={`font-medium text-xs ${trendColorClass}`}>
                {formatTrendValue(card.trend, card.isTime)}
              </span>
              <span className="ml-1 text-gray-500 text-xs">from last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Example usage with sample data
// const SamplePaymentStats = () => {
//   const sampleStats = {
//     totalCollected: 125000,
//     pendingPayments: 15000,
//     successRate: 94,
//     avgPaymentTime: "2.3 mins",
//     todayCollected: 5000,
//     thisMonthCollected: 45000,
//     totalCollectedTrend: { value: 12.5, isPositive: true },
//     pendingPaymentsTrend: { value: 8.2, isPositive: false }, // Less pending is good
//     successRateTrend: { value: 3.1, isPositive: true },
//     avgPaymentTimeTrend: { value: 0.5, isPositive: false }, // Faster time is good
//   };

//   return <PaymentStats stats={sampleStats} currencySymbol="$" />;
// };

export default PaymentStats;