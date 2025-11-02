import React, { useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import { CheckCircleIcon, XIcon, AlertTriangleIcon } from './icons';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const ICONS = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
  error: <AlertTriangleIcon className="w-6 h-6 text-red-400" />,
  info: <AlertTriangleIcon className="w-6 h-6 text-blue-400" />,
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(toast.id), 300); // Wait for animation
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };
  
  return (
    <div
      className={`flex items-start gap-3 w-full max-w-sm p-4 bg-base-300 rounded-lg shadow-2xl border border-base-100 transition-all duration-300 ease-in-out transform animate-fade-in-up ${
        isExiting ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
      role="alert"
    >
      <div className="flex-shrink-0">{ICONS[toast.type]}</div>
      <p className="flex-grow text-base-content text-sm font-medium">{toast.message}</p>
      <button onClick={handleDismiss} className="p-1 -m-1 text-gray-500 hover:text-white rounded-full" aria-label="Dismiss">
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-24 lg:bottom-5 right-5 z-[100] flex flex-col items-end gap-3">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
