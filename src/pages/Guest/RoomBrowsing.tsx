import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { guestRooms, guestRoomReservation, checkRoomAvailability, getAvailableRooms } from '../../api/api.js';
import { useAuth } from '../../context/AuthContext';
import { Room } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { Users, Wifi, Tv, Wind, Bath, Coffee, Car, Utensils, Calendar, DollarSign, PanelBottom, PanelsLeftBottomIcon, CakeSlice, Heater, HardHat, Search, Filter, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addDays, differenceInDays, parseISO, isAfter, isBefore } from 'date-fns';

const amenityIcons = {
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

const RoomBrowsing = () => {
  const { user, logout, hotelInfo } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search and filter states
  const [searchCriteria, setSearchCriteria] = useState({
    check_in: format(new Date(), 'yyyy-MM-dd'),
    check_out: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    guests: 1,
    room_type: '',
    min_price: '',
    max_price: '',
  });

  const [filters, setFilters] = useState({
    amenities: [],
    floor: '',
    sort_by: 'price_asc', // price_asc, price_desc, capacity_asc, capacity_desc
  });

  const [bookingData, setBookingData] = useState({
    check_in: format(new Date(), 'yyyy-MM-dd'),
    check_out: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    guests: 1,
    special_requests: '',
  });
  
  const [bookingLoading, setBookingLoading] = useState(false);
  const [roomAvailability, setRoomAvailability] = useState({});

  const roomsRef = useRef(null);

  useEffect(() => {
    if (!roomsRef.current) {
      roomsRef.current = true;
      fetchRooms();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rooms, searchCriteria, filters]);

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

  const checkAvailability = async () => {
    if (!searchCriteria.check_in || !searchCriteria.check_out) return;
    
    setAvailabilityLoading(true);
    try {
      const { data } = await getAvailableRooms({
        check_in: searchCriteria.check_in,
        check_out: searchCriteria.check_out,
        guests: searchCriteria.guests,
        room_type: searchCriteria.room_type || null,
      });
      
      // Update room availability status
      const availabilityMap = {};
      data.available_rooms.forEach(room => {
        availabilityMap[room.id] = { available: true, room };
      });
      
      // Mark unavailable rooms
      rooms.forEach(room => {
        if (!availabilityMap[room.id]) {
          availabilityMap[room.id] = { available: false, room };
        }
      });
      
      setRoomAvailability(availabilityMap);
      
      // Update filtered rooms to show available ones first
      setFilteredRooms(data.available_rooms);
      
      if(data.available_rooms.length > 0){
        toast.success(`Found ${data.available_rooms.length} available rooms`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error checking availability');
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rooms];

    // Apply availability filter if dates are selected
    if (Object.keys(roomAvailability).length > 0) {
      filtered = filtered.filter(room => roomAvailability[room.id]?.available !== false);
    }

    // Filter by capacity
    if (searchCriteria.guests > 1) {
      filtered = filtered.filter(room => room.capacity >= searchCriteria.guests);
    }

    // Filter by room type
    if (searchCriteria.room_type) {
      filtered = filtered.filter(room => 
        room.type.toLowerCase() === searchCriteria.room_type.toLowerCase()
      );
    }

    // Filter by price range
    if (searchCriteria.min_price) {
      filtered = filtered.filter(room => room.price_per_night >= parseFloat(searchCriteria.min_price));
    }
    if (searchCriteria.max_price) {
      filtered = filtered.filter(room => room.price_per_night <= parseFloat(searchCriteria.max_price));
    }

    // Filter by amenities
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(room =>
        filters.amenities.every(amenity => room.amenities.includes(amenity))
      );
    }

    // Filter by floor
    if (filters.floor) {
      filtered = filtered.filter(room => room.floor === parseInt(filters.floor));
    }

    // Sort rooms
    switch (filters.sort_by) {
      case 'price_asc':
        filtered.sort((a, b) => a.price_per_night - b.price_per_night);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price_per_night - a.price_per_night);
        break;
      case 'capacity_asc':
        filtered.sort((a, b) => a.capacity - b.capacity);
        break;
      case 'capacity_desc':
        filtered.sort((a, b) => b.capacity - a.capacity);
        break;
      default:
        break;
    }

    setFilteredRooms(filtered);
  };

  const handleBooking = async (room) => {
    // Check individual room availability before booking
    try {
      const { data } = await checkRoomAvailability({
        room_id: room.id,
        check_in: searchCriteria.check_in,
        check_out: searchCriteria.check_out,
      });

      if (!data.available) {
        toast.error('Room is no longer available for the selected dates');
        checkAvailability(); // Refresh availability
        return;
      }
    } catch (error) {
      toast.error('Error checking room availability');
      return;
    }

    setSelectedRoom(room);
    setBookingData({
      ...bookingData,
      check_in: searchCriteria.check_in,
      check_out: searchCriteria.check_out,
      guests: searchCriteria.guests,
    });
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!user || !selectedRoom) return;

    const checkIn = new Date(bookingData.check_in);
    const checkOut = new Date(bookingData.check_out);
    const nights = differenceInDays(checkOut, checkIn);
    const subtotal = nights * selectedRoom.price_per_night;
    const taxAmount = subtotal * ((hotelInfo?.tax_rate || 0) / 100);
    const totalAmount = subtotal + taxAmount;

    setBookingLoading(true);

    try {
      const { data } = await guestRoomReservation({
        user_id: user.id,
        room_id: selectedRoom.id,
        check_in: bookingData.check_in,
        check_out: bookingData.check_out,
        guests: bookingData.guests,
        total_amount: totalAmount,
        tax_amount: taxAmount,
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

  const getRoomTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'standard': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deluxe': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'suite': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'presidential': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAvailabilityStatus = (room) => {
    const availability = roomAvailability[room.id];
    if (!availability) return null;
    
    return availability.available ? (
      <div className="flex items-center space-x-1 text-green-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Available</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1 text-red-600 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Not Available</span>
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  const checkIn = new Date(bookingData.check_in);
  const checkOut = new Date(bookingData.check_out);
  const nights = differenceInDays(checkOut, checkIn);
  const subtotal = selectedRoom ? nights * selectedRoom.price_per_night : 0;
  const taxAmount = subtotal * ((hotelInfo?.tax_rate || 0) / 100);
  const totalAmount = subtotal + taxAmount;

  // Get unique amenities for filter
  const allAmenities = [...new Set(rooms.flatMap(room => room.amenities))];
  const roomTypes = [...new Set(rooms.map(room => room.type))];
  const floors = [...new Set(rooms.map(room => room.floor))].sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Available Rooms</h1>
          <p className="text-gray-600">Find your perfect stay from our collection of rooms</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm p-6 border border-gray-200 rounded-lg">
        {/* Search Criteria */}
        <div className="gap-4 grid grid-cols-1 md:grid-cols-5 mb-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Check-in</label>
            <input
              type="date"
              value={searchCriteria.check_in}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, check_in: e.target.value })}
              className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-1 w-full"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Check-out</label>
            <input
              type="date"
              value={searchCriteria.check_out}
              min={searchCriteria.check_in}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, check_out: e.target.value })}
              className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-1 w-full"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Guests</label>
            <select
              value={searchCriteria.guests}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, guests: Number(e.target.value) })}
              className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-1 w-full"
            >
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium text-gray-700 text-sm">Room Type</label>
            <select
              value={searchCriteria.room_type}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, room_type: e.target.value })}
              className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-1 w-full"
            >
              <option value="">All Types</option>
              {roomTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end space-x-2 pt-3 pb-1">
            <button
              onClick={checkAvailability}
              disabled={availabilityLoading}
              className="flex flex-1 justify-center items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white transition-colors"
            >
              {availabilityLoading ? (
                <div className="border-white border-b-2 rounded-full w-4 h-4 animate-spin"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Search</span>
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex justify-center items-center hover:bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">Min Price</label>
                <input
                  type="number"
                  value={searchCriteria.min_price}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, min_price: e.target.value })}
                  className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-1 w-full"
                  placeholder="Min price per night"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">Max Price</label>
                <input
                  type="number"
                  value={searchCriteria.max_price}
                  onChange={(e) => setSearchCriteria({ ...searchCriteria, max_price: e.target.value })}
                  className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-1 w-full"
                  placeholder="Max price per night"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium text-gray-700 text-sm">Sort By</label>
                <select
                  value={filters.sort_by}
                  onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                  className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-1 w-full"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="capacity_asc">Capacity: Low to High</option>
                  <option value="capacity_desc">Capacity: High to Low</option>
                </select>
              </div>
            </div>
            
            {/* Amenities Filter */}
            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {allAmenities.map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, amenities: [...filters.amenities, amenity] });
                        } else {
                          setFilters({ ...filters, amenities: filters.amenities.filter(a => a !== amenity) });
                        }
                      }}
                      className="border-gray-300 rounded focus:ring-[#008ea2] text-[#008ea2]"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {Object.keys(roomAvailability).length > 0 && (
        <div className="bg-blue-50 p-4 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">
              Showing availability for {format(parseISO(searchCriteria.check_in), 'MMM dd')} - {format(parseISO(searchCriteria.check_out), 'MMM dd')}
            </span>
          </div>
          <p className="mt-1 text-blue-700 text-sm">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available for {searchCriteria.guests} guest{searchCriteria.guests !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Room Grid */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white shadow-sm hover:shadow-lg border border-gray-200 rounded-lg overflow-hidden transition-all duration-300">
            <div className="relative bg-gray-200 h-48">
              {room.images && room.images[0] && (
                <img
                  src={room.images[0]}
                  alt={`Room ${room.number}`}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="top-4 left-4 absolute">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoomTypeColor(room.type)}`}>
                  {room.type}
                </span>
              </div>
              <div className="top-4 right-4 absolute bg-white bg-opacity-95 px-3 py-1 rounded-full">
                <span className="font-bold text-[#008ea2] text-lg">{hotelInfo?.currency_symbol}{room.price_per_night}</span>
                <span className="text-gray-600 text-sm">/night</span>
              </div>
              {room.floor && (
                <div className="bottom-4 left-4 absolute bg-black bg-opacity-70 px-2 py-1 rounded-full">
                  <div className="flex items-center space-x-1 text-white text-xs">
                    <MapPin className="w-3 h-3" />
                    <span>Floor {room.floor}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-xl">Room {room.number}</h3>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500 text-sm">{room.capacity} guests</span>
                </div>
              </div>

              {/* Availability Status */}
              <div className="mb-3">
                {getAvailabilityStatus(room)}
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
                disabled={bookingLoading || (roomAvailability[room.id] && !roomAvailability[room.id].available)}
                className={`flex justify-center items-center space-x-2 py-3 rounded-lg w-full font-medium transition-colors ${
                  roomAvailability[room.id] && !roomAvailability[room.id].available
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-[#008ea2] hover:bg-[#006b7a] text-white'
                } ${bookingLoading ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                <Calendar className="w-4 h-4" />
                <span>
                  {roomAvailability[room.id] && !roomAvailability[room.id].available
                    ? 'Not Available'
                    : bookingLoading
                    ? 'Processing...'
                    : 'Book Now'
                  }
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && !loading && (
        <div className="bg-gray-50 py-12 rounded-lg text-center">
          <AlertCircle className="mx-auto mb-4 w-12 h-12 text-gray-400" />
          <p className="text-gray-600 text-lg">
            {Object.keys(roomAvailability).length > 0
              ? 'No rooms available for your selected criteria.'
              : 'No rooms available at the moment.'
            }
          </p>
          {Object.keys(roomAvailability).length > 0 && (
            <button
              onClick={() => {
                setSearchCriteria({
                  ...searchCriteria,
                  check_in: format(new Date(), 'yyyy-MM-dd'),
                  check_out: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
                  guests: 1,
                  room_type: '',
                  min_price: '',
                  max_price: '',
                });
                setFilters({
                  amenities: [],
                  floor: '',
                  sort_by: 'price_asc',
                });
                setRoomAvailability({});
              }}
              className="bg-[#008ea2] hover:bg-[#006b7a] mt-3 px-4 py-2 rounded-lg text-white transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Enhanced Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="z-50 absolute inset-0 flex justify-center items-start bg-black bg-opacity-50 p-4 object-cover overflow-y-auto">
          <div className="relative bg-white shadow-xl rounded-lg w-full max-w-2xl h-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="font-bold text-gray-900 text-xl">
                  Book Room {selectedRoom.number}
                </h2>
                <p className="text-gray-600 text-sm">{selectedRoom.type} Room</p>
              </div>
              <button
                onClick={() => {
                  setShowBookingModal(false);
                  setSelectedRoom(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {/* Room Details */}
              <div className="bg-gray-50 mb-6 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900">{selectedRoom.type} Room</h3>
                  <span className="font-bold text-[#008ea2] text-lg">
                    {hotelInfo?.currency_symbol}{selectedRoom.price_per_night}/night
                  </span>
                </div>
                <p className="mb-3 text-gray-600 text-sm">{selectedRoom.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full text-gray-600 text-xs">
                    <Users className="w-3 h-3" />
                    <span>Up to {selectedRoom.capacity} guests</span>
                  </div>
                  {selectedRoom.floor && (
                    <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full text-gray-600 text-xs">
                      <MapPin className="w-3 h-3" />
                      <span>Floor {selectedRoom.floor}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); submitBooking(); }} className="space-y-4">
                <div className="gap-4 grid grid-cols-2">
                  <div>
                    <label className="block mb-1 font-medium text-gray-700 text-sm">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={bookingData.check_out}
                      min={bookingData.check_in}
                      onChange={(e) => setBookingData({ ...bookingData, check_out: e.target.value })}
                      className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium text-gray-700 text-sm">
                      Number of Guests
                    </label>
                    <select
                      value={bookingData.guests}
                      onChange={(e) => setBookingData({ ...bookingData, guests: Number(e.target.value) })}
                      className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                      required
                    >
                      {Array.from({ length: selectedRoom.capacity }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} Guest{i + 1 > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amenities Display */}
                {selectedRoom?.amenities && (
                  <div className="mt-3 mb-6">
                    <p className="mb-2 font-medium text-gray-700 text-sm">Room Amenities:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom?.amenities.map((amenity) => {
                        const IconComponent = amenityIcons[amenity] || Wind;
                        return (
                          <div key={amenity} className="flex items-center space-x-1 bg-gray-100 px-3 py-2 rounded-full text-gray-600 text-sm">
                            <IconComponent className="w-4 h-4" />
                            <span>{amenity}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block mb-1 font-medium text-gray-700 text-sm">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={bookingData.special_requests}
                    onChange={(e) => setBookingData({ ...bookingData, special_requests: e.target.value })}
                    placeholder="Any special requests or requirements..."
                    className="px-3 py-2 border border-gray-300 focus:border-[#008ea2] rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
                    rows={3}
                  />
                </div>
                
                {/* Enhanced Booking Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border rounded-lg">
                  <h4 className="flex items-center mb-4 font-semibold text-gray-900 text-lg">
                    <DollarSign className="mr-2 w-5 h-5 text-[#008ea2]" />
                    Booking Summary
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-gray-200 border-b">
                      <div>
                        <p className="font-medium text-gray-900">Stay Duration</p>
                        
                        {bookingData.check_in && <p className="text-gray-600 text-sm">
                          {format(parseISO(bookingData.check_in), 'MMM dd, yyyy')} - {format(parseISO(bookingData.check_out), 'MMM dd, yyyy')}
                        </p>}
                      </div>
                      <span className="font-medium text-gray-900">{nights} night{nights !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Room Rate</span>
                      <span className="text-gray-900">{hotelInfo?.currency_symbol}{selectedRoom.price_per_night} × {nights} nights</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal</span>
                      <span className="text-gray-900">{hotelInfo?.currency_symbol}{subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tax ({(+hotelInfo?.tax_rate || 0).toFixed(0)}%)</span>
                      <span className="text-gray-900">{hotelInfo?.currency_symbol}{taxAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-3 border-[#008ea2] border-t-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-lg">Total Amount</span>
                        <span className="font-bold text-[#008ea2] text-xl">{hotelInfo?.currency_symbol}{totalAmount.toFixed(2)}</span>
                      </div>
                      <p className="mt-1 text-gray-600 text-sm">
                        For {bookingData.guests} guest{bookingData.guests !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBookingModal(false);
                      setSelectedRoom(null);
                    }}
                    className="flex-1 hover:bg-gray-50 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading || nights <= 0}
                    className="flex flex-1 justify-center items-center space-x-2 bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 px-6 py-3 rounded-lg font-medium text-white transition-colors disabled:cursor-not-allowed"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="border-white border-b-2 rounded-full w-4 h-4 animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Confirm Booking</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBrowsing;