/* eslint-disable no-constant-binary-expression */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { reports } from '../../api/api.js';
import { Report } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import StatCard from '../../components/Common/StatCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Bed, 
  Users, 
  Download, 
  FileText,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.js';

const COLORS = ['#008ea2', '#00b8d4', '#26c6da', '#4dd0e1', '#80deea'];

const Reports: React.FC = () => {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6months');

  // Use AbortController for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);
  const { logout, hotelInfo } = useAuth();

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchReport = useCallback(async (selectedTimeRange: string, signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await reports({ 
        time_range: selectedTimeRange 
      }, { signal }); // Pass the abort signal if your API supports it
      
      setReport(data);
    } catch (error: any) {
      // Don't update state if request was aborted
      if (error.name === 'AbortError') {
        return;
      }
      
      const errorMessage = error?.response?.data?.message || 'Error fetching reports';
      setError(errorMessage);
      toast.error(errorMessage);

      if (error?.response?.data?.message === 'Unauthenticated.') {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Initial fetch with cleanup
  useEffect(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    fetchReport(timeRange, abortControllerRef.current.signal);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [timeRange, fetchReport]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle time range change with debouncing
  const handleTimeRangeChange = useCallback((newTimeRange: string) => {
    setTimeRange(newTimeRange);
  }, []);

  // Memoize computed data to prevent recalculation on every render
  const computedData = useMemo(() => {
    if (!report) return null;

    const monthlyData = report.monthly_revenue;
    
    const roomTypeRevenue = report.room_type_bookings.map(item => ({
      ...item,
      percentage: (item.revenue / report.total_revenue * 100).toFixed(1),
      // Add normalized values for better visualization
      revenuePerBooking: item.count > 0 ? Math.round(item.revenue / item.count) : 0
    }));

    const revPAR = (report.average_daily_rate * report.occupancy_rate / 100).toFixed(0);

    return {
      monthlyData,
      roomTypeRevenue,
      revPAR
    };
  }, [report]);

  // Memoize the download function
  const downloadReport = useCallback(() => {
    // In a real app, this would generate and download a PDF report
    console.log('Downloading report for time range:', timeRange);
    toast.success('Report download started');
  }, [timeRange]);

  // Error boundary component
  if (error && !loading) {
    return (
      <div className="flex flex-col justify-center items-center space-y-4 min-h-96">
        <div className="font-semibold text-red-500 text-lg">Failed to load reports</div>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => fetchReport(timeRange)}
          className="bg-[#008ea2] hover:bg-[#006b7a] px-4 py-2 rounded-lg text-white transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner />}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into your hotel performance</p>
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
          <button
            onClick={downloadReport}
            disabled={loading || !report}
            className="hidden items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 px-4 py-2 rounded-lg text-white transition-colors disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {!loading && report && (
        <>
          {/* Key Performance Indicators */}
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`${hotelInfo?.currency_symbol}${report.total_revenue?.toLocaleString() || '0'}`}
              icon={DollarSign}
              trend={report.total_revenue_trend || {value: 0, isPositive: false}}
              color="#008ea2"
            />
            <StatCard
              title="Total Bookings"
              value={report.total_bookings?.toLocaleString() || '0'}
              icon={Calendar}
              trend={report.total_bookings_trend || {value: 0, isPositive: false}}
              color="#10B981"
            />
            <StatCard
              title="Occupancy Rate"
              value={`${report.occupancy_rate || 0}%`}
              icon={Bed}
              trend={report.occupancy_rate_trend || {value: 0, isPositive: false}}
              color="#F59E0B"
            />
            <StatCard
              title="Average Daily Rate"
              value={`${hotelInfo?.currency_symbol}${report.average_daily_rate?.toLocaleString() || '0'}`}
              icon={TrendingUp}
              trend={report.average_daily_rate_trend || {value: 0, isPositive: false}}
              color="#8B5CF6"
            />
          </div>

          {/* Charts Grid */}
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
            {/* Revenue Trend */}
            <div className="lg:col-span-2 bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">Revenue & Bookings Trend</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="bg-[#008ea2] rounded-full w-3 h-3"></div>
                    <span className="text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="bg-[#10B981] rounded-full w-3 h-3"></div>
                    <span className="text-gray-600">Bookings</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={computedData?.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="revenue" orientation="left" />
                  <YAxis yAxisId="bookings" orientation="right" />
                  <Tooltip />
                  <Area 
                    yAxisId="revenue"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#008ea2" 
                    fill="#008ea2"
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                  <Line 
                    yAxisId="bookings"
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Room Type Performance - Modern Card Layout */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-900 text-lg">Room Type Performance</h3>
                <div className="text-gray-500 text-sm">Revenue & Booking Analysis</div>
              </div>
              
              <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                {computedData?.roomTypeRevenue?.map((room, index) => (
                  <div key={room.type} className="bg-gradient-to-r from-gray-50 to-white p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{room.type}</h4>
                        <p className="text-gray-600 text-sm">{room.count} booking{room.count !== 1 ? 's' : ''}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.revenue > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {+room?.percentage || 0}%
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {/* Revenue Bar */}
                      <div>
                        <div className="flex justify-between mb-1 text-sm">
                          <span className="text-gray-600">Revenue</span>
                          <span className="font-medium">{hotelInfo?.currency_symbol}{room.revenue.toLocaleString()}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full w-full h-2">
                          <div 
                            className="bg-[#008ea2] rounded-full h-2 transition-all duration-500 ease-out"
                            style={{ 
                              width: `${report?.total_revenue ? (room.revenue / report.total_revenue) * 100 : 0}%` 
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Average Rate */}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg. Rate</span>
                        <span className="font-medium">
                          {hotelInfo?.currency_symbol}{room.count > 0 ? Math.round(room.revenue / room.count).toLocaleString() : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Bar Chart */}
              <div className="mt-6 pt-4 border-gray-200 border-t">
                <h4 className="mb-4 font-medium text-gray-700 text-md">Revenue Comparison</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={computedData?.roomTypeRevenue} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="type" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${hotelInfo?.currency_symbol}${value}`}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value, name) => [`${hotelInfo?.currency_symbol}${value?.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#008ea2"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Booking Status Distribution */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <h3 className="mb-4 font-semibold text-gray-900 text-lg">Booking Status Distribution</h3>
              <ResponsiveContainer width="100%" height={600}>
                <PieChart>
                  <Pie
                    data={report.booking_status_distribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ status, count, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {report.booking_status_distribution?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Analytics */}
          <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
            {/* Occupancy Rate by Month */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <h3 className="mb-4 font-semibold text-gray-900 text-lg">Monthly Occupancy Rate</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={computedData?.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Occupancy Rate']} />
                  <Line 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke="#F59E0B" 
                    strokeWidth={3}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Key Metrics Summary */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <h3 className="mb-4 font-semibold text-gray-900 text-lg">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gradient-to-r from-[#008ea2] to-[#006b7a] p-4 rounded-lg text-white">
                  <div>
                    <p className="opacity-90 text-sm">Revenue per Available Room (RevPAR)</p>
                    <p className="font-bold text-2xl">{hotelInfo?.currency_symbol}{computedData?.revPAR || 0}</p>
                  </div>
                  <DollarSign className="opacity-80 w-8 h-8" />
                </div>
                
                <div className="flex justify-between items-center bg-gradient-to-r from-[#10B981] to-[#059669] p-4 rounded-lg text-white">
                  <div>
                    <p className="opacity-90 text-sm">Average Length of Stay</p>
                    <p className="font-bold text-2xl">{report.average_length_of_stay || 0} nights</p>
                  </div>
                  <Calendar className="opacity-80 w-8 h-8" />
                </div>
                
                <div className="flex justify-between items-center bg-gradient-to-r from-[#F59E0B] to-[#D97706] p-4 rounded-lg text-white">
                  <div>
                    <p className="opacity-90 text-sm">Customer Satisfaction</p>
                    <p className="font-bold text-2xl">{report.customer_satisfaction || 0}/5</p>
                  </div>
                  <Users className="opacity-80 w-8 h-8" />
                </div>
                
                <div className="flex justify-between items-center bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] p-4 rounded-lg text-white">
                  <div>
                    <p className="opacity-90 text-sm">Repeat Guest Rate</p>
                    <p className="font-bold text-2xl">{report.repeat_guest_rate || 0}%</p>
                  </div>
                  <TrendingUp className="opacity-80 w-8 h-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Report Actions */}
          <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
            <h3 className="mb-4 font-semibold text-gray-900 text-lg">Generate Custom Reports</h3>
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
              <button className="flex justify-center items-center space-x-2 hover:bg-[#008ea2] hover:bg-opacity-5 p-4 border-2 border-gray-300 hover:border-[#008ea2] border-dashed rounded-lg transition-colors">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Financial Report</span>
              </button>
              
              <button className="flex justify-center items-center space-x-2 hover:bg-[#008ea2] hover:bg-opacity-5 p-4 border-2 border-gray-300 hover:border-[#008ea2] border-dashed rounded-lg transition-colors">
                <BarChart3 className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Occupancy Report</span>
              </button>
              
              <button className="flex justify-center items-center space-x-2 hover:bg-[#008ea2] hover:bg-opacity-5 p-4 border-2 border-gray-300 hover:border-[#008ea2] border-dashed rounded-lg transition-colors">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Guest Analytics</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;