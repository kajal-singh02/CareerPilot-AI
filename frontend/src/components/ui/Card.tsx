import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#0c0c0e]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6 transition-all text-white ${
        onClick ? 'cursor-pointer hover:border-[#ef233c]/40 hover:shadow-[#ef233c]/10 hover:shadow-xl' : 'hover:border-white/20'
      } ${className}`}
    >
      {children}
    </div>
  );
};
