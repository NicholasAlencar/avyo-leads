import Link from "next/link";
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const buttonStyles = {
  primary: "bg-[var(--brand-primary)] text-white shadow-[0_8px_22px_rgba(24,92,255,.22)] hover:bg-[var(--brand-primary-hover)]",
  secondary: "border border-[var(--border-strong)] bg-white text-[var(--text-primary)] hover:bg-[var(--surface-subtle)]",
  ghost: "text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-primary)]",
  danger: "bg-red-600 text-white hover:bg-red-700",
} as const;

export function Button({ className, variant = "secondary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonStyles }) {
  return <button className={classes("inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-45", buttonStyles[variant], className)} data-variant={variant} {...props} />;
}

export function IconButton({ label, className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button aria-label={label} className={classes("inline-grid size-10 place-items-center rounded-xl border border-transparent text-[var(--text-secondary)] transition hover:border-[var(--border)] hover:bg-white hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/15", className)} {...props}>{children}</button>;
}

const badgeStyles = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-blue-50 text-blue-700 ring-blue-100",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  warning: "bg-amber-50 text-amber-800 ring-amber-100",
  danger: "bg-red-50 text-red-700 ring-red-100",
} as const;

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: keyof typeof badgeStyles }) {
  return <span className={classes("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", badgeStyles[tone], className)} data-tone={tone} {...props} />;
}

export function Surface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("rounded-[var(--radius-panel)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]", className)} {...props} />;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "V";
  return <span aria-label={name} className={classes("grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 text-[11px] font-bold text-white", className)} role="img">{initials}</span>;
}

export function PageHeading({ eyebrow, title, description, actions, className }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode; className?: string }) {
  return <header className={classes("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}><div>{eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--brand-primary)]">{eyebrow}</p> : null}<h1 className="mt-1 text-3xl font-semibold tracking-[-.045em] text-[var(--text-primary)] lg:text-[2.15rem]">{title}</h1>{description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p> : null}</div>{actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}</header>;
}

export function EmptyState({ title, description, actionHref, actionLabel, icon }: { title: string; description: string; actionHref?: string; actionLabel?: string; icon?: ReactNode }) {
  return <div className="flex flex-col items-center px-6 py-14 text-center">{icon ? <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-600">{icon}</span> : null}<h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2><p className="mt-1 max-w-md text-sm leading-6 text-[var(--text-secondary)]">{description}</p>{actionHref && actionLabel ? <Link className="mt-5 inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)]" href={actionHref}>{actionLabel}</Link> : null}</div>;
}
