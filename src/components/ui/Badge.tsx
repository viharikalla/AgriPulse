import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'sage' | 'harvest' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 font-mono rounded-full uppercase tracking-wider select-none';

  const variants = {
    default: 'bg-white/10 text-[#F5F2E8] border border-white/15',
    success: 'bg-[#B9E48C]/15 text-[#B9E48C] border border-[#B9E48C]/30',
    warning: 'bg-[#EBCB78]/15 text-[#EBCB78] border border-[#EBCB78]/30',
    danger: 'bg-[#F28B78]/15 text-[#F28B78] border border-[#F28B78]/30',
    info: 'bg-[#A8D8E8]/15 text-[#A8D8E8] border border-[#A8D8E8]/30',
    sage: 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30',
    harvest: 'bg-[#EBCB78]/20 text-[#EBCB78] border border-[#EBCB78]/40',
    outline: 'bg-transparent text-[#F5F2E8]/80 border border-white/20',
    glass: 'glass-medium text-[#F5F2E8] border-white/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3.5 py-1 text-xs font-semibold',
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span>{children}</span>
    </div>
  );
};
