import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // @ts-ignore
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    // @ts-ignore
    const { hasError, error } = this.state;
    // @ts-ignore
    const { children } = this.props;

    if (hasError) {
      let displayMessage = "Something went wrong. Please try refreshing the page.";
      
      try {
        // Check if it's our JSON error from Firestore
        if (error?.message.startsWith('{')) {
          const errData = JSON.parse(error.message);
          if (errData.error.includes('permission-denied')) {
            displayMessage = "You don't have permission to perform this action. Please make sure you are logged in correctly.";
          } else {
            displayMessage = `Database error: ${errData.error}`;
          }
        }
      } catch (e) {
        // Fallback to default message
      }

      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Application Error</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
              {displayMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all"
            >
              <RefreshCw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}
