import React, { useState, useEffect, useRef } from 'react';
import { bookings as apiBookings, updateBooking } from '../../api/api.js';
import { Booking } from '../../types';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { Calendar, User, Bed, Edit, Eye, Filter, Search, Save, SaveIcon } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [statusUpdating,setStatusUpdating] = useState(false);

  const { logout, hotelInfo } = useAuth();
  const bookingsRef = useRef(null);

  useEffect(() => {
    if(!bookingsRef.current){
      bookingsRef.current = true;
      fetchBookings();
    }
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await apiBookings();
      setBookings(data);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error fetching bookings');
          
      if(error?.response?.data?.message === 'Unauthenticated.'){
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: Booking['status']) => {
    try {
      const { data } = await updateBooking(bookingId, { status: newStatus });
      toast.success(data?.message || 'Booking status updated');
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error updating booking');
    }
  };

  const handlePaymentStatusUpdate = async (bookingId: number, newStatus: Booking['payment_status']) => {
    setStatusUpdating(true);
    try {
      const { data } = await updateBooking(bookingId, { payment_status: newStatus });
      toast.success(data?.message || 'Booking payment status updated');
      fetchBookings();

      setSelectedBooking(data?.booking);
      // setShowModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error updating booking');
    }finally{
      setStatusUpdating(false);
    }
  }

  const handleUpdatePaymentInfo = async (booking: Booking) => {
    const updateData = {};
    if(booking.payment_status === 'paid'){
      if(booking?.payment_date){
        updateData.payment_date = booking?.payment_date;
      }

      if(booking?.payment_reference){
        updateData.payment_reference = booking?.payment_reference;
      }

      if(booking?.payment_method){
        updateData.payment_method = booking?.payment_method;
      }

      if(booking?.payment_method_account){
        updateData.payment_method_account = booking?.payment_method_account;
      }
    }else if(booking.payment_status === 'refund'){
      if(booking?.refund_date){
        updateData.refund_date = booking.refund_date;
      }
    }

    setStatusUpdating(true);
    try {
      const { data } = await updateBooking(booking.id, updateData);
      toast.success(data?.message || 'Booking payment status updated');
      fetchBookings();

      setSelectedBooking(data?.booking);

    } catch (error) {
      toast.error(error?.response?.data?.message || 'Error updating booking');
    }finally{
      setStatusUpdating(false);
    }
  }

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

  const getPaymentStatusColor = (status: Booking['payment_status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refund': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.room?.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.code.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {loading && <LoadingSpinner />}
      <div className="flex sm:flex-row flex-col justify-between items-center">
        <div>
          <h1 className="font-bold text-gray-900 text-3xl">Booking Management</h1>
          <p className="text-gray-600">Manage all hotel reservations and bookings</p>
        </div>
        <div className="mt-4 sm:mt-0 w-full sm:w-auto text-gray-500 text-sm">
          Total Bookings: {filteredBookings.length}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-sm p-4 border border-gray-200 rounded-lg">
        <div className="flex md:flex-row flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
              <input
                type="text"
                placeholder="Search by guest name, room number, or booking Code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pr-4 pl-10 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 text-xs text-left uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex justify-center items-center bg-[#008ea2] bg-opacity-10 rounded-lg w-10 h-10">
                        <Calendar className="w-5 h-5 text-[#008ea2]" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900 text-sm">{booking.code}</div>
                        {booking?.created_at && <div className="text-gray-500 text-sm">
                          {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                        </div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex justify-center items-center bg-gray-200 rounded-full w-8 h-8">
                        {booking?.user?.profile_url && <img src={booking?.user?.profile_url} alt="Profile" className="rounded-full w-full h-full object-cover"/>}
                        {!booking?.user?.profile_url && <User className="w-4 h-4 text-gray-600" />}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900 text-sm">{booking.user?.name}</div>
                        <div className="text-gray-500 text-sm">{booking.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Bed className="mr-2 w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">
                          Room {booking.room?.number}
                        </div>
                        <div className="text-gray-500 text-sm capitalize">{booking.room?.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900 text-sm whitespace-nowrap">
                    <div>
                      {booking?.check_in && <div className="font-medium">
                        {format(new Date(booking?.check_in), 'MMM dd')} - {format(new Date(booking?.check_out), 'MMM dd')}
                      </div>}
                      <div className="text-gray-500">{booking.guests} guests</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 text-sm">{hotelInfo?.currency_symbol}{booking.total_amount}</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(booking.status)}`}>
                      {booking.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-sm whitespace-nowrap">
                    <div className="flex space-x-2">
                      {/* <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModal(true);
                        }}
                        className="text-[#008ea2] hover:text-[#006b7a] transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button> */}
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="py-12 text-center">
            <Calendar className="mx-auto mb-4 w-12 h-12 text-gray-400" />
            <p className="text-gray-500 text-lg">No bookings found</p>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="z-50 absolute inset-0 flex justify-center items-start bg-black bg-opacity-50 p-4 object-cover overflow-y-auto">
          <div className="relative bg-white shadow-xl p-5 rounded-lg w-full max-w-2xl h-auto">
            <h2 className="mb-4 font-bold text-gray-900 text-xl">
              Booking Details | {selectedBooking.code}
            </h2>
            
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium text-gray-700 text-sm">Guest Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{selectedBooking.user?.name}</p>
                    <p className="text-gray-600 text-sm">{selectedBooking.user?.email}</p>
                    <p className="text-gray-600 text-sm">{selectedBooking.user?.phone}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="mb-2 font-medium text-gray-700 text-sm">Room Information</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">Room {selectedBooking.room?.number}</p>
                    <p className="text-gray-600 text-sm capitalize">{selectedBooking.room?.type} Room</p>
                    <p className="text-gray-600 text-sm">Floor {selectedBooking.room?.floor}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium text-gray-700 text-sm">Booking Information</h3>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Check-in:</span>
                      <span className="font-medium text-sm">{format(new Date(selectedBooking.check_in), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Check-out:</span>
                      <span className="font-medium text-sm">{format(new Date(selectedBooking.check_out), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Guests:</span>
                      <span className="font-medium text-sm">{selectedBooking.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Total Amount:</span>
                      <span className="font-medium text-[#008ea2] text-sm">{hotelInfo?.currency_symbol}{selectedBooking.total_amount - (+selectedBooking?.tax_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Tax Amount:</span>
                      <span className="font-medium text-[#008ea2] text-sm">{hotelInfo?.currency_symbol}{(+selectedBooking?.tax_amount).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between pt-3 border-0 border-t border-t-slate-300">
                      <span className="text-gray-600 text-sm">Amount Due:</span>
                      <span className="font-medium text-[#008ea2] text-sm">{hotelInfo?.currency_symbol}{(+selectedBooking?.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {selectedBooking.special_requests && (
                  <div>
                    <h3 className="mb-2 font-medium text-gray-700 text-sm">Special Requests</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">{selectedBooking.special_requests}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-2 mt-6 rounded-lg">
              <div>
                <h3 className="mb-3 font-medium text-gray-700 text-sm">Payment Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'paid'].map((status) => (
                    <button
                      key={status}
                      disabled={true}
                      onClick={() => handlePaymentStatusUpdate(selectedBooking.id, status as Booking['payment_status'])}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-not-allowed ${
                        selectedBooking.payment_status === status
                          ? 'bg-[#008ea2] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                
                {/* {selectedBooking?.payment_status === 'paid' &&
                <>
                  <div className="mt-3">
                    <h3 className="mb-0 font-medium text-gray-700 text-sm">Payment Method</h3>
                    <input onChange={(e) => setSelectedBooking((prev) => ({...prev, payment_method: e.target.value }))} value={selectedBooking?.payment_method || ""} type="text" className="px-4 py-1 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all" />
                  </div>

                  <div className="mt-3">
                    <h3 className="mb-0 font-medium text-gray-700 text-sm">Method Account</h3>
                    <input onChange={(e) => setSelectedBooking((prev) => ({...prev, payment_method_account: e.target.value }))} value={selectedBooking?.payment_method_account || ""} type="text" className="px-4 py-1 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all" />
                  </div>
                </>} */}
                

              </div>
              
              {/* <div className="space-y-3">
                {selectedBooking?.payment_status === 'paid' &&
                  <div className="mt-6 sm:mt-0 px-0 sm:px-4">
                    <h3 className="mb-3 font-medium text-gray-700 text-sm">Payment Reference</h3>
                    <input onChange={(e) => setSelectedBooking((prev) => ({...prev, payment_reference: e.target.value }))} value={selectedBooking?.payment_reference || ""} type="text" className="px-4 py-1 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all" />
                  </div>}
                
                {selectedBooking?.payment_status === 'refund' &&
                  <div className="sm:mt-0 px-0 sm:px-4">
                    <h3 className="mb-3 font-medium text-gray-700 text-sm">Refund Date</h3>
                    <input onChange={(e) => setSelectedBooking((prev) => ({...prev, refund_date: e.target.value }))} value={selectedBooking?.refund_date ? new Date(selectedBooking.refund_date).toISOString().slice(0, 10) : ''} type="date" className="px-4 py-1 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all" />
                  </div>}
                
                {selectedBooking?.payment_status === 'paid' &&
                  <div className="sm:mt-0 px-0 sm:px-4">
                    <h3 className="mb-0 font-medium text-gray-700 text-sm">Payment Date</h3>
                    <input onChange={(e) => setSelectedBooking((prev) => ({...prev, payment_date: e.target.value }))} value={selectedBooking?.payment_date ? new Date(selectedBooking.payment_date).toISOString().slice(0, 10) : ''} type="date" className="px-4 py-1 border border-gray-300 focus:border-transparent rounded-lg focus:ring-[#008ea2] focus:ring-2 w-full transition-all" />
                  </div>}

                {(selectedBooking?.payment_status === 'paid' || selectedBooking?.payment_status === 'refund') &&
                  <div className="flex items-end mt-4 px-0 sm:px-4">
                    <button onClick={() => handleUpdatePaymentInfo(selectedBooking)} title="Update" className="flex justify-center gap-x-2 bg-green-600 hover:opacity-75 mt-5 px-4 py-2 rounded-lg w-full font-semibold text-gray-100 text-sm">
                      <SaveIcon className="w-4 h-4" /> {statusUpdating ? 'Updating...' : 'Update Payment Info'}
                    </button>
                  </div>}
              </div> */}
            </div>
            
            <div className="mt-6">
              <h3 className="mb-3 font-medium text-gray-700 text-sm">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(selectedBooking.id, status as Booking['status'])}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      selectedBooking.status === status
                        ? 'bg-[#008ea2] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;