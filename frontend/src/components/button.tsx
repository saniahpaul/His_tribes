import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; children: ReactNode };
export function Button({ variant = "primary", className, children, ...props }: Props) {
  const variants = {
    primary: "bg-brand text-canvas ring-brand/40 hover:bg-brand/90",
    secondary: "bg-panel text-ink ring-line hover:bg-panel-strong",
    ghost: "bg-transparent text-muted ring-line hover:text-ink hover:bg-panel",
    danger: "bg-danger/15 text-danger ring-danger/30 hover:bg-danger/25",
  };
  return <button className={cn("inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-60", variants[variant], className)} {...props}>{children}</button>;
}
