import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastTone } from "./adminContext";
import { Icon, type IconName } from "@/components/ui/Icon";

/* ---------- Toasts ---------- */
type Toast = { id: number; tone: ToastTone; text: string };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list, { id, tone, text }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="a-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`a-toast a-toast--${t.tone}`}>
            <Icon name={t.tone === "error" ? "alert" : t.tone === "info" ? "info" : "check"} />
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---------- Escape + scroll lock for overlays ---------- */
function useOverlay(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>("input, textarea, select, button[data-autofocus]")?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, [open]);
  return ref;
}

/* ---------- Side drawer used as the editor ---------- */
export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const ref = useOverlay(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className="a-overlay" onClick={onClose} aria-hidden="true" />
      <div className="a-drawer" role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <div className="a-drawer__head">
          <h2>{title}</h2>
          <button type="button" className="a-icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
        <div className="a-drawer__body">{children}</div>
        <div className="a-drawer__foot">{footer}</div>
      </div>
    </>
  );
}

/* ---------- Confirm dialog (replaces window.confirm) ---------- */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useOverlay(open, onCancel);
  if (!open) return null;
  return (
    <>
      <div className="a-overlay" onClick={onCancel} aria-hidden="true" />
      <div className="a-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" ref={ref}>
        <div className="a-modal__icon tone-red">
          <Icon name="trash" />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="a-modal__actions">
          <button type="button" className="a-btn a-btn--ghost" onClick={onCancel} data-autofocus>
            Cancel
          </button>
          <button type="button" className="a-btn a-btn--danger" onClick={onConfirm} disabled={busy}>
            {busy ? <span className="a-spin" /> : <Icon name="trash" />} {confirmLabel}
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------- Small pieces ---------- */
export function Pill({ value, kind }: { value: string; kind?: "cat" }) {
  return <span className={`a-pill ${kind ?? value.toLowerCase()}`}>{value.replace(/-/g, " ")}</span>;
}

export function Empty({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="a-empty">
      <div className="a-empty__icon">
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="a-card__body">
      <div className="a-alert a-alert--error" role="alert">
        <Icon name="alert" />
        <span>{message}</span>
        <button type="button" className="a-btn a-btn--ghost" onClick={onRetry}>
          <Icon name="refresh" /> Retry
        </button>
      </div>
    </div>
  );
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="a-card__body" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="a-skel" style={{ height: 44, marginBottom: 10 }} />
      ))}
    </div>
  );
}
