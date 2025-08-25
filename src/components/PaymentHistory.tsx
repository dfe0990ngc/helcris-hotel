import React, { useState } from 'react';
import { Search, Calendar, DollarSign, CreditCard, CheckCircle, Clock, AlertTriangle, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';

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
}

interface PaymentHistoryProps {
  payments: Payment[];
  currencySymbol?: string;
  onViewReceipt?: (payment: Payment) => void;
  onExportData?: () => void;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({
  payments,
  currencySymbol = '$',
  onViewReceipt,
  onExportData
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.paymentReference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalAmount = filteredPayments.reduce((sum, payment) => 
    payment.status === 'completed' ? sum + payment.amount : sum, 0
  );

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-gray-200 border-b">
        <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Payment History</h2>
            <p className="mt-1 text-gray-600 text-sm">
              {filteredPayments.length} payments • Total: {currencySymbol}{totalAmount.toLocaleString()}
            </p>
          </div>
          {onExportData && (
            <button
              onClick={onExportData}
              className="inline-flex items-center hover:bg-[#008ea2] px-3 py-2 border border-[#008ea2] rounded-md text-[#008ea2] hover:text-white text-sm transition-colors"
            >
              <Download className="mr-2 w-4 h-4" />
              Export
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
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
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto mb-4 w-12 h-12 text-gray-400" />
              <p className="text-gray-500 text-lg">No payments found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="hover:shadow-md p-4 border border-gray-200 rounded-lg transition-shadow"
              >
                <div className="flex lg:flex-row flex-col justify-between lg:items-center space-y-3 lg:space-y-0">
                  <div className="flex items-start space-x-4">
                    <div className="flex justify-center items-center bg-[#008ea2]/10 rounded-lg w-10 h-10">
                      {/* <DollarSign className="w-5 h-5 text-[#008ea2]" /> */}
                        <span className="font-medium text-[#008ea2]">{currencySymbol}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{payment.guestName}</h4>
                        <span className="inline-flex bg-gray-100 px-2 py-1 border rounded font-medium text-gray-700 text-xs">
                          {payment.bookingCode}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-gray-600 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <CreditCard className="w-3 h-3" />
                          <span className="capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        {payment.paymentReference && (
                          <div className="text-gray-500 text-xs">
                            Ref: {payment.paymentReference}
                          </div>
                        )}
                      </div>
                      {payment.notes && (
                        <p className="mt-1 text-gray-500 text-sm truncate">
                          {payment.notes}
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

                    {payment.receiptUrl && onViewReceipt && (
                      <button
                        onClick={() => onViewReceipt(payment)}
                        className="inline-flex items-center hover:bg-[#008ea2] px-3 py-2 border border-[#008ea2] rounded-md text-[#008ea2] hover:text-white text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;