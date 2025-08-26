import React, { useState, useEffect, useRef } from 'react';
import { guestBookings, guestCancelBooking } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { Calendar, Bed, Users, DollarSign, Clock, MapPin, MessageSquare } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const GuestBookings: React.FC = () => {
  const { user,logout, hotelInfo } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  const bookingsRef = useRef(null);
  const navigate = useNavigate();

  const [bookCancelling,setBookCancelling] = useState(false);

  useEffect(() => {
    if (user?.id) {
      if(!bookingsRef.current){
        bookingsRef.current = true;
        fetchBookings();
      }
    }
  }, [user?.id]);

  const fetchBookings = async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await guestBookings();
      setBookings(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error fetching bookings');

      if (error?.response?.data?.message === 'Unauthenticated.') {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'checked_in': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'checked_out': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filterBookings = (status: 'upcoming' | 'past' | 'cancelled') => {
    const now = new Date();
    
    return bookings.filter(booking => {
      const checkIn = new Date(booking.check_in);
      const checkOut = new Date(booking.check_out);
      
      if (status === 'cancelled') {
        return booking.status === 'cancelled';
      }
      
      if (status === 'upcoming') {
        return booking.status !== 'cancelled' && 
               (booking.status === 'pending' || booking.status === 'confirmed' || 
                (booking.status === 'checked_in' && checkOut > now));
      }
      
      if (status === 'past') {
        return booking.status === 'checked_out' || 
               (checkOut < now && booking.status !== 'cancelled');
      }
      
      return false;
    });
  };

  const handleCancelBooking = async (booking) => {
    
    if(window.confirm('Do you really want to cancel your room reservation?')){
        setBookCancelling(true);

        try{
          const { data } = await guestCancelBooking(booking.id);
    
          fetchBookings();
    
          toast.success(data?.message || 'Your room reservation has been cancelled successfully!');
        }catch(error){
          console.log(error);

          toast.error(error?.response?.data?.message || 'Failed to cancel your room reservation!');
        }finally{
          setBookCancelling(false);
        }
    }
  }

  const filteredBookings = filterBookings(activeTab);

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner/>}
      <div>
        <h1 className="font-bold text-gray-900 text-3xl">My Bookings</h1>
        <p className="text-gray-600">View and manage your hotel reservations</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="border-gray-200 border-b overflow-x-auto">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'upcoming', label: 'Upcoming', count: filterBookings('upcoming').length },
              { id: 'past', label: 'Past Stays', count: filterBookings('past').length },
              { id: 'cancelled', label: 'Cancelled', count: filterBookings('cancelled').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#008ea2] text-[#008ea2]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-[#008ea2] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white shadow-sm p-12 border border-gray-200 rounded-lg text-center">
          <Calendar className="mx-auto mb-4 w-12 h-12 text-gray-400" />
          <h3 className="mb-2 font-medium text-gray-900 text-lg">
            No {activeTab === 'upcoming' ? 'upcoming' : activeTab} bookings
          </h3>
          <p className="mb-6 text-gray-500">
            {activeTab === 'upcoming' && "You don't have any upcoming reservations."}
            {activeTab === 'past' && "You don't have any past bookings yet."}
            {activeTab === 'cancelled' && "No cancelled bookings found."}
          </p>
          {activeTab === 'upcoming' && (
            <button
              onClick={(e) => navigate('/guest/rooms')}
              className="bg-[#008ea2] hover:bg-[#006b7a] px-6 py-2 rounded-lg text-white transition-colors"
            >
              Browse Rooms
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const checkIn = new Date(booking.check_in);
            const checkOut = new Date(booking.check_out);
            const nights = differenceInDays(checkOut, checkIn);
            
            return (
              <div key={booking.id} className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex justify-center items-center bg-[#008ea2] bg-opacity-10 rounded-lg w-12 h-12">
                        <Bed className="w-6 h-6 text-[#008ea2]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          Room {booking.room?.number}
                        </h3>
                        <p className="text-gray-500 text-sm capitalize">
                          {booking.room?.type} Room • Booking {booking.code}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      <p className="mt-1 text-gray-500 text-sm">
                        {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="gap-6 grid grid-cols-1 md:grid-cols-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Check-in</p>
                        <p className="text-gray-600 text-sm">
                          {format(checkIn, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Check-out</p>
                        <p className="text-gray-600 text-sm">
                          {format(checkOut, 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Guests</p>
                        <p className="text-gray-600 text-sm">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Total</p>
                        <p className="font-semibold text-[#008ea2] text-sm">{hotelInfo?.currency_symbol}{booking.total_amount}<span className="text-slate-500 text-xs">(+{(+hotelInfo?.tax_rate || 0).toFixed(0)}% tax)</span></p>
                      </div>
                    </div>
                  </div>

                  {booking.room && (
                    <div className="bg-gray-50 mt-4 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">Room Details</h4>
                        <div className="flex items-center space-x-1 text-gray-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>Floor {booking.room.floor}</span>
                        </div>
                      </div>
                      <p className="mb-3 text-gray-600 text-sm">{booking.room.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.room.amenities.slice(0, 4).map((amenity) => (
                          <span key={amenity} className="bg-white px-2 py-1 border rounded-full text-gray-600 text-xs">
                            {amenity}
                          </span>
                        ))}
                        {booking.room.amenities.length > 4 && (
                          <span className="px-2 py-1 border rounded-full text-gray-500 text-xs">
                            +{booking.room.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {booking.special_requests && (
                    <div className="bg-blue-50 mt-4 p-4 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="mt-0.5 w-4 h-4 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-blue-900 text-sm">Special Requests</h4>
                          <p className="text-blue-800 text-sm">{booking.special_requests}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4">
                    <div className="text-gray-500 text-sm">
                      {nights} night{nights > 1 ? 's' : ''} • 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        booking.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : booking.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.payment_status}
                      </span>
                    </div>

                    {activeTab === 'upcoming' && booking.status === 'pending' && (
                      <button disabled={bookCancelling} onClick={(e) => handleCancelBooking(booking)} className={`font-medium text-red-600 text-sm hover:underline ${bookCancelling ? 'cursor-not-allowed opacity-75':''}`}>
                        {bookCancelling ? 'Processing...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GuestBookings;