
import React from 'react';
import { PackageIcon } from './icons/PackageIcon';

interface HeaderProps {
    onGoHome?: () => void;
    isAdminView?: boolean;
    onLogout?: () => void;
    isServiceOpen?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onGoHome, isAdminView, onLogout, isServiceOpen }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div onClick={onGoHome} className="flex items-center space-x-3 cursor-pointer">
          <PackageIcon className="h-8 w-8 text-green-600" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">NairaBulk</h1>
        </div>
        {isAdminView ? (
            <button onClick={onLogout} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Logout
            </button>
        ) : (
            <a
                href="#order-form"
                onClick={(e) => { if (!isServiceOpen) e.preventDefault(); }}
                className={`hidden sm:inline-block text-white font-semibold px-4 py-2 rounded-lg transition-colors ${
                    isServiceOpen
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-400 cursor-not-allowed'
                }`}
                aria-disabled={!isServiceOpen}
                tabIndex={!isServiceOpen ? -1 : undefined}
            >
              Place Order
            </a>
        )}
      </div>
    </header>
  );
};

export default Header;
