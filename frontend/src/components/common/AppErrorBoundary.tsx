import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application error", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container container--narrow notfound">
          <h1 style={{ fontSize: "2rem" }}>Something went wrong</h1>
          <p className="text-muted">The page could not be displayed. Please reload and try again.</p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
