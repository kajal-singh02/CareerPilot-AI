import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black';
  
  const variants = {
    primary: 'bg-[#ef233c] hover:bg-[#d90429] text-white shadow-lg shadow-[#ef233c]/25 focus:ring-[#ef233c] border border-transparent font-medium active:scale-[0.98]',
    secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/15 backdrop-blur-md focus:ring-white/30 active:scale-[0.98]',
    outline: 'border border-white/20 hover:border-white/40 hover:bg-white/5 text-zinc-200 focus:ring-white/20 active:scale-[0.98]',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-lg shadow-rose-600/20 active:scale-[0.98]',
    ghost: 'hover:bg-white/5 text-zinc-400 hover:text-white focus:ring-white/10',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 space-x-1.5',
    md: 'text-sm px-4 py-2.5 space-x-2',
    lg: 'text-base px-6 py-3 space-x-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
