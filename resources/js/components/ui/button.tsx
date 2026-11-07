import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs active:scale-[0.98] transition-all",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98] transition-all",
        outline:
          "border border-border/80 bg-card/70 backdrop-blur-md hover:bg-card/95 hover:border-border text-foreground shadow-xs active:scale-[0.98] transition-all",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:scale-[0.98] transition-all",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200",
        glow:
          "relative bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/35 hover:shadow-primary/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200",
        emerald:
          "bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200",
        cyan:
          "bg-gradient-to-r from-cyan-600 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200",
        purple:
          "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200",
        glass:
          "bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-foreground hover:bg-white/20 dark:hover:bg-white/10 shadow-sm active:scale-[0.98] transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
