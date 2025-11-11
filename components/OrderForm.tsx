
import React, { useState, useRef } from 'react';
import { OrderData } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface OrderFormProps {
  onOrderSubmit: (data: OrderData, orderId: string) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onOrderSubmit }) => {
  const [formData, setFormData] = useState<Omit<OrderData, 'screenshot'>>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    store: 'Temu',
    notes: '',
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError("File size cannot exceed 4MB.");
        setScreenshot(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      } else if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setError("Invalid file type. Please upload a PNG, JPEG, or WEBP image.");
        setScreenshot(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
      }
      else {
        setScreenshot(file);
        setError(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!screenshot) {
      setError('Please upload a screenshot of your cart.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate a submission delay for better UX, as if talking to a server.
    setTimeout(() => {
      const orderId = `NB-${Date.now()}`;
      const fullOrderData: OrderData = { ...formData, screenshot };
      onOrderSubmit(fullOrderData, orderId);
      // No need to call setIsLoading(false) because the component will unmount on success.
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {/* Form Section */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Order Details</h2>
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert"><p>{error}</p></div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" name="fullName" id="fullName" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} value={formData.fullName}/>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="tel" name="phone" id="phone" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} value={formData.phone}/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} value={formData.email}/>
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Delivery Address</label>
            <textarea name="address" id="address" rows={3} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} value={formData.address}></textarea>
          </div>
          <div>
            <label htmlFor="store" className="block text-sm font-medium text-gray-700">Store Name</label>
            <select name="store" id="store" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} value={formData.store}>
              <option>Temu</option>
              <option>AliExpress</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Screenshot of Cart</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="screenshot" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                    <span>Upload a file</span>
                    <input id="screenshot" name="screenshot" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" required onChange={handleFileChange} ref={fileInputRef} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 4MB</p>
                {screenshot && <p className="text-sm text-green-700 font-semibold mt-2">{screenshot.name}</p>}
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
            <textarea name="notes" id="notes" rows={2} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500" onChange={handleChange} value={formData.notes}></textarea>
          </div>
          <div>
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isLoading ? <><SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" /> Submitting...</> : 'Submit Order'}
            </button>
          </div>
        </form>
      </div>
      {/* Payment Info Section */}
      <div className="bg-green-50 border-2 border-green-200 p-8 rounded-xl shadow-lg lg:self-start">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
        <div className="space-y-4 text-gray-700">
          <p className="text-base">After submitting your order, please make a direct bank transfer to the account below. Your order will be processed upon payment confirmation.</p>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="font-semibold">Bank Name:</p>
              <p className="text-lg">GTBank</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="font-semibold">Account Name:</p>
              <p className="text-lg">NairaBulk Services</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="font-semibold">Account Number:</p>
              <p className="text-lg font-mono tracking-wider">0123456789</p>
          </div>
        </div>
        <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md">
            <p className="font-bold">Important!</p>
            <p>Please use your <strong className="underline">Order ID</strong> as the payment narration/reference. You will receive your Order ID after submitting the form.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
