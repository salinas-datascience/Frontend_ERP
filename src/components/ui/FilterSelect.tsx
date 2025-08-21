import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FilterSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Array<{ value: string; label: string }>;
}

const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ className, label, options, ...props }, ref) => {
    return (
      <div className="relative">
        <label className="block text-xs font-medium text-gray-400 mb-1">
          {label}
        </label>
        <div className="relative">
          <select
            className={cn(
              'flex h-9 w-full appearance-none rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
            ref={ref}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>
    );
  }
);

FilterSelect.displayName = 'FilterSelect';

export { FilterSelect };