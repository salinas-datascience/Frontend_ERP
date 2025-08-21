import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DebouncedSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onDebouncedChange: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  isLoading?: boolean;
  showClearButton?: boolean;
}

const DebouncedSearchInput = React.forwardRef<HTMLInputElement, DebouncedSearchInputProps>(
  ({ 
    className, 
    onDebouncedChange, 
    onClear, 
    debounceMs = 300, 
    isLoading = false,
    showClearButton = false,
    value: controlledValue,
    ...props 
  }, ref) => {
    const [inputValue, setInputValue] = useState(controlledValue || '');
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
      if (controlledValue !== undefined) {
        setInputValue(controlledValue);
      }
    }, [controlledValue]);

    useEffect(() => {
      setIsPending(true);
      const timer = setTimeout(() => {
        onDebouncedChange(inputValue as string);
        setIsPending(false);
      }, debounceMs);

      return () => {
        clearTimeout(timer);
        setIsPending(false);
      };
    }, [inputValue, debounceMs, onDebouncedChange]);

    const handleClear = () => {
      setInputValue('');
      onClear?.();
    };

    const showSpinner = isLoading || isPending;
    const showClear = showClearButton && inputValue && String(inputValue).length > 0;

    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 pl-10 pr-10 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          ref={ref}
          {...props}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {showSpinner && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          {showClear && !showSpinner && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

DebouncedSearchInput.displayName = 'DebouncedSearchInput';

export { DebouncedSearchInput };