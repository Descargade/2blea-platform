"use client";

import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ message = "Ocurrió un error al cargar los datos", onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4" role="alert">
      <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-300 mb-2">Error</h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="premium-button text-sm">
          Intentar de nuevo
        </button>
      )}
    </div>
  );
}
