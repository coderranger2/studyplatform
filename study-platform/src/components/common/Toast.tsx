import React, { useState, useEffect } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export function showToast(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success'): void {
  const event = new CustomEvent('skillforge-toast', {
    detail: { message, type }
  });
  window.dispatchEvent(event);
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'info' | 'warning' | 'error' }>;
      if (!customEvent.detail) return;
      const newToast: ToastItem = {
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        message: customEvent.detail.message,
        type: customEvent.detail.type || 'success'
      };

      setToasts((prev) => [...prev.slice(-4), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('skillforge-toast', handleToastEvent);
    return () => window.removeEventListener('skillforge-toast', handleToastEvent);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="skillforge-toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`skillforge-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'info' && 'ℹ️'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'error' && '✕'}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};

