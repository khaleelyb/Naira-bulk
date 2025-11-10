import React, { useState, useCallback } from 'react';
import { AppView, OrderData, FullOrderData } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import OrderForm from './components/OrderForm';
import ConfirmationPage from './components/ConfirmationPage';
import Footer from './components/Footer';
import AdminPage from './components/AdminPage';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orders, setOrders] = useState<FullOrderData[]>([]);

  const handlePlaceOrderClick = useCallback(() => {
    setView(AppView.FORM);
  }, []);

  const handleOrderSubmit = useCallback((data: OrderData, generatedOrderId: string) => {
    console.log('Order submitted:', data);
    const newOrder: FullOrderData = { ...data, orderId: generatedOrderId };
    setOrders(prevOrders => [...prevOrders, newOrder]);
    setOrderId(generatedOrderId);
    setView(AppView.CONFIRMATION);
    window.scrollTo(0, 0);
  }, []);
  
  const handleStartNewOrder = useCallback(() => {
    setOrderId(null);
    setView(AppView.HOME);
    window.scrollTo(0, 0);
  }, []);

  const handlePaymentProofSubmit = useCallback((orderIdToUpdate: string, proof: File) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderIdToUpdate ? { ...order, paymentProof: proof } : order
      )
    );
    console.log(`Payment proof for order ${orderIdToUpdate} submitted.`);
  }, []);

  const handleGoToAdmin = useCallback(() => {
    setView(AppView.ADMIN);
    window.scrollTo(0, 0);
  }, []);

  const handleGoToHome = useCallback(() => {
    setView(AppView.HOME);
    window.scrollTo(0, 0);
  }, []);

  const renderView = () => {
    switch (view) {
      case AppView.HOME:
        return <HomePage onPlaceOrderClick={handlePlaceOrderClick} />;
      case AppView.FORM:
        return <OrderForm onOrderSubmit={handleOrderSubmit} />;
      case AppView.CONFIRMATION:
        return <ConfirmationPage orderId={orderId} onStartNewOrder={handleStartNewOrder} onPaymentProofSubmit={handlePaymentProofSubmit} />;
      case AppView.ADMIN:
        return <AdminPage orders={orders} />;
      default:
        return <HomePage onPlaceOrderClick={handlePlaceOrderClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <Header onGoHome={handleGoToHome} isAdminView={view === AppView.ADMIN} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {renderView()}
      </main>
      <Footer onAdminClick={handleGoToAdmin} />
    </div>
  );
};

export default App;