import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";
  
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-900/20 border border-transparent",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700",
    outline: "bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white",
    ghost: "bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white",
    destructive: "bg-red-900/50 text-red-200 hover:bg-red-900/80 border border-red-900",
  };
  
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-5 py-2 text-sm",
    lg: "h-12 px-8 text-base",
    icon: "h-10 w-10",
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
};
