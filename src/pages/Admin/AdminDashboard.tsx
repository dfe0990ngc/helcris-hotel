import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { reports } from '../../api/api.js';
import { Report } from '../../types';
import StatCard from '../../components/Common/StatCard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { 
  DollarSign, 
  Bed, 
  TrendingUp, 
  Calendar, 
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Activity,
  Star,
  X,
  Filter,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import toast from 'react-hot-toast';

const COLORS = ['#008ea2', '#00b8d4', '#26c6da', '#4dd0e1', '#80deea'];

// Time range options
const TIME_RANGES = [
  { value: '1month', label: 'Last Month', days: 30 },
  { value: '3months', label: 'Last 3 Months', days: 90 },
  { value: '6months', label: 'Last 6 Months', days: 180 },
  { value: '1year', label: 'Last Year', days: 365 }
];

// Configuration for different activity types
const getActivityConfig = (type) => {
  const configs = {
    confirmed: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-500',
      textColor: 'text-green-600',
      icon: CheckCircle
    },
    checked_in: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-600',
      icon: Users
    },
    checked_out: {
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-500',
      textColor: 'text-purple-600',
      icon: Calendar
    },
    pending: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-500',
      textColor: 'text-yellow-600',
      icon: Clock
    },
    cancelled: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-500',
      textColor: 'text-red-600',
      icon: X
    }
  };
  
  return configs[type] || configs.pending;
};

// Format time ago
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const activityDate = new Date(dateString);
  const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// Custom Dropdown Component
const TimeRangeDropdown = ({ value, onChange, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedRange = TIME_RANGES.find(range => range.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center space-x-2 bg-white disabled:opacity-50 hover:shadow-sm px-4 py-2 border border-gray-300 hover:border-[#008ea2] rounded-lg text-gray-700 transition-all duration-200"
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium text-sm">{selectedRange?.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="right-0 z-50 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-48">
          <div className="p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => {
                  onChange(range.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 ${
                  value === range.value
                    ? 'bg-[#008ea2] text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{range.label}</span>
                  {value === range.value && <CheckCircle className="w-4 h-4" />}
                </div>
                <div className="opacity-75 mt-0.5 text-xs">
                  {range.days} days
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeRange, setTimeRange] = useState('1year');
  const [refreshing, setRefreshing] = useState(false);

  const { logout, hotelInfo } = useAuth();
  const abortControllerRef = useRef(null);

  // Memoized fetch function with proper error handling
  const fetchReport = useCallback(async (signal, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const { data } = await reports({ time_range: timeRange }, { signal });
      setReport(data);
      setLastUpdated(new Date());

      if (isRefresh) {
        toast.success('Dashboard updated successfully');
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      
      const errorMessage = error?.response?.data?.message || 'Error fetching dashboard data';
      setError(errorMessage);
      
      if (!isRefresh) {
        toast.error(errorMessage);
      }

      if (error?.response?.data?.message === 'Unauthenticated.') {
        logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [logout, timeRange]);

  // Initial fetch and time range change handler
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    fetchReport(abortControllerRef.current.signal);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchReport]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      fetchReport(abortControllerRef.current.signal, true);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchReport]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    fetchReport(abortControllerRef.current.signal, true);
  }, [fetchReport]);

  // Time range change handler
  const handleTimeRangeChange = useCallback((newTimeRange) => {
    if (newTimeRange !== timeRange) {
      setTimeRange(newTimeRange);
    }
  }, [timeRange]);

  // Memoized computed data
  const dashboardData = useMemo(() => {
    if (!report) return null;

    const revenueTrend = report?.total_revenue_trend;
    const bookingsTrend = report?.total_bookings_trend;
    const occupancyTrend = report?.occupancy_rate_trend;
    const adrTrend = report?.average_daily_rate_trend;

    // Enhanced room type data with revenue percentage
    const roomTypeData = report.room_type_bookings?.map(room => ({
      ...room,
      revenuePerBooking: room.count > 0 ? Math.round(room.revenue / room.count) : 0,
      percentage: report.total_revenue > 0 ? ((room.revenue / report.total_revenue) * 100).toFixed(1) : '0'
    })) || [];

    // Calculate RevPAR
    const revPAR = report.average_daily_rate && report.occupancy_rate 
      ? (report.average_daily_rate * report.occupancy_rate / 100).toFixed(0) 
      : '0';

    return {
      revenueTrend,
      bookingsTrend,
      occupancyTrend,
      adrTrend,
      roomTypeData,
      revPAR
    };
  }, [report]);

  // Get selected time range label
  const selectedTimeRangeLabel = TIME_RANGES.find(range => range.value === timeRange)?.label || 'Last Year';

  // Error state
  if (error && !loading) {
    return (
      <div className="flex flex-col justify-center items-center space-y-4 min-h-96">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <div className="font-semibold text-red-500 text-lg">Dashboard Error</div>
        <p className="max-w-md text-gray-600 text-center">{error}</p>
        <div className="flex sm:flex-row flex-col gap-3">
          <button
            onClick={handleRefresh}
            className="flex justify-center items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] px-6 py-2 rounded-lg text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
          <TimeRangeDropdown 
            value={timeRange}
            onChange={handleTimeRangeChange}
            loading={loading || refreshing}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading overlay for initial load */}
      {loading && !report && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-white bg-opacity-75">
          <LoadingSpinner />
        </div>
      )}
      
      {/* Header with improved layout */}
      <div className="flex lg:flex-row flex-col lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Dashboard</h1>
          <p className="text-gray-600">Hotel performance overview - {selectedTimeRangeLabel.toLowerCase()}</p>
        </div>
        
        <div className="flex sm:flex-row flex-col items-start sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <TimeRangeDropdown 
              value={timeRange}
              onChange={handleTimeRangeChange}
              loading={loading || refreshing}
            />
            
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center space-x-2 disabled:opacity-50 px-3 py-2 border border-gray-300 hover:border-[#008ea2] rounded-lg text-gray-600 hover:text-[#008ea2] transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
              <span className="text-sm">{refreshing ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content with loading states */}
      {report && (
        <div className={`transition-opacity duration-300 ${refreshing ? 'opacity-75' : 'opacity-100'}`}>
          {/* Key Metrics */}
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`${hotelInfo?.currency_symbol}${report.total_revenue?.toLocaleString() || '0'}`}
              icon={DollarSign}
              trend={dashboardData?.revenueTrend}
              color="#008ea2"
            />
            <StatCard
              title="Total Bookings"
              value={report.total_bookings?.toLocaleString() || '0'}
              icon={Calendar}
              trend={dashboardData?.bookingsTrend}
              color="#10B981"
            />
            <StatCard
              title="Occupancy Rate"
              value={`${report.occupancy_rate || 0}%`}
              icon={Bed}
              trend={dashboardData?.occupancyTrend}
              color="#F59E0B"
            />
            <StatCard
              title="Average Daily Rate"
              value={`${hotelInfo?.currency_symbol}${report.average_daily_rate?.toLocaleString() || '0'}`}
              icon={TrendingUp}
              trend={dashboardData?.adrTrend}
              color="#8B5CF6"
            />
          </div>

          {/* Enhanced Quick Insights Bar */}
          <div className="bg-gradient-to-r from-[#008ea2] to-[#006b7a] shadow-lg p-6 rounded-lg text-white">
            <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="opacity-90 font-medium text-sm">RevPAR (Revenue per Available Room)</p>
                  <p className="font-bold text-2xl">{hotelInfo?.currency_symbol}{dashboardData?.revPAR}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="opacity-90 font-medium text-sm">Guest Satisfaction</p>
                  <p className="font-bold text-2xl">{report.customer_satisfaction || '4.5'}/5</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="opacity-90 font-medium text-sm">Avg. Length of Stay</p>
                  <p className="font-bold text-2xl">{report.average_length_of_stay || '2.1'} nights</p>
                </div>
              </div>
            </div>
          </div>

          <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
            {/* Enhanced Revenue Chart */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">Revenue Trend</h3>
                <div className="flex items-center space-x-2 text-gray-600 text-sm">
                  <div className="bg-[#008ea2] rounded-full w-3 h-3"></div>
                  <span>Revenue</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={report.monthly_revenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#008ea2" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#008ea2" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${hotelInfo?.currency_symbol}${(value/1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value) => [`${hotelInfo?.currency_symbol}${value?.toLocaleString()}`, 'Revenue']}
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
            </div>

            {/* Enhanced Room Type Performance */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <h3 className="mb-4 font-semibold text-gray-900 text-lg">Room Type Performance</h3>
              <div className="space-y-4">
                {dashboardData?.roomTypeData?.map((room, index) => (
                  <div key={room.type} className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="rounded-full w-4 h-4" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{room.type}</p>
                        <p className="text-gray-600 text-sm">{room.count} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{hotelInfo?.currency_symbol}{room.revenue?.toLocaleString()}</p>
                      <p className="text-gray-600 text-sm">{room.percentage}% of total</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Mini Chart */}
              <div className="mt-6 pt-4 border-gray-200 border-t">
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={dashboardData?.roomTypeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis 
                      dataKey="type" 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip 
                      formatter={(value) => [`${value} bookings`, 'Count']}
                      contentStyle={{ fontSize: '12px' }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#008ea2"
                      radius={[2, 2, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
            {/* Enhanced Booking Status Distribution */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <h3 className="mb-6 font-semibold text-gray-900 text-lg">Booking Status Overview</h3>
              <div className="flex md:flex-row flex-col items-center">
                <div className="w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={report.booking_status_distribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="count"
                        label={false}
                      >
                        {report.booking_status_distribution?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} bookings`, props.payload.status]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 w-full md:w-1/2">
                  {report.booking_status_distribution?.map((entry, index) => (
                    <div key={entry.status} className="flex justify-between items-center hover:bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="rounded-full w-3 h-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-gray-700 text-sm capitalize">{entry.status.replace('_', ' ')}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{entry.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-gray-900 text-lg">Recent Activity</h3>
                <Activity className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {!report.recent_activities || report.recent_activities.length === 0 ? (
                  <div className="py-8 text-gray-500 text-center">
                    <Activity className="mx-auto mb-2 w-8 h-8 text-gray-300" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  report.recent_activities.map((activity) => {
                    const config = getActivityConfig(activity.type);
                    const IconComponent = config.icon;
                    
                    return (
                      <div 
                        key={activity.id} 
                        className={`flex items-start space-x-3 ${config.bgColor} p-3 border ${config.borderColor} rounded-lg transition-all duration-200 hover:shadow-sm`}
                      >
                        <IconComponent className={`flex-shrink-0 mt-0.5 w-5 h-5 ${config.iconColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                          <p className="text-gray-600 text-xs truncate">{activity.details}</p>
                          {activity.sub_details && (
                            <p className={`font-medium ${config.textColor} text-xs mt-1`}>{activity.sub_details}</p>
                          )}
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap">
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;