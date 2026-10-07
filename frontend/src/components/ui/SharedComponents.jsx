import { forwardRef } from "react";

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-border-subtle/80 bg-bg-surface/90 p-4 shadow-sm shadow-black/20 backdrop-blur sm:p-6 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

export function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-accent-primary text-white hover:bg-accent-primary-hover",
    secondary: "border border-border-subtle/80 bg-bg-surface-hover/70 text-text-primary hover:bg-bg-surface-hover",
    danger: "bg-verdict-wrong text-white hover:bg-red-600",
    ghost: "border border-transparent bg-transparent text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accent-primary/50 disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant] ?? variants.primary} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ value, variant = "difficulty", className = "" }) {
  const normalized = String(value ?? "").toLowerCase();

  const difficultyTone = {
    easy: "border-verdict-accepted/40 bg-verdict-accepted/10 text-verdict-accepted",
    medium: "border-verdict-tle/40 bg-verdict-tle/10 text-verdict-tle",
    hard: "border-verdict-wrong/40 bg-verdict-wrong/10 text-verdict-wrong",
  };

  const verdictTone = {
    accepted: "border-verdict-accepted/40 bg-verdict-accepted/10 text-verdict-accepted",
    wrong: "border-verdict-wrong/40 bg-verdict-wrong/10 text-verdict-wrong",
    "wrong answer": "border-verdict-wrong/40 bg-verdict-wrong/10 text-verdict-wrong",
    tle: "border-verdict-tle/40 bg-verdict-tle/10 text-verdict-tle",
    mle: "border-verdict-mle/40 bg-verdict-mle/10 text-verdict-mle",
    error: "border-verdict-error/40 bg-verdict-error/10 text-verdict-error",
    pending: "border-verdict-pending/40 bg-verdict-pending/10 text-verdict-pending",
  };

  const tone = variant === "verdict" ? verdictTone[normalized] : difficultyTone[normalized];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${tone ?? "border-border-subtle/70 bg-bg-surface-hover/70 text-text-secondary"} ${className}`.trim()}
    >
      {value ?? "Unknown"}
    </span>
  );
}

export const Input = forwardRef(function Input({ className = "", ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-lg border border-border-subtle/80 bg-bg-surface-hover/70 px-3 py-2 text-text-primary outline-none transition focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 ${className}`.trim()}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className = "", ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`w-full rounded-lg border border-border-subtle/80 bg-bg-surface-hover/70 px-3 py-2 text-text-primary outline-none transition focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 ${className}`.trim()}
      {...props}
    />
  );
});

export function Spinner({ className = "" }) {
  return <div className={`h-4 w-4 animate-spin rounded-full border-2 border-accent-primary/25 border-t-accent-primary ${className}`.trim()} />;
}

export function LoadingSkeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-bg-surface-hover/70 ${className}`.trim()} />;
}

export function EmptyState({ message, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle/80 bg-bg-surface/70 px-4 py-10 text-center text-sm text-text-secondary">
      {Icon ? <div className="mb-3 flex justify-center text-text-secondary"><Icon size={18} /></div> : null}
      <p>{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-verdict-wrong/30 bg-verdict-wrong/10 px-4 py-8 text-center text-sm text-verdict-wrong">
      <p>{message}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="mt-4 rounded-lg border border-verdict-wrong/30 px-3 py-2 font-medium text-verdict-wrong hover:bg-verdict-wrong/20">
          Try again
        </button>
      ) : null}
    </div>
  );
}
