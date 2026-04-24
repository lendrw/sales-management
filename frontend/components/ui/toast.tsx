"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "warning";

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextType = {
  toast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

// Icon components — stable references, no JSX nodes created at module level
function ToastIcon({ type }: { type: ToastType }) {
  if (type === "success") return <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />;
  if (type === "error") return <XCircle size={16} className="text-red-500 flex-shrink-0" />;
  return <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />;
}

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-lg text-sm text-slate-800 min-w-64 max-w-sm animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
            <ToastIcon type={t.type} />
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
