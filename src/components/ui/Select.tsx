import React, { SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, children, id, disabled, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = error && selectId ? `${selectId}-error` : undefined;
    const helperId = helperText && selectId ? `${selectId}-helper` : undefined;

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]/80 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId || helperId}
            className={cn(
              'w-full px-4 py-2.5 text-sm text-[#F5F2E8] bg-[#10251C] border border-white/15 rounded-xl appearance-none transition-all duration-200 agri-focus-ring disabled:opacity-40 disabled:cursor-not-allowed pr-10',
              error && 'border-[#F28B78] focus-visible:ring-[#F28B78]',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[#07130F] text-[#F5F2E8]">
                    {opt.icon ? `${opt.icon} ${opt.label}` : opt.label}
                  </option>
                ))
              : children}
          </select>
          <div className="absolute right-3.5 text-[#F5F2E8]/40 pointer-events-none flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error ? (
          <p id={errorId} className="text-xs text-[#F28B78] font-medium">{error}</p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-[#F5F2E8]/60">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
