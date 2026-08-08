import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground ring-border",
        success: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
        warning: "bg-amber-500/10 text-amber-600 ring-amber-500/20 dark:text-amber-400",
        danger: "bg-red-500/10 text-red-600 ring-red-500/20 dark:text-red-400",
        info: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
        brand: "bg-primary/10 text-primary ring-primary/20",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

const lifecycleTone: Record<string, BadgeProps["tone"]> = {
  experimental: "warning",
  production: "success",
  deprecated: "warning",
  retired: "neutral",
  active: "success",
  suspended: "warning",
  archived: "neutral",
  free: "neutral",
  standard: "info",
  enterprise: "brand",
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={lifecycleTone[value] ?? "neutral"}>{value}</Badge>;
}

export function TierBadge({ tier }: { tier: number }) {
  const tone: BadgeProps["tone"] = tier === 1 ? "danger" : tier === 2 ? "warning" : tier === 3 ? "info" : "neutral";
  return <Badge tone={tone}>tier {tier}</Badge>;
}
