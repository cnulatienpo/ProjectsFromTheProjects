import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: String(error) };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error("UI error:", error, info);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <main className="mx-auto max-w-5xl p-4">
          <h1 className="text-xl font-semibold">Something went wrong.</h1>
          <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">{this.state.message}</p>
          <button
            type="button"
            className="mt-3 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
