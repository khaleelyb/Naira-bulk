import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/HomePage';
import { ImportFromChinaPage } from './pages/ImportFromChina';
import { TrackOrderPage } from './pages/TrackOrder';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProductDetailsPage } from './pages/ProductDetails';
import { CartPage } from './pages/CartPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminChinaOrders } from './pages/admin/ChinaOrders';
import { AdminProducts } from './pages/admin/Products';
import { UserDashboard } from './pages/UserDashboard';
import { supabase } from './lib/supabase';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50 flex flex-col">
        <Navbar session={session} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/import" element={<ImportFromChinaPage />} />
            <Route path="/track" element={<TrackOrderPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard/*" 
              element={session ? <UserDashboard /> : <Navigate to="/login" />} 
            />
            
            {/* Admin Routes */}
            <Route path="/admin" element={session ? <AdminLayout /> : <Navigate to="/login" />}>
              <Route index element={<Navigate to="china-orders" />} />
              <Route path="china-orders" element={<AdminChinaOrders />} />
              <Route path="products" element={<AdminProducts />} />
            </Route>
          </Routes>
        </main>
        <footer className="bg-neutral-900 text-white py-12 px-4 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#FF4700]">Nairabulk</h3>
              <p className="text-neutral-400 text-sm">
                Your premier gateway for international sourcing and e-commerce logistics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Sourcing</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>1688 Sourcing</li>
                <li>Alibaba Procurement</li>
                <li>Custom Manufacturing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>Help Center</li>
                <li>Shipping Rates</li>
                <li>Track Order</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li>Email: hello@nairabulk.com</li>
                <li>WhatsApp: +234 812 345 6789</li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-500">
            © 2024 Nairabulk. All rights reserved.
          </div>
        </footer>
        <Toaster position="top-center" expand={true} richColors />
      </div>
    </BrowserRouter>
  );
}
