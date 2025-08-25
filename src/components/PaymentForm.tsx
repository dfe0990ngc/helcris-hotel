import React, { useState } from 'react';
import { Upload, CreditCard, DollarSign, Calendar, Image, X, Check } from 'lucide-react';
import { deleteCloudinaryImageClientSide } from '../lib/utils';

interface PaymentData {
  bookingCode: string;
  guestName: string;
  amount: string;
  paymentMethod: string;
  paymentReference: string;
  paymentDate: string;
  notes: string;
  receipt_url: string;
}

interface PaymentFormProps {
  onSubmit: (paymentData: PaymentData) => void;
  onCancel?: () => null;
  loading?: boolean;
  currencySymbol?: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, onCancel, loading = false, currencySymbol = "₱" }) => {
  const [formData, setFormData] = useState<PaymentData>({
    bookingCode: '',
    guestName: '',
    amount: '',
    paymentMethod: '',
    paymentReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
    receipt_url: ''
  });
  


  const [processing, setProcessing] = useState(false);

  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof PaymentData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file: File) => {
    handleUpload(file);
    // if (file && file.type.startsWith('image/')) {
    //   setFormData(prev => ({ ...prev, receiptImage: file }));
    //   const reader = new FileReader();
    //   reader.onload = (e) => {
    //     setImagePreview(e.target?.result as string);
    //   };
    //   reader.readAsDataURL(file);
    // }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeImage = async () => {
    await deleteCloudinaryImageClientSide(imagePreview);

    setFormData(prev => ({ ...prev, receipt_url: null }));
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleUpload = async (file?: File) => {
      if (!file) return;
  
      // Restrict file size < 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
  
      setProcessing(true);
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "hillcrest-suites-images"); // from Cloudinary
  
      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/dkt49dvgv/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
  
        const data = await res.json();
  
        if (data.secure_url) {
          // Generate optimized URL with f_auto & q_auto
          const optimizedUrl = data.secure_url.replace(
            "/upload/",
            "/upload/f_auto,q_auto/"
          );
          setFormData((prev) => ({...prev, receipt_url: optimizedUrl}));
          setImagePreview(optimizedUrl);

        } else {
          alert("Upload failed, please try again.");
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert("Something went wrong while uploading.");
      }finally{
        setProcessing(false);
      }
    };

  return (
    <div className="bg-white shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#008ea2] to-[#006b7a] px-6 py-4 text-white">
        <div className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <h2 className="font-semibold text-lg">Payment Collection</h2>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            {/* Booking Information */}
            <div className="space-y-4">
              <div>
                <label htmlFor="bookingCode" className="block mb-1 font-medium text-gray-700 text-sm">
                  Booking Code *
                </label>
                <input
                  id="bookingCode"
                  type="text"
                  placeholder="e.g., ABC123"
                  value={formData.bookingCode}
                  onChange={(e) => handleInputChange('bookingCode', e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2 w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="guestName" className="block mb-1 font-medium text-gray-700 text-sm">
                  Guest Name *
                </label>
                <input
                  id="guestName"
                  type="text"
                  placeholder="Enter guest name"
                  value={formData.guestName}
                  onChange={(e) => handleInputChange('guestName', e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2 w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="amount" className="block mb-1 font-medium text-gray-700 text-sm">
                  Payment Amount *
                </label>
                <div className="relative">
                  <span className="top-1/2 left-3 absolute text-gray-400 -translate-y-1/2 transform">
                    {currencySymbol}
                  </span>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="py-2 pr-3 pl-10 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2 w-full"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4">
              <div>
                <label htmlFor="paymentMethod" className="block mb-1 font-medium text-gray-700 text-sm">
                  Payment Method *
                </label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2 w-full"
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_payment">Mobile Payment</option>
                  <option value="check">Check</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentReference" className="block mb-1 font-medium text-gray-700 text-sm">
                  Payment Reference
                </label>
                <input
                  id="paymentReference"
                  type="text"
                  placeholder="Transaction ID, Check number, etc."
                  value={formData.paymentReference}
                  onChange={(e) => handleInputChange('paymentReference', e.target.value)}
                  className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2 w-full"
                />
              </div>

              <div>
                <label htmlFor="paymentDate" className="block mb-1 font-medium text-gray-700 text-sm">
                  Payment Date *
                </label>
                <div className="relative">
                  <Calendar className="top-1/2 left-3 absolute w-4 h-4 text-gray-400 -translate-y-1/2 transform" />
                  <input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    className="py-2 pr-3 pl-10 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2 w-full"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Receipt Image Upload */}
          <div className="space-y-3">
            <label className="block font-medium text-gray-700 text-sm">
              Receipt Image
            </label>
            
            {!imagePreview ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-[#008ea2] bg-[#008ea2]/5' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                <p className="mb-2 font-medium text-gray-900 text-lg">
                  Drop receipt image here
                </p>
                <p className="mb-4 text-gray-500 text-sm">
                  or click to browse files
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  className="hidden"
                  id="receipt-upload"
                />
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => document.getElementById('receipt-upload')?.click()}
                  className={`inline-flex items-center hover:bg-[#008ea2] px-4 py-2 border border-[#008ea2] rounded-md text-[#008ea2] hover:text-white transition-colors ${processing ? 'cursor-not-allowed opacity-80' : ''}`}
                >
                  <Image className="mr-2 w-4 h-4" />
                  {processing ? ' Uploading...' : 'Choose Image'}
                </button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Receipt preview"
                  className="mx-auto border border-gray-300 rounded-lg w-full max-w-md object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="top-2 right-2 absolute bg-red-500 hover:bg-red-600 p-1 rounded-full text-white"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="bottom-2 left-2 absolute flex items-center bg-green-100 px-2 py-1 rounded-md font-medium text-green-800 text-xs">
                  <Check className="mr-1 w-3 h-3" />
                  Receipt Uploaded
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block mb-1 font-medium text-gray-700 text-sm">
              Additional Notes
            </label>
            <textarea
              id="notes"
              placeholder="Any additional information about the payment..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="px-3 py-2 border border-gray-300 focus:border-transparent rounded-md focus:outline-none focus:ring-[#008ea2] focus:ring-2 w-full"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-gray-200 border-t">
            <button onClick={onCancel}
              type="button"
              disabled={processing}
              className={`hover:bg-gray-50 px-6 py-2 border border-gray-300 rounded-md text-gray-700 transition-colors ${processing ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || processing}
              className={`bg-[#008ea2] hover:bg-[#006b7a] disabled:opacity-50 px-6 py-2 rounded-md text-white transition-colors disabled:cursor-not-allowed ${processing ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              {(loading || processing) ? 'Processing...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;