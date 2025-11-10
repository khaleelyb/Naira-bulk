
import React from 'react';
import { TemuIcon } from './icons/TemuIcon';
import { AliExpressIcon } from './icons/AliExpressIcon';

interface HomePageProps {
  onPlaceOrderClick: () => void;
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


const HomePage: React.FC<HomePageProps> = ({ onPlaceOrderClick }) => {
  return (
    <div className="max-w-4xl mx-auto">
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
          className="w-full md:w-auto bg-green-600 text-white font-bold text-xl px-12 py-4 rounded-lg shadow-lg hover:bg-green-700 transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
        >
          Ready? Place Your Order Now
        </button>
      </div>
    </div>
  );
};

export default HomePage;
