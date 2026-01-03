
import React, { useEffect, useState } from 'react';
import { TemuIcon } from './icons/TemuIcon';
import { AliExpressIcon } from './icons/AliExpressIcon';
import { getGlobalNotice } from '../services/supabaseService';
import { GlobalNotice } from '../types';

interface HomePageProps {
  onPlaceOrderClick: () => void;
  isServiceOpen: boolean;
}

const Step: React.FC<{ number: string; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-600 text-white font-bold text-xl">
            {number}
        </div>
        <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-gray-600">{children}</p>
        </div>
    </div>
);


const HomePage: React.FC<HomePageProps> = ({ onPlaceOrderClick, isServiceOpen }) => {
  const [notice, setNotice] = useState<GlobalNotice | null>(null);

  useEffect(() => {
    getGlobalNotice().then(fetchedNotice => {
        setNotice(fetchedNotice);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Global Notice Banner */}
      {notice && notice.isActive && notice.message && (
        <div 
          className={`mb-8 border-l-4 p-4 rounded-md shadow flex items-start ${
            notice.type === 'alert' ? 'bg-red-100 border-red-500 text-red-800' :
            notice.type === 'warning' ? 'bg-yellow-100 border-yellow-500 text-yellow-800' :
            'bg-blue-100 border-blue-500 text-blue-800'
          }`} 
          role="alert"
        >
          <div className="mr-3 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="font-semibold mb-1">
                {notice.type === 'alert' ? 'Important Alert' : notice.type === 'warning' ? 'Notice' : 'Announcement'}
            </p>
            <p className="whitespace-pre-line">{notice.message}</p>
          </div>
        </div>
      )}

      {!isServiceOpen && (
        <div className="mb-8 bg-orange-100 border-l-4 border-orange-500 text-orange-800 p-4 rounded-md shadow" role="status">
          <p className="font-bold">Temporarily Closed for New Orders</p>
          <p>We're currently not accepting new orders. Please check back with us soon!</p>
        </div>
      )}
      
      <section className="text-center bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Shop on Temu & AliExpress from Nigeria
        </h2>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          No minimum order! We aggregate small orders into one bulk shipment to save you money. It's simple, fast, and reliable.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="https://www.temu.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 transition-transform transform hover:scale-105"
          >
            <TemuIcon className="h-6 w-6 mr-2" />
            Shop on Temu
          </a>
          <a
            href="https://www.aliexpress.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-transform transform hover:scale-105"
          >
            <AliExpressIcon className="h-6 w-6 mr-2" />
            Shop on AliExpress
          </a>
        </div>
      </section>

      <section className="mt-12 bg-white p-8 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">How to Place an Order</h3>
        <div className="space-y-8">
            <Step number="1" title="Shop & Fill Your Cart">
                Click one of the buttons above to visit Temu or AliExpress. Add all your desired items to your shopping cart.
            </Step>
            <Step number="2" title="Take a Screenshot">
                Once your cart is final, take a clear screenshot showing all items and the total price.
            </Step>
            <Step number="3" title="Submit Our Order Form">
                Return here, click "Place Your Order" below, fill in your details, and upload your cart screenshot.
            </Step>
            <Step number="4" title="Make Payment">
                After submitting the form, you'll receive an Order ID. Make a direct bank transfer to our account using your Order ID as the payment reference.
            </Step>
        </div>
      </section>
      
      <div id="order-form" className="mt-12 text-center">
        <button
          onClick={onPlaceOrderClick}
          disabled={!isServiceOpen}
          className="w-full md:w-auto bg-green-600 text-white font-bold text-xl px-12 py-4 rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isServiceOpen ? 'Ready? Place Your Order Now' : 'Currently Closed for Orders'}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
