import React, { useEffect, useRef, useState } from 'react';
import { CreditCard, TrendingUp } from 'lucide-react';
import PaymentStats from '../../components/PaymentStats';
import PaymentForm from '../../components/PaymentForm';
import PaymentHistory from '../../components/PaymentHistory';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { paymentAnalytics,createPayment } from '../../api/api.js';
import toast from 'react-hot-toast';

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

const paymentMethodData = [
  { method: 'Credit Card', count: 45, percentage: 52 },
  { method: 'Cash', count: 25, percentage: 29 },
  { method: 'Bank Transfer', count: 12, percentage: 14 },
  { method: 'Mobile Pay', count: 4, percentage: 5 },
];

const PaymentCollection: React.FC = () => {

  const [timeRange, setTimeRange] = useState('6months');
  const [analytics, setAnalytics] = useState(null);
  const analyticRef = useRef(null);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if(!analyticRef.current){
      analyticRef.current = true;
      fetchAnalytics();
    }
  },[]);

  const  handleTimeRangeChange = () => {
    fetchAnalytics();
  }

  const { hotelInfo, loading, setLoading } = useAuth();

  const fetchAnalytics = async () => {
    setLoading(true);

    try{
      const { data } = await paymentAnalytics({
        time_range: timeRange,
      });

      console.log('MyDATA',data?.data || []);

      setAnalytics(data?.data || []);

    }catch(error){
      console.log('Failed to fetch analytics data!',error);
    }finally{
      setLoading(false);
    }
  }

  const handlePaymentSubmit = async (paymentData: {
    bookingCode: string;
    guestName: string;
    amount: string;
    paymentMethod: string;
    paymentReference: string;
    paymentDate: string;
    notes: string;
    receipt_url: File | null;
  }) => {
    setLoading(true);
    try {
      
      const { data } = await createPayment(paymentData);
      
      toast.success(data?.message || 'Payment has been successfully added!');

      fetchAnalytics();
      
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
          <div className="flex justify-between sm:justify-end items-center gap-x-3">
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex space-x-3">
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                disabled={loading}
                className="disabled:opacity-50 px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 disabled:cursor-not-allowed"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <PaymentStats stats={{
          totalCollected: +analytics?.total_collected || 0,
          pendingPayments: +analytics?.pending_payments || 0,
          successRate: +analytics?.success_rate || 0,
          avgPaymentTime: analytics?.avg_payment_time || '0',
          todayCollected: +analytics?.today_collected || 0,
          thisMonthCollected: +analytics?.this_month_collected || 0,

          totalCollectedTrend: +analytics?.total_collected_trend || {value: 0, isPositive: true},
          pendingPaymentsTrend: +analytics?.pending_payments_trend || {value: 0, isPositive: true},
          successRateTrend: +analytics?.success_rate_trend || {value: 0, isPositive: true},
          avgPaymentTimeTrend: analytics?.avg_payment_time_trend || {value: 0, isPositive: true},
        }} currencySymbol={hotelInfo?.currency_symbol || "₱"} />

        {/* Charts Section */}
        <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
          {/* Daily Revenue Chart */}
          <Card className="shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="font-semibold text-gray-900 text-lg">Daily Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics?.daily_revenue || []}>
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
                <BarChart data={analytics?.payment_method_distribution || []} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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

        {/* Payment History */}
        <PaymentHistory 
          payments={mockPayments}
          currencySymbol={hotelInfo?.currency_symbol || "₱"}
          onViewReceipt={handleViewReceipt}
          onExportData={handleExportData}
          onAddNewPayment={(e) => setShowAddPayment(true)}
        />
      </div>

      {/* Fixed Modal */}
      {showAddPayment && (
        <div className="z-50 absolute inset-0 flex justify-center items-start bg-black bg-opacity-50 p-4 object-cover overflow-y-auto">
          <div className="relative bg-white shadow-xl rounded-lg w-full max-w-2xl h-auto">
            <PaymentForm 
              onCancel={() => setShowAddPayment(false)} 
              onSubmit={handlePaymentSubmit} 
              loading={loading} 
              currencySymbol={hotelInfo?.currency_symbol || "₱"} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCollection;