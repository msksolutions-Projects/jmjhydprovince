import { Icon } from "@/components/ui/Icon";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="alert alert--error" role="alert">
      <Icon name="alert" />
      <div>
        <strong>{title}</strong>
        {message && <div>{message}</div>}
        {onRetry && (
          <button type="button" className="btn btn--sm btn--outline" style={{ marginTop: 10 }} onClick={onRetry}>
            <Icon name="refresh" /> Try again
          </button>
        )}
      </div>
    </div>
  );
}
