import React from 'react';
import { cn } from '../../lib/utils';
import { Sprout } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 glass-medium border-white/12 rounded-2xl shadow-glass-md',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#10251C] border border-[#B9E48C]/30 text-[#B9E48C] flex items-center justify-center mb-4 shadow-glow-living">
        {icon || <Sprout className="w-6 h-6" />}
      </div>
      <h3 className="font-heading text-lg font-bold text-[#F5F2E8] mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-[#F5F2E8]/70 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
