
import { cn } from "@/lib/utils"
import { Jar } from "lucide-react"

interface CreditBadgeProps {
  amount: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CreditBadge({ amount, size = "md", className }: CreditBadgeProps) {
  const sizeClasses = {
    sm: "text-xs py-0.5 px-1.5",
    md: "text-sm py-1 px-2",
    lg: "text-base py-1.5 px-3",
  }
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1 bg-jam-honey/20 text-jam-dark font-medium rounded-full",
        sizeClasses[size], 
        className
      )}
    >
      <Jar className={cn("text-jam-honey", {
        "h-3 w-3": size === "sm",
        "h-4 w-4": size === "md",
        "h-5 w-5": size === "lg",
      })} />
      <span>{amount}</span>
    </div>
  )
}
