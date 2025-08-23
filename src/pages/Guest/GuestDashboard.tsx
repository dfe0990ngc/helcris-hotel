import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { guestRooms, guestBookings } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext';
import { Booking, Room } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { 
  Calendar, 
  Bed, 
  MapPin, 
  Star, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Wifi,
  Car,
  Coffee
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface DashboardState {
  bookings: Booking[];
  featuredRooms: Room[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

const GuestDashboard: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<DashboardState>({
    bookings: [],
    featuredRooms: [],
    loading: true,
    error: null,
    refreshing: false
  });

  const fetchAttempted = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  // Memoized booking categories for performance
  const bookingCategories = useMemo(() => {
    const now = new Date();
    
      const upcoming = state.bookings.filter(booking =>
        new Date(booking.check_in) > now &&
        ['pending','confirmed'].includes(booking.status)
      );

      const current = state.bookings.filter(booking =>
        new Date(booking.check_in) <= now &&
        new Date(booking.check_out) >= now &&
        ['pending','confirmed','checked_in'].includes(booking.status)
      );

    const recent = state.bookings.filter(booking => 
      isBefore(new Date(booking.check_out), now) &&
      isAfter(new Date(booking.check_out), addDays(now, -30))
    );

    return { upcoming, current, recent };
  }, [state.bookings]);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user?.id || (fetchAttempted.current && !isRefresh)) return;

    // Cancel any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setState(prev => ({ 
      ...prev, 
      loading: !isRefresh, 
      refreshing: isRefresh,
      error: null 
    }));

    try {
      const [userBookingsResponse, roomsResponse] = await Promise.all([
        guestBookings(),
        guestRooms()
      ]);

      // Validate and normalize the data
      const userBookings = Array.isArray(userBookingsResponse?.data) ? userBookingsResponse?.data : [];
      const rooms = Array.isArray(roomsResponse?.data) ? roomsResponse?.data : [];

      // Sort bookings by date (most recent first)
      const sortedBookings = userBookings.sort((a, b) => {
        const dateA = new Date(a.created_at || a.check_in);
        const dateB = new Date(b.created_at || b.check_in);
        return dateB.getTime() - dateA.getTime();
      });

      // Get featured rooms (prioritize available rooms with high ratings)
      const featuredRooms = rooms
        .filter(room => room && room.status === 'Available')
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3);

      setState(prev => ({
        ...prev,
        bookings: sortedBookings,
        featuredRooms,
        loading: false,
        refreshing: false,
        error: null
      }));

      fetchAttempted.current = true;
    } catch (error: any) {
      // Don't update state if request was aborted
      if (error.name === 'AbortError') return;

      console.error('Error fetching dashboard data:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to load dashboard data. Please try again.';
      if (error.message) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.message.includes('server') || error.message.includes('500')) {
          errorMessage = 'Server error. Please try again in a moment.';
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: errorMessage
      }));
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [fetchData]);

  const getBookingStatusColor = useCallback((status: Booking['status']) => {
    const statusColors = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      checked_in: 'bg-blue-100 text-blue-800 border-blue-200',
      checked_out: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return statusColors[status] || statusColors.cancelled;
  }, []);

  const getBookingStatusIcon = useCallback((status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'checked_in': return <Bed className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  }, []);

  const handleRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  if (state.loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]" role="status" aria-label="Loading dashboard">
        <LoadingSpinner />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex flex-col justify-center items-center space-y-4 min-h-[400px]" role="alert">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="font-semibold text-gray-900 text-xl">Unable to Load Dashboard</h2>
        <p className="text-gray-600 text-center">{state.error}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] px-6 py-3 rounded-lg focus:outline-none focus:ring-[#008ea2] focus:ring-2 text-white transition-colors"
          disabled={state.refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${state.refreshing ? 'animate-spin' : ''}`} />
          <span>{state.refreshing ? 'Retrying...' : 'Try Again'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8" role="main" aria-label="Guest Dashboard">
      {/* Welcome Section with Enhanced CTA */}
      <section className="bg-gradient-to-r from-[#008ea2] to-[#006b7a] shadow-lg p-8 rounded-xl text-white" aria-labelledby="welcome-heading">
        <div className="flex lg:flex-row flex-col justify-between items-start lg:items-center">
          <div className="mb-4 lg:mb-0">
            <h1 id="welcome-heading" className="mb-2 font-bold text-3xl">Welcome back, {user?.name}!</h1>
            <p className="opacity-90 max-w-2xl text-lg">
              Ready to plan your next perfect stay? Explore our rooms and make a reservation.
            </p>
            {bookingCategories.upcoming.length > 0 && (
              <p className="opacity-80 mt-2 text-sm">
                You have {bookingCategories.upcoming.length} upcoming booking{bookingCategories.upcoming.length !== 1 ? 's' : ''}.
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <Link
              to="/guest/rooms"
              className="inline-flex items-center space-x-2 bg-white hover:bg-gray-100 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-[#008ea2] focus:ring-offset-2 font-medium text-[#008ea2] hover:scale-105 transition-all duration-200 transform"
              aria-label="Browse available rooms"
            >
              <Bed className="w-5 h-5" />
              <span>Browse Rooms</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-[#008ea2] focus:ring-offset-2 font-medium transition-all duration-200"
              disabled={state.refreshing}
              aria-label="Refresh dashboard data"
            >
              <RefreshCw className={`w-4 h-4 ${state.refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </section>

      <div className="gap-8 grid grid-cols-1 lg:grid-cols-3">
        {/* Enhanced Bookings Section */}
        <section className="space-y-6 lg:col-span-2" aria-labelledby="bookings-heading">
          <div className="flex justify-between items-center">
            <h2 id="bookings-heading" className="font-bold text-gray-900 text-2xl">Your Bookings</h2>
            {state.bookings.length > 0 && (
              <Link 
                to="/guest/bookings"
                className="focus:outline-none text-[#008ea2] text-sm hover:underline focus:underline"
                aria-label="View all bookings"
              >
                View All
              </Link>
            )}
          </div>
          
          {/* Current/Upcoming Bookings Priority Display */}
          {bookingCategories.current.length > 0 && (
            <div className="bg-blue-50 p-4 border-2 border-blue-200 rounded-lg">
              <h3 className="flex items-center space-x-2 mb-3 font-semibold text-blue-900">
                <Bed className="w-5 h-5" />
                <span>Current Stay</span>
              </h3>
              {bookingCategories.current.map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  getStatusColor={getBookingStatusColor}
                  getStatusIcon={getBookingStatusIcon}
                  priority={true}
                />
              ))}
            </div>
          )}

          {bookingCategories.upcoming.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">Upcoming Bookings</h3>
              <div className="space-y-4">
                {bookingCategories.upcoming.slice(0, 2).map((booking) => (
                  <BookingCard 
                    key={booking.id} 
                    booking={booking} 
                    getStatusColor={getBookingStatusColor}
                    getStatusIcon={getBookingStatusIcon}
                  />
                ))}
              </div>
            </div>
          )}
          
          {state.bookings.length === 0 ? (
            <EmptyBookingsState />
          ) : (
            bookingCategories.recent.length > 0 && (
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">Recent Stays</h3>
                <div className="space-y-4">
                  {bookingCategories.recent.slice(0, 1).map((booking) => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking} 
                      getStatusColor={getBookingStatusColor}
                      getStatusIcon={getBookingStatusIcon}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </section>

        {/* Enhanced Featured Rooms */}
        <section className="space-y-6" aria-labelledby="featured-rooms-heading">
          <h2 id="featured-rooms-heading" className="font-bold text-gray-900 text-2xl">Featured Rooms</h2>
          
          <div className="space-y-4">
            {state.featuredRooms.map((room) => (
              <FeaturedRoomCard key={room.id} room={room} />
            ))}
          </div>
          
          <Link
            to="/guest/rooms"
            className="block bg-gradient-to-r from-gray-100 hover:from-gray-200 to-gray-200 hover:to-gray-300 py-3 rounded-lg focus:outline-none focus:ring-[#008ea2] focus:ring-2 w-full font-medium text-gray-700 text-center transition-all duration-200"
            aria-label="View all available rooms"
          >
            View All Rooms
          </Link>
        </section>
      </div>

      {/* Enhanced Quick Actions */}
      <section className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg" aria-labelledby="quick-actions-heading">
        <h3 id="quick-actions-heading" className="mb-4 font-semibold text-gray-900 text-lg">Quick Actions</h3>
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
          <QuickActionCard
            to="/guest/rooms"
            icon={<Bed className="w-6 h-6 text-[#008ea2]" />}
            title="Browse Rooms"
            description="Find your perfect room"
            ariaLabel="Browse available rooms"
          />
          
          <QuickActionCard
            to="/guest/bookings"
            icon={<Calendar className="w-6 h-6 text-[#008ea2]" />}
            title="My Bookings"
            description="Manage your reservations"
            ariaLabel="View and manage your bookings"
          />
          
          <QuickActionCard
            to="/guest/profile"
            icon={<CheckCircle className="w-6 h-6 text-[#008ea2]" />}
            title="Profile"
            description="Update your information"
            ariaLabel="Update your profile information"
          />
        </div>
      </section>
    </div>
  );
};

// Extracted Components for Better Organization and Performance
const BookingCard: React.FC<{
  booking: Booking;
  getStatusColor: (status: Booking['status']) => string;
  getStatusIcon: (status: Booking['status']) => React.ReactNode;
  priority?: boolean;
}> = React.memo(({ booking, getStatusColor, getStatusIcon, priority = false }) => (
  <div className={`bg-white shadow-sm p-6 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-md ${priority ? 'ring-2 ring-blue-200' : ''}`}>
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-3">
        <div className="flex justify-center items-center bg-[#008ea2] bg-opacity-10 rounded-lg w-12 h-12">
          <Bed className="w-6 h-6 text-[#008ea2]" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            Room {booking.room?.number} - {booking.room?.type}
          </h3>
          <p className="text-gray-500 text-sm">Booking #{booking.id}</p>
        </div>
      </div>
      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
        {getStatusIcon(booking.status)}
        <span>{booking.status.replace('_', ' ')}</span>
      </div>
    </div>
    
    <div className="gap-4 grid grid-cols-1 md:grid-cols-3 text-sm">
      <div>
        <p className="mb-1 text-gray-500">Check-in</p>
        <p className="font-medium">{format(new Date(booking.check_in), 'MMM dd, yyyy')}</p>
        <p className="text-gray-400 text-xs">{format(new Date(booking.check_in), 'EEEE')}</p>
      </div>
      <div>
        <p className="mb-1 text-gray-500">Check-out</p>
        <p className="font-medium">{format(new Date(booking.check_out), 'MMM dd, yyyy')}</p>
        <p className="text-gray-400 text-xs">{format(new Date(booking.check_out), 'EEEE')}</p>
      </div>
      <div>
        <p className="mb-1 text-gray-500">Total Amount</p>
        <p className="font-bold text-[#008ea2] text-lg">₱{booking.total_amount}</p>
      </div>
    </div>
    
    {booking.special_requests && (
      <div className="bg-gray-50 mt-4 p-3 border-[#008ea2] border-l-4 rounded-lg">
        <p className="text-gray-600 text-sm">
          <strong>Special Requests:</strong> {booking.special_requests}
        </p>
      </div>
    )}
  </div>
));

const FeaturedRoomCard: React.FC<{ room: Room }> = React.memo(({ room }) => (
  <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-lg overflow-hidden transition-all duration-200">
    <div className="relative bg-gray-200 h-32 overflow-hidden">
      {room.images && room.images[0] ? (
        <img
          src={room.images[0]}
          alt={`Room ${room.number} - ${room.type}`}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          loading="lazy"
        />
      ) : (
        <div className="flex justify-center items-center bg-gray-300 w-full h-full">
          <Bed className="w-8 h-8 text-gray-500" />
        </div>
      )}
      <div className="top-2 right-2 absolute bg-white bg-opacity-95 shadow-sm px-2 py-1 rounded-full">
        <span className="font-bold text-[#008ea2] text-sm">₱{room.price_per_night}/night</span>
      </div>
      {room.rating && (
        <div className="top-2 left-2 absolute flex items-center space-x-1 bg-white bg-opacity-95 shadow-sm px-2 py-1 rounded-full">
          <Star className="fill-current w-3 h-3 text-yellow-500" />
          <span className="font-medium text-gray-900 text-xs">{room.rating}</span>
        </div>
      )}
    </div>
    
    <div className="p-4">
      <h3 className="mb-1 font-semibold text-gray-900">
        Room {room.number}
      </h3>
      <p className="mb-2 text-gray-500 text-sm capitalize">{room.type} Room</p>
      <p className="mb-3 text-gray-600 text-xs line-clamp-2">{room.description}</p>
      
      {/* Room Amenities Preview */}
      <div className="flex items-center space-x-3 mb-3 text-gray-500">
        <Wifi className="w-3 h-3" />
        <Car className="w-3 h-3" />
        <Coffee className="w-3 h-3" />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1 text-gray-500 text-xs">
          <MapPin className="w-3 h-3" />
          <span>Floor {room.floor}</span>
        </div>
        <Link
          to={`/guest/rooms`}
          className="focus:outline-none font-medium text-[#008ea2] text-sm hover:underline focus:underline"
          aria-label={`View details for Room ${room.number}`}
        >
          View Details
        </Link>
      </div>
    </div>
  </div>
));

const EmptyBookingsState: React.FC = React.memo(() => (
  <div className="bg-white shadow-sm p-8 border border-gray-200 rounded-lg text-center">
    <div className="flex justify-center items-center bg-gray-100 mx-auto mb-4 rounded-full w-16 h-16">
      <Calendar className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="mb-2 font-medium text-gray-900 text-lg">No bookings yet</h3>
    <p className="mx-auto mb-6 max-w-md text-gray-500">
      Start your journey with us by exploring our available rooms and making your first reservation.
    </p>
    <Link
      to="/guest/rooms"
      className="inline-flex items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] px-6 py-3 rounded-lg focus:outline-none focus:ring-[#008ea2] focus:ring-2 text-white hover:scale-105 transition-all duration-200 transform"
      aria-label="Browse available rooms to make your first booking"
    >
      <Bed className="w-5 h-5" />
      <span>Browse Rooms</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  </div>
));

const QuickActionCard: React.FC<{
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  ariaLabel: string;
}> = React.memo(({ to, icon, title, description, ariaLabel }) => (
  <Link
    to={to}
    className="flex items-center space-x-3 bg-[#008ea2] bg-opacity-5 hover:bg-opacity-10 p-4 rounded-lg focus:outline-none focus:ring-[#008ea2] focus:ring-2 hover:scale-105 transition-all duration-200 transform"
    aria-label={ariaLabel}
  >
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  </Link>
));

// Add display names for debugging
BookingCard.displayName = 'BookingCard';
FeaturedRoomCard.displayName = 'FeaturedRoomCard';
EmptyBookingsState.displayName = 'EmptyBookingsState';
QuickActionCard.displayName = 'QuickActionCard';

export default GuestDashboard;