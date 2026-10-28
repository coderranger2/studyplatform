import { Component, type ErrorInfo, type ReactNode } from 'react';
import { resetUserProgress } from '../../utilities/storage.ts';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[SkillForge ErrorBoundary] Caught unhandled runtime error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleClearStorageAndReload = (): void => {
    try {
      resetUserProgress();
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-screen" role="alert" aria-live="assertive">
          <div className="error-boundary-card">
            <div className="error-boundary-icon" aria-hidden="true">
              ⚠️
            </div>

            <h2 className="error-boundary-title">Something went wrong in this workspace view</h2>

            <p className="error-boundary-message">
              SkillForge encountered an unexpected error while rendering this component. Your study data is safe in local storage.
            </p>

            {this.state.error && (
              <details className="error-boundary-details">
                <summary>Technical Details & Stack</summary>
                <pre className="error-boundary-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="error-boundary-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
              >
                🔄 Try Again
              </button>

              <a href="/" className="btn btn-secondary">
                🏠 Return to Dashboard
              </a>

              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={this.handleClearStorageAndReload}
                title="Clears local demo cache and restores pristine initial mock data"
              >
                ⚡ Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
