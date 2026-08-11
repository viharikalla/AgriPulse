import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-mono font-bold uppercase tracking-wider text-[#F5F2E8]/80">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-4 py-3 rounded-xl glass-medium border border-white/20 text-[#F5F2E8] placeholder-[#F5F2E8]/40 focus:outline-none focus:border-[#B9E48C] focus:ring-1 focus:ring-[#B9E48C] transition-all text-sm pr-12 ${
            error ? 'border-[#F28B78] focus:border-[#F28B78] focus:ring-[#F28B78]' : ''
          } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3 p-1.5 text-[#F5F2E8]/60 hover:text-[#B9E48C] focus:outline-none transition-colors rounded-lg"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="text-xs font-mono text-[#F28B78] pt-0.5">{error}</p>
      )}
    </div>
  );
};
