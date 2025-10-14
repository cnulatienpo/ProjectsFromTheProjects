import { forwardRef } from "react";
import type { ReactNode } from "react";
import { clsx } from "clsx";

export interface BadgeProps {
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
  children?: ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "default", className, children, ...rest }, ref) => {
    const variantClass =
      variant === "outline"
        ? "border border-current"
        : variant === "ghost"
          ? "bg-transparent"
          : variant === "secondary"
            ? "bg-neutral-200 text-neutral-800"
            : "bg-neutral-900 text-white";

    return (
      <span
        ref={ref}
        className={clsx(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
          variantClass,
          className,
        )}
        {...rest}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
