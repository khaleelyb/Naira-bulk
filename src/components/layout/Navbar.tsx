import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Package, Globe2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';

interface NavbarProps {
  session: any;
}

export function Navbar({ session }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="bg-[#FF5A00] text-white text-[10px] sm:text-[11px] py-2 px-4 text-center font-bold tracking-tight uppercase">
        DIRECT IMPORT FROM CHINA · FREIGHT SHIPPING · WAREHOUSING
      </div>
      
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex h-16 sm:h-16 items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-[#FF5A00] rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#FF5A00]">NairaBulk</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative">
            <div className="absolute left-4 top-2.5 text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search products or paste Alibaba/1688 URL..."
              className="w-full h-10 bg-slate-100 border-none rounded-full pl-11 pr-5 text-sm font-medium focus:ring-2 focus:ring-[#FF5A00]/10 transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/import" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#FF5A00] transition-colors">
              Import from China
            </Link>
            <Link to="/track" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#FF5A00] transition-colors">
              Track Shipping
            </Link>
            
            <div className="flex items-center gap-4 border-l pl-8 border-slate-200">
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-[#FF5A00] transition-colors">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-[#FF5A00] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">0</span>
              </Link>
              
              {session ? (
                <div className="flex items-center gap-3">
                  <Link to="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs ring-2 ring-transparent group-hover:ring-[#FF5A00]/20 transition-all">
                      {session.user.email?.slice(0, 2).toUpperCase()}
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Link to="/login" className="px-3 py-2 font-semibold text-slate-600 hover:text-[#FF5A00]">Login</Link>
                  <Link to="/signup" className="px-5 py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-black transition-colors">Signup</Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-4">
            <Link to="/cart" className="relative p-2 text-neutral-800">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute top-0 right-0 bg-[#FF4700] text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">0</span>
            </Link>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-neutral-800"
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-white border-t border-neutral-100 p-4 absolute w-full shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full bg-neutral-100 border-none rounded-lg py-3 px-4 text-sm"
                />
                <Search className="absolute right-3 top-3.5 h-4 w-4 text-neutral-400" />
              </div>
              <Link to="/import" className="py-3 font-bold border-b border-neutral-50 flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-[#FF4700]" />
                Import from China
              </Link>
              <Link to="/track" className="py-3 font-bold border-b border-neutral-50 flex items-center gap-3">
                <Package className="h-5 w-5 text-[#FF4700]" />
                Track Order
              </Link>
              {session ? (
                <>
                  <Link to="/dashboard" className="py-3 font-bold border-b border-neutral-50">Dashboard</Link>
                  <button onClick={handleLogout} className="py-3 font-bold text-red-500 text-left">Logout</button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Link to="/login" className="py-3 text-center font-bold border rounded-lg">Login</Link>
                  <Link to="/signup" className="py-3 text-center font-bold bg-[#FF4700] text-white rounded-lg">Signup</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
