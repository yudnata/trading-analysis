'use client';

import type { ReactNode } from 'react';
import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; message?: string }
> {
  state: { hasError: boolean; message?: string } = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'unknown_error',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
            <div className="font-medium">Something went wrong</div>
            <div className="mt-1 text-red-700 dark:text-red-200">{this.state.message}</div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
