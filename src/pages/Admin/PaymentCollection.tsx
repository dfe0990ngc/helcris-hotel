import React, { useState } from 'react';
import { CreditCard, TrendingUp } from 'lucide-react';
import PaymentStats from '../../components/PaymentStats';
import PaymentForm from '../../components/PaymentForm';
import PaymentHistory from '../../components/PaymentHistory';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { useAuth } from '../../context/AuthContext';

// Mock data - replace with real data from your API
const mockStats = {
  totalCollected: 45750,
  pendingPayments: 8920,
  successRate: 96.5,
  avgPaymentTime: '2.3 days',
  todayCollected: 3250,
  thisMonthCollected: 28900
};

const mockPayments = [
  {
    id: '1',
    bookingCode: 'BK001',
    guestName: 'John Smith',
    amount: 450.00,
    paymentMethod: 'credit_card',
    paymentReference: 'CC-2024-001',
    paymentDate: '2024-01-15',
    status: 'completed' as const,
    notes: 'Payment for deluxe room',
    receiptUrl: '/images/receipt.jpg'
  },
  {
    id: '2',
    bookingCode: 'BK002',
    guestName: 'Sarah Johnson',
    amount: 320.50,
    paymentMethod: 'cash',
    paymentReference: 'CASH-001',
    paymentDate: '2024-01-14',
    status: 'completed' as const,
    receiptUrl: '/images/Receipt.jpg'
  },
  {
    id: '3',
    bookingCode: 'BK003',
    guestName: 'Mike Wilson',
    amount: 675.00,
    paymentMethod: 'bank_transfer',
    paymentReference: 'TRF-2024-003',
    paymentDate: '2024-01-13',
    status: 'pending' as const,
    notes: 'Awaiting bank confirmation'
  }
];

const dailyRevenueData = [
  { date: 'Jan 10', revenue: 2400 },
  { date: 'Jan 11', revenue: 1800 },
  { date: 'Jan 12', revenue: 3200 },
  { date: 'Jan 13', revenue: 2800 },
  { date: 'Jan 14', revenue: 3600 },
  { date: 'Jan 15', revenue: 4200 },
  { date: 'Jan 16', revenue: 3800 },
];

const paymentMethodData = [
  { method: 'Credit Card', count: 45, percentage: 52 },
  { method: 'Cash', count: 25, percentage: 29 },
  { method: 'Bank Transfer', count: 12, percentage: 14 },
  { method: 'Mobile Pay', count: 4, percentage: 5 },
];

const PaymentCollection: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const { hotelInfo } = useAuth();

  const handlePaymentSubmit = async (paymentData: {
    bookingCode: string;
    guestName: string;
    amount: string;
    paymentMethod: string;
    paymentReference: string;
    paymentDate: string;
    notes: string;
    receiptImage: File | null;
  }) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Payment data:', paymentData);
      // You can add toast notifications here if needed
      
      // Here you would typically:
      // 1. Send data to your API
      // 2. Update the payment history
      // 3. Refresh statistics
      
    } catch (error) {
      console.error('Failed to record payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReceipt = (payment: {
    id: string;
    bookingCode: string;
    guestName: string;
    amount: number;
    paymentMethod: string;
    paymentReference: string;
    paymentDate: string;
    status: 'completed' | 'pending' | 'failed';
    notes?: string;
    receiptUrl?: string;
  }) => {
    // Open receipt in modal or new tab
    console.log('Viewing receipt for payment:', payment.id);
  };

  const handleExportData = () => {
    // Export payment data to CSV/Excel
    console.log('Exporting payment data...');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="space-y-6 mx-auto">
        {/* Header */}
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="flex items-center space-x-2 font-bold text-gray-900 text-3xl">
              <CreditCard className="w-8 h-8 text-[#008ea2]" />
              <span>Payment Collection</span>
            </h1>
            <p className="mt-1 text-gray-600">Manage and track all payment transactions</p>
          </div>
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Statistics Cards */}
        <PaymentStats stats={mockStats} currencySymbol={hotelInfo?.currency_symbol || "₱"} />

        {/* Charts Section */}
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
          {/* Daily Revenue Chart */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="font-semibold text-gray-900 text-lg">Daily Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008ea2" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#008ea2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${hotelInfo?.currency_symbol || "₱"}${(value/1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${hotelInfo?.currency_symbol || "₱"}${value?.toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#008ea2" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods Chart */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="font-semibold text-gray-900 text-lg">Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentMethodData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="method" 
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} payments`, 'Count']}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#008ea2"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <PaymentForm onSubmit={handlePaymentSubmit} loading={loading} currencySymbol={hotelInfo?.currency_symbol || "₱"} />

        {/* Payment History */}
        <PaymentHistory 
          payments={mockPayments}
          currencySymbol={hotelInfo?.currency_symbol || "₱"}
          onViewReceipt={handleViewReceipt}
          onExportData={handleExportData}
        />
      </div>
    </div>
  );
};

export default PaymentCollection;