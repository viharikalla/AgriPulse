import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-[#07130F]/80 backdrop-blur-lg transition-opacity duration-300">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative w-full max-w-lg glass-deep border-white/20 rounded-2xl z-10 overflow-hidden flex flex-col my-8 shadow-glass-deep transition-transform duration-300',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/10 bg-white/[0.03]">
          <div>
            {title && (
              <h3 id="modal-title" className="font-heading text-lg font-bold text-[#F5F2E8]">
                {title}
              </h3>
            )}
            {description && <p className="text-xs text-[#F5F2E8]/60 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#F5F2E8]/60 hover:text-[#F5F2E8] rounded-full hover:bg-white/10 transition-colors agri-focus-ring"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto max-h-[70vh] text-[#F5F2E8]">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 bg-white/[0.03] border-t border-white/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
