import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
};

export function Modal({ title, children, footer, onClose }: Props) {
  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-lg rounded-lg bg-paper shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-rule px-5 py-3">
          <h2 className="text-lg font-semibold text-brand-deep">{title}</h2>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-muted hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-rule px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-3 block text-left">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded border border-rule bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-brand";
