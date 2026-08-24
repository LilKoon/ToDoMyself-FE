"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "info",
  isOpen,
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-500 flex-shrink-0" />,
  };

  const borders = {
    success: "border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100",
    error: "border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100",
    info: "border-indigo-500/30 bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100",
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md max-w-md ${borders[type]}`}
      >
        {icons[type]}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <X className="w-4 h-4 opacity-70 hover:opacity-100" />
        </button>
      </div>
    </div>
  );
};
