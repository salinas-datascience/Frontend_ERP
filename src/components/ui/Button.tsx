import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-gray-700 text-gray-100 hover:bg-gray-600',
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-600 text-white hover:bg-gray-500',
      outline: 'border border-gray-600 bg-transparent text-gray-100 hover:bg-gray-700',
      ghost: 'text-gray-100 hover:bg-gray-700',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      default: 'h-10 px-4 py-2',
      lg: 'h-12 px-8 text-lg',
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };