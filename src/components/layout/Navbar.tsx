import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Package, Globe2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  session: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="bg-[#FF5A00] text-white text-[10px] sm:text-[11px] py-2 px-4 text-center font-bold tracking-tight uppercase">
        DIRECT IMPORT FROM CHINA · FREIGHT SHIPPING · WAREHOUSING
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#FF5A00] rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#FF5A00]">NairaBulk</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 ml-auto">
            <Link to="/import" className="text-sm font-semibold text-slate-600 hover:text-[#FF5A00] transition-colors">
              Import from China
            </Link>
            <Link to="/track" className="text-sm font-semibold text-slate-600 hover:text-[#FF5A00] transition-colors">
              Track Shipping
            </Link>

            <div className="flex items-center gap-4 border-l pl-8 border-slate-200">
              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-[#FF5A00] transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#FF5A00] text-white text-[10px] font-black rounded-full flex items-center justify-center leading-none">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {session ? (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" className="group">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs ring-2 ring-transparent group-hover:ring-[#FF5A00]/30 transition-all">
                      {session.user.email?.slice(0, 2).toUpperCase()}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="px-3 py-2 text-sm font-semibold text-slate-600 hover:text-[#FF5A00]">Login</Link>
                  <Link to="/signup" className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-black transition-colors">
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-3">
            <Link to="/cart" className="relative p-2 text-slate-700">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-[#FF5A00] text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsMenuOpen(v => !v)}
              className="p-2 text-slate-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="lg:hidden bg-white border-t border-slate-100 p-4 absolute w-full shadow-xl z-40"
          >
            <div className="flex flex-col gap-2">
              <Link to="/import" onClick={closeMenu} className="py-3 px-4 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors">
                <Globe2 className="h-5 w-5 text-[#FF5A00]" /> Import from China
              </Link>
              <Link to="/track" onClick={closeMenu} className="py-3 px-4 font-bold rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors">
                <Package className="h-5 w-5 text-[#FF5A00]" /> Track Order
              </Link>
              {session ? (
                <>
                  <Link to="/dashboard" onClick={closeMenu} className="py-3 px-4 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="py-3 px-4 font-bold text-red-500 text-left rounded-xl hover:bg-red-50 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link to="/login" onClick={closeMenu} className="py-3 text-center font-bold border rounded-xl hover:bg-slate-50 transition-colors">Login</Link>
                  <Link to="/signup" onClick={closeMenu} className="py-3 text-center font-bold bg-[#FF5A00] text-white rounded-xl hover:bg-[#E65100] transition-colors">Signup</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
