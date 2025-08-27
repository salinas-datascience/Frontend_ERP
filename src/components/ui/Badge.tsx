import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md'
}) => {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const baseClasses = `inline-flex items-center rounded-full font-medium ${sizeClasses[size]}`;
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    secondary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};