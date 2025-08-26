import React, { useState, useEffect } from 'react';
import { Search, Calendar, DollarSign, CreditCard, CheckCircle, Clock, AlertTriangle, Eye, Download, PlusCircle, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './Common/LoadingSpinner';
import PaymentForm from './PaymentForm';
import toast from 'react-hot-toast';
import { updatePayment, voidPayment } from '../api/api.js';

interface Payment {
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
  processedBy?: string;
  createdAt?: string;
}

interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface PaymentHistoryProps {
  currencySymbol?: string;
  onViewReceipt?: (payment: Payment) => void;
  onExportData?: () => void;
  onAddNewPayment?: () => void;
  apiCall?: (params: any) => Promise<any>; // Function to call your API
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  currencySymbol = '$',
  onViewReceipt,
  onExportData,
  onAddNewPayment,
  apiCall
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState('6months');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  const showEditModal = (payment) => {
    setSelectedPayment(payment);
    setShowEditForm(true);
  }

  const handleUpdatePayment = async (formData) => {
    setLoading(true);

    try{
      const { data } = await updatePayment(formData);

      toast.success(data?.message || 'Payment record has been updated!');

      setShowEditForm(false);
      setSelectedPayment(null);

      fetchPayments(pagination.current_page);
    }catch(error){  
      toast.error(error?.response?.data?.message || 'Failed to update payment info!');
    }finally{
      setLoading(false);
    }
  }

  const handleVoidPayment = async (formData) => {
    setLoading(true);

    try{
      const { data } = await voidPayment({id: formData.id});

      toast.success(data?.message || 'Payment record has been VOID!');

      setShowEditForm(false);
      setSelectedPayment(null);

      fetchPayments(pagination.current_page);
    }catch(error){ 
      toast.error(error?.response?.data?.message || 'Failed to void payment transaction!');
    }finally{
      setLoading(false);
    }
  }

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch payments when filters change
  useEffect(() => {
    fetchPayments(1); // Reset to page 1 when filters change
  }, [debouncedSearch, methodFilter, timeRangeFilter]);

  const fetchPayments = async (page: number = 1, perPage: number = pagination.per_page) => {
    if (!apiCall) return;

    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
        search: debouncedSearch,
        payment_method: methodFilter === 'all' ? '' : methodFilter,
        time_range: timeRangeFilter,
      };

      const { data } = await apiCall(params);

      setPayments(data?.data || []);
      setPagination(data?.pagination || {});
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.last_page) {
      fetchPayments(page);
    }
  };

  const handlePerPageChange = (perPage: number) => {
    setPagination(prev => ({ ...prev, per_page: perPage, current_page: 1 }));
    fetchPayments(1, perPage); // pass the new perPage directly
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (stat: Payment['status']) => {
    switch (stat) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    };
  }

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const totalAmount = payments.reduce((sum, payment) => 
    payment.status === 'completed' ? sum + (+payment.amount || 0) : sum, 0
  );

  const renderPagination = () => {
    const { current_page, last_page, total } = pagination;
    const pages = [];
    const showPages = 5;
    
    let startPage = Math.max(1, current_page - Math.floor(showPages / 2));
    let endPage = Math.min(last_page, startPage + showPages - 1);
    
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-between items-center px-6 py-4 border-gray-200 border-t">
        <div className="flex items-center space-x-4">
          <div className="text-gray-700 text-sm">
            Showing {((current_page - 1) * pagination.per_page) + 1} to {Math.min(current_page * pagination.per_page, total)} of {total} results
          </div>
          <select
            value={pagination.per_page}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-[#008ea2] focus:ring-2 text-sm"
          >
            <option value={10}>10 per page</option>
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(current_page - 1)}
            disabled={current_page === 1}
            className="flex items-center bg-white hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-l-md font-medium text-gray-500 text-sm disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex space-x-1">
            {startPage > 1 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="bg-white hover:bg-gray-50 px-3 py-2 border-gray-300 border-t border-b font-medium text-gray-500 text-sm"
                >
                  1
                </button>
                {startPage > 2 && (
                  <span className="px-3 py-2 text-gray-500 text-sm">...</span>
                )}
              </>
            )}

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-300 ${
                  page === current_page
                    ? 'bg-[#008ea2] text-white'
                    : 'text-gray-500 bg-white hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            {endPage < last_page && (
              <>
                {endPage < last_page - 1 && (
                  <span className="px-3 py-2 text-gray-500 text-sm">...</span>
                )}
                <button
                  onClick={() => handlePageChange(last_page)}
                  className="bg-white hover:bg-gray-50 px-3 py-2 border-gray-300 border-t border-b font-medium text-gray-500 text-sm"
                >
                  {last_page}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => handlePageChange(current_page + 1)}
            disabled={current_page === last_page}
            className="flex items-center bg-white hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-r-md font-medium text-gray-500 text-sm disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-gray-200 border-b">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-4 sm:space-y-0 bg-gradient-to-r from-[#008ea2] to-[#006b7a] px-6 py-4 rounded-t-lg text-white">
          <div>
            <h2 className="font-semibold text-lg">Payment History</h2>
            <p className="mt-1 text-sm">
              {pagination.total} payment(s) • Total: {currencySymbol}{+totalAmount.toFixed(2)}
            </p>
          </div>

          {onAddNewPayment && (
            <button
              onClick={onAddNewPayment}
              className="inline-flex items-center hover:bg-gray-700 px-3 py-2 border border-gray-200 rounded-md text-gray-100 hover:text-gray-300 text-sm transition-colors"
            >
              <PlusCircle className="mr-2 w-4 h-4" />
              Add New Payment
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 border-gray-200 border-b">
        <div className="flex md:flex-row flex-col gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
              <input
                type="text"
                placeholder="Search by guest name, booking code, or reference..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pr-4 pl-10 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2 w-full"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRangeFilter}
              onChange={(e) => setTimeRangeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2"
            >
              <option value="all">All Methods</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_payment">Mobile Payment</option>
              <option value="check">Check</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="p-6">
        {loading && <LoadingSpinner />}
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <p className="text-gray-500 text-lg">No payments found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="hover:shadow-md p-4 border border-gray-200 rounded-lg transition-shadow"
              >
                <div className="flex lg:flex-row flex-col justify-between lg:items-center space-y-3 lg:space-y-0">
                  <div className="flex items-start space-x-4">
                    <div className="flex justify-center items-center bg-[#008ea2]/10 rounded-lg w-10 h-10">
                      <span className="font-medium text-[#008ea2]">{currencySymbol}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{payment.guest_name}</h4>
                        <span className="inline-flex bg-gray-100 px-2 py-1 border rounded font-medium text-gray-700 text-xs">
                          {payment.booking_code}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-600 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(payment.payment_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CreditCard className="w-3 h-3" />
                          <span className="capitalize">{payment?.payment_method.replace('_', ' ')}</span>
                        </div>
                        {payment.payment_reference && (
                          <div className="text-gray-500 text-xs">
                            Ref: {payment.payment_reference}
                          </div>
                        )}
                      </div>
                      {payment.notes && (
                        <p className="mt-1 text-gray-500 text-sm truncate">
                          {payment.notes}
                        </p>
                      )}
                      {payment.processed_by && (
                        <p className="mt-1 text-gray-400 text-xs">
                          Processed by: {payment.processed_by}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between lg:justify-end items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 text-lg">
                        {currencySymbol}{payment.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>

                    <button
                        onClick={() => showEditModal(payment)}
                        className="inline-flex items-center hover:bg-[#008ea2] px-3 py-2 border border-[#008ea2] rounded-md text-[#008ea2] hover:text-white text-sm transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && payments.length > 0 && renderPagination()}

      {/* Fixed Modal */}
      {showEditForm && (
        <div className="z-50 absolute inset-0 flex justify-center items-start bg-black bg-opacity-50 p-4 object-cover overflow-y-auto">
          <div className="relative bg-white shadow-xl rounded-lg w-full max-w-2xl h-auto">
            <PaymentForm 
              onCancel={() => setShowEditForm(false)} 
              onSubmit={handleUpdatePayment} 
              onVoid={handleVoidPayment}
              loading={loading} 
              currencySymbol={currencySymbol || "₱"} 
              payment={selectedPayment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;