import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, disabled, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full flex flex-col space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]/80 select-none"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#F5F2E8]/40 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId || helperId}
            className={cn(
              'w-full px-4 py-2.5 text-sm text-[#F5F2E8] bg-white/[0.05] border border-white/15 rounded-xl backdrop-blur-md placeholder:text-[#F5F2E8]/30 transition-all duration-200 agri-focus-ring disabled:bg-white/[0.02] disabled:text-[#F5F2E8]/30 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-[#F28B78] focus-visible:ring-[#F28B78]',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-[#F5F2E8]/40 pointer-events-none flex items-center">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
