import React, { useState, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { addPaymentProof } from '../services/blobService';

interface ConfirmationPageProps {
  orderId: string | null;
  onStartNewOrder: () => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ orderId, onStartNewOrder }) => {
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      alert('Order ID copied to clipboard!');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("File size cannot exceed 4MB.");
        setPaymentProof(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setError("Invalid file type. Please upload a PNG, JPEG, or WEBP image.");
        setPaymentProof(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setPaymentProof(file);
        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
        setError(null);
      }
    }
  };

  const handleSubmitProof = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!paymentProof) {
      setError('Please select a file to upload.');
      return;
    }
    if (!orderId) {
      setError('Order ID is missing, cannot submit proof.');
      return;
    }
    setIsUploading(true);
    setError(null);
    
    try {
      await addPaymentProof(orderId, paymentProof);
      setUploadSuccess(true);
    } catch (err) {
      console.error("Failed to upload payment proof:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-8 md:p-12 rounded-xl shadow-lg">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900">Thank You! Your Order is Submitted.</h2>
      <p className="mt-4 text-lg text-gray-600">
        We have received your order details. Please complete the final steps below.
      </p>

      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-500">YOUR ORDER ID</p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <p className="text-3xl font-bold font-mono text-green-600 tracking-wider bg-green-100 px-4 py-2 rounded">
            {orderId || 'N/A'}
          </p>
          <button onClick={handleCopy} title="Copy Order ID" className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </button>
        </div>
      </div>

      <div className="mt-8 text-left bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md">
        <p className="font-bold">Next Step: Make Payment</p>
        <p className="mt-1">
          Please make a bank transfer for your cart's total amount to our account.
          <strong className="underline">Crucially, use your Order ID ({orderId}) as the payment narration/reference.</strong>
        </p>
        <div className="mt-4 bg-white p-4 rounded-lg border border-yellow-300 text-sm">
          <p><span className="font-semibold">Bank:</span> GTBank</p>
          <p><span className="font-semibold">Account:</span> NairaBulk Services</p>
          <p><span className="font-semibold">Number:</span> 0123456789</p>
        </div>
      </div>

      {/* Payment Proof Upload Section */}
      <div className="mt-8 text-left bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
        <h3 className="text-xl font-bold text-gray-900 text-center mb-4">Confirm Your Payment</h3>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}

        {uploadSuccess ? (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md text-center">
            <p className="font-bold">✅ Success!</p>
            <p>Your payment proof has been submitted. We will verify it shortly.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              id="paymentProof"
              name="paymentProof"
              type="file"
              className="sr-only"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {!paymentProof && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-gray-400 rounded-md shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UploadIcon className="h-6 w-6" />
                Upload Payment Receipt
              </button>
            )}

            {previewUrl && paymentProof && (
              <div className="p-4 border rounded-lg bg-white">
                <p className="text-sm font-medium text-gray-600 mb-2">Your Upload:</p>
                <div className="flex items-center gap-4">
                  <img src={previewUrl} alt="Payment proof preview" className="h-20 w-20 object-cover rounded-md border" />
                  <div className="text-left flex-grow">
                    <p className="text-sm font-semibold text-gray-800 truncate">{paymentProof.name}</p>
                    <p className="text-xs text-gray-500">{`${(paymentProof.size / 1024).toFixed(1)} KB`}</p>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-1 text-sm font-medium text-blue-600 hover:text-blue-500">Change file</button>
                  </div>
                </div>
              </div>
            )}

            {paymentProof && (
              <button
                type="button"
                onClick={handleSubmitProof}
                disabled={isUploading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUploading ? <><SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Submitting...</> : 'Submit Proof'}
              </button>
            )}
          </div>
        )}
      </div>


      <div className="mt-10">
        <button
          onClick={onStartNewOrder}
          className="bg-green-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          Place Another Order
        </button>
      </div>

    </div>
  );
};

export default ConfirmationPage;
