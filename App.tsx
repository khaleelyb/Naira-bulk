import React, { useState, useCallback, useEffect } from 'react';
import { AppView, OrderFormData } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import OrderForm from './components/OrderForm';
import ConfirmationPage from './components/ConfirmationPage';
import Footer from './components/Footer';
import AdminPage from './components/AdminPage';
import LoginPage from './components/LoginPage';
import { createOrder, getServiceStatus, setServiceStatus } from './services/blobService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isServiceOpen, setIsServiceOpen] = useState(true);

  useEffect(() => {
    // Fetch the authoritative service status from the blob store on load.
    getServiceStatus().then(status => {
      setIsServiceOpen(status);
    });
  }, []);

  const handlePlaceOrderClick = useCallback(() => {
    if (isServiceOpen) {
      setView(AppView.FORM);
    }
  }, [isServiceOpen]);

  const handleOrderSubmit = useCallback(async (data: OrderFormData) => {
    const generatedOrderId = await createOrder(data);
    setOrderId(generatedOrderId);
    setView(AppView.CONFIRMATION);
    window.scrollTo(0, 0);
  }, []);
  
  const handleStartNewOrder = useCallback(() => {
    setOrderId(null);
    setView(AppView.HOME);
    window.scrollTo(0, 0);
  }, []);

  const handleGoToAdmin = useCallback(() => {
    setView(isAdminAuthenticated ? AppView.ADMIN : AppView.LOGIN);
    window.scrollTo(0, 0);
  }, [isAdminAuthenticated]);

  const handleGoToHome = useCallback(() => {
    setView(AppView.HOME);
    window.scrollTo(0, 0);
  }, []);

  const handleAdminLogin = useCallback((username, password) => {
    // In a real app, this should be a secure API call.
    if (username === 'admin123' && password === '123234345') {
      setIsAdminAuthenticated(true);
      setView(AppView.ADMIN);
      window.scrollTo(0, 0);
      return true;
    }
    return false;
  }, []);

  const handleAdminLogout = useCallback(() => {
    setIsAdminAuthenticated(false);
    setView(AppView.HOME);
    window.scrollTo(0, 0);
  }, []);

  const handleToggleServiceStatus = useCallback(async () => {
    const newStatus = !isServiceOpen;
    setIsServiceOpen(newStatus); // Optimistic UI update for responsiveness
    try {
      await setServiceStatus(newStatus);
    } catch (error) {
      console.error("Failed to persist service status:", error);
      alert("Error: Could not update service status. Reverting change.");
      setIsServiceOpen(!newStatus); // Revert on error
    }
  }, [isServiceOpen]);

  const renderView = () => {
    switch (view) {
      case AppView.HOME:
        return <HomePage onPlaceOrderClick={handlePlaceOrderClick} isServiceOpen={isServiceOpen} />;
      case AppView.FORM:
        return <OrderForm onOrderSubmit={handleOrderSubmit} />;
      case AppView.CONFIRMATION:
        return <ConfirmationPage orderId={orderId} onStartNewOrder={handleStartNewOrder} />;
      case AppView.ADMIN:
        return isAdminAuthenticated ? <AdminPage isServiceOpen={isServiceOpen} onToggleServiceStatus={handleToggleServiceStatus} /> : <LoginPage onLogin={handleAdminLogin} />;
      case AppView.LOGIN:
        return <LoginPage onLogin={handleAdminLogin} />;
      default:
        return <HomePage onPlaceOrderClick={handlePlaceOrderClick} isServiceOpen={isServiceOpen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <Header onGoHome={handleGoToHome} isAdminView={view === AppView.ADMIN} onLogout={handleAdminLogout} isServiceOpen={isServiceOpen} />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {renderView()}
      </main>
      <Footer onAdminClick={handleGoToAdmin} />
    </div>
  );
};

export default App;
