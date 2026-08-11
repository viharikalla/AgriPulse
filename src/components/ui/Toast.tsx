import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

const ToastMessage: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[#B9E48C] shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#EBCB78] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[#F28B78] shrink-0" />,
    info: <Info className="w-5 h-5 text-[#A8D8E8] shrink-0" />,
  };

  const borders = {
    success: 'border-[#B9E48C]/30 bg-[#07130F]/90 text-[#F5F2E8]',
    warning: 'border-[#EBCB78]/30 bg-[#07130F]/90 text-[#F5F2E8]',
    error: 'border-[#F28B78]/30 bg-[#07130F]/90 text-[#F5F2E8]',
    info: 'border-[#A8D8E8]/30 bg-[#07130F]/90 text-[#F5F2E8]',
  };

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass-deep shadow-glass-deep transition-all duration-300',
        borders[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F2E8]">{toast.title}</h4>
        {toast.message && <p className="text-xs text-[#F5F2E8]/70 mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-full hover:bg-white/10 transition-colors text-[#F5F2E8]/60 hover:text-[#F5F2E8] agri-focus-ring"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
