import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { guestRooms, guestRoomReservation } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext';
import { Room } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { Users, Wifi, Tv, Wind, Bath, Coffee, Car, Utensils, Calendar, DollarSign, PanelBottom, PanelsLeftBottomIcon, CakeSlice, Heater, HardHat } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addDays, differenceInDays } from 'date-fns';

const amenityIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  'WiFi': Wifi,
  'TV': Tv,
  'Air Conditioning': Wind,
  'Bathroom': Bath,
  'Mini Bar': Coffee,
  'Parking': Car,
  'Room Service': Utensils,
  'Balcony': PanelBottom,
  'Living Room': PanelsLeftBottomIcon,
  'Kitchen': CakeSlice,
  'Jacuzzi': Heater,
  'Butler Service': HardHat,
};

const RoomBrowsing: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    check_in: format(new Date(), 'yyyy-MM-dd'),
    check_out: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    guests: 1,
    special_requests: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const roomsRef = useRef(null);
  useEffect(() => {

    if(!roomsRef.current){
      roomsRef.current = true;
      fetchRooms();
    }

  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await guestRooms();
      setRooms(data.filter(room => room.status === 'Available'));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error fetching rooms');

      if (error?.response?.data?.message === 'Unauthenticated.') {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (room: Room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!user || !selectedRoom) return;

    const checkIn = new Date(bookingData.check_in);
    const checkOut = new Date(bookingData.check_out);
    const nights = differenceInDays(checkOut, checkIn);
    const totalAmount = nights * selectedRoom.price_per_night;

    setBookingLoading(true);

    try {
      const { data } = await guestRoomReservation({
        user_id: user.id,
        room_id: selectedRoom.id,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guests: bookingData.guests,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        special_requests: bookingData.special_requests || undefined,
      });

      toast.success(data?.message || 'Booking created successfully!');
      setShowBookingModal(false);
      setSelectedRoom(null);
      navigate('/guest/bookings');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error creating booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const getRoomTypeColor = (type: Room['type']) => {
    switch (type) {
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'deluxe': return 'bg-purple-100 text-purple-800';
      case 'suite': return 'bg-indigo-100 text-indigo-800';
      case 'presidential': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <LoadingSpinner />;

  const checkIn = new Date(bookingData.check_in);
  const checkOut = new Date(bookingData.check_out);
  const nights = differenceInDays(checkOut, checkIn);
  const totalAmount = selectedRoom ? nights * selectedRoom.price_per_night : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Available Rooms</h1>
          <p className="text-gray-600">Find your perfect stay from our collection of rooms</p>
        </div>
      </div>

      {/* Room Grid */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white shadow-sm hover:shadow-md border border-gray-200 rounded-lg overflow-hidden transition-shadow">
            <div className="relative bg-gray-200 h-48">
              {room.images[0] && (
                <img
                  src={room.images[0]}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="top-4 left-4 absolute">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoomTypeColor(room.type)}`}>
                  {room.type}
                </span>
              </div>
              <div className="top-4 right-4 absolute bg-white bg-opacity-95 px-3 py-1 rounded-full">
                <span className="font-bold text-[#008ea2] text-lg">₱{room.price_per_night}</span>
                <span className="text-gray-600 text-sm">/night</span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-900 text-xl">Room {room.number}</h3>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500 text-sm">{room.capacity} guests</span>
                </div>
              </div>
              
              <p className="mb-4 text-gray-600 text-sm line-clamp-2">{room.description}</p>
              
              <div className="mb-4">
                <p className="mb-2 font-medium text-gray-700 text-sm">Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {room.amenities.slice(0, 4).map((amenity) => {
                    const IconComponent = amenityIcons[amenity] || Wind;
                    return (
                      <div key={amenity} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-gray-600 text-xs">
                        <IconComponent className="w-3 h-3" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                  {room.amenities.length > 4 && (
                    <div title={room.amenities.slice(4).join(', ')} className="bg-gray-100 px-2 py-1 rounded-full text-gray-500 text-xs">
                      +{room.amenities.length - 4} more
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => handleBooking(room)}
                disabled={bookingLoading}
                className={`flex justify-center items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] py-3 rounded-lg w-full font-medium text-white transition-colors ${bookingLoading ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <Calendar className="w-4 h-4" />
                <span>{bookingLoading ? 'Processing...' : 'Book Now'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-lg">No rooms available at the moment.</p>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="-top-[25px] z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 font-bold text-gray-900 text-xl">
              Book Room {selectedRoom.number}
            </h2>
            
            <div className="bg-gray-50 mb-6 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">{selectedRoom.type} Room</h3>
                <span className="font-bold text-[#008ea2] text-lg">
                  ₱{selectedRoom.price_per_night}/night
                </span>
              </div>
              <p className="text-gray-600 text-sm">{selectedRoom.description}</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); submitBooking(); }} className="space-y-4">
              <div className="gap-4 grid grid-cols-2">
                <div>
                  <label className="block mb-1 font-medium text-gray-700 text-sm">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_in}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setBookingData({ ...bookingData, check_in: e.target.value })}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium text-gray-700 text-sm">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={bookingData.check_out}
                    min={bookingData.check_in}
                    onChange={(e) => setBookingData({ ...bookingData, check_out: e.target.value })}
                    className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">
                  Number of Guests
                </label>
                <select
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({ ...bookingData, guests: Number(e.target.value) })}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                  required
                >
                  {Array.from({ length: selectedRoom.capacity }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoom?.amenities && <div className="mt-3 mb-6">
                <p className="mb-2 font-medium text-gray-700 text-sm">Amenities:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom?.amenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity] || Wind;
                    return (
                      <div key={amenity} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-gray-600 text-xs">
                        <IconComponent className="w-3 h-3" />
                        <span>{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>}
              
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">
                  Special Requests (Optional)
                </label>
                <textarea
                  value={bookingData.special_requests}
                  onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                  placeholder="Any special requests or requirements..."
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                  rows={3}
                />
              </div>
              
              {/* Booking Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="mb-2 font-medium text-gray-900">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Room Rate (₱{selectedRoom.price_per_night} × {nights} nights)</span>
                    <span>₱{selectedRoom.price_per_night * nights}</span>
                  </div>
                  <div className="mt-2 pt-1 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Total Amount</span>
                      <span className="text-[#008ea2]">₱{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedRoom(null);
                  }}
                  className="flex-1 hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading || nights <= 0}
                  className="flex flex-1 justify-center items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 px-4 py-2 rounded-lg text-white transition-colors"
                >
                  {bookingLoading ? (
                    <>
                      <div className="border-white border-b-2 rounded-full w-4 h-4 animate-spin"></div>
                      <span>Booking...</span>
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4" />
                      <span>Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBrowsing;