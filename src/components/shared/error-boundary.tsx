"use client";
import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="premium-card flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Algo salió mal</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-md">
            {this.state.error?.message || "Ocurrió un error inesperado"}
          </p>
          <button onClick={this.handleRetry} className="premium-button flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
