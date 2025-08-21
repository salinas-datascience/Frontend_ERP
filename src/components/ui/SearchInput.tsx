import React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, showClearButton = false, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-600 bg-gray-800 pl-10 pr-10 py-2 text-sm text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          {...props}
        />
        {showClearButton && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };