import React from 'react';
import { UserCogIcon } from './icons/UserCogIcon';

interface FooterProps {
  onAdminClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminClick }) => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500 relative">
        <p>&copy; {new Date().getFullYear()} NairaBulk. All rights reserved.</p>
        <p className="text-sm mt-1">Your simple gateway to global shopping.</p>
        {onAdminClick && (
          <button 
            onClick={onAdminClick} 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Admin Panel"
            aria-label="Open Admin Panel"
          >
            <UserCogIcon className="h-6 w-6" />
          </button>
        )}
      </div>
    </footer>
  );
};

export default Footer;