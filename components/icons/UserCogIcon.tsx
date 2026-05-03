import React from 'react';

export const UserCogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props} 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <circle cx="19" cy="12" r="2" />
    <path d="M19 8.5V10" />
    <path d="M19 14v1.5" />
    <path d="m21.55 10.5-1.06 1.06" />
    <path d="m17.51 14.49 1.06-1.06" />
    <path d="m16.45 10.5 1.06 1.06" />
    <path d="m20.49 14.49-1.06-1.06" />
  </svg>
);