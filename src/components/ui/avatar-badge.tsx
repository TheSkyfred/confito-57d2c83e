
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const badgeVariants = cva(
  "absolute flex items-center justify-center rounded-full bg-white text-xs font-medium shadow-sm",
  {
    variants: {
      variant: {
        default: "border-2 border-white bg-jam-raspberry text-white",
        secondary: "border-2 border-white bg-jam-honey text-jam-dark",
        outline: "border-2 border-white bg-white text-jam-dark",
        leaf: "border-2 border-white bg-jam-leaf text-white",
      },
      size: {
        sm: "h-3 w-3 -top-0.5 -right-0.5",
        md: "h-4 w-4 -top-1 -right-1",
        lg: "h-6 w-6 -top-1 -right-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  badgeContent?: React.ReactNode;
}

function AvatarBadge({
  className,
  variant,
  size,
  badgeContent,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {badgeContent}
    </div>
  )
}

export { AvatarBadge }
