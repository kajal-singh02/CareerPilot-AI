import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  className = '',
}) => {
  const variantStyles = {
    brand: 'bg-[#ef233c]/15 text-[#ef233c] border-[#ef233c]/35 shadow-sm shadow-[#ef233c]/10',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/35',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/35',
    neutral: 'bg-white/5 text-zinc-400 border-white/10',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
