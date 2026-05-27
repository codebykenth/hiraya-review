import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-xs font-bold transition duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4.5 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-xs hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700",
        destructive:
          "bg-red-600 text-white shadow-xs hover:bg-red-700 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        success:
          "bg-emerald-700 text-white shadow-xs hover:bg-emerald-800 dark:bg-emerald-750 dark:hover:bg-emerald-850",
        outline:
          "bg-white border border-slate-205 text-slate-700 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-850 dark:text-slate-400 dark:hover:text-white shadow-xs",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-[10px]",
        lg: "h-12 px-6 text-xs",
        icon: "size-11",
      },
      uppercase: {
        true: "uppercase tracking-wider",
        false: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      uppercase: true,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ComponentType<any>
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, uppercase, loading = false, icon: Icon, fullWidth = false, asChild = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        data-slot="button"
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, uppercase, className }), fullWidth && "w-full")}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
            ) : Icon ? (
              <Icon className="size-4.5 shrink-0" />
            ) : null}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
