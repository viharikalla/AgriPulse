import React from 'react';
import { cn } from '../../lib/utils';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-6 sm:p-8 glass-medium border-[#F28B78]/30 rounded-2xl bg-[#F28B78]/5',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-[#F28B78]/15 border border-[#F28B78]/30 text-[#F28B78] flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="font-heading text-base font-bold text-[#F5F2E8] mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-[#F5F2E8]/70 max-w-md mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
