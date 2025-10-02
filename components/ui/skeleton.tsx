import { cn } from "@/lib/utils"

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/50",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "animate-shimmer",
        className
      )}
      style={{
        backgroundSize: "200% 100%",
        backgroundImage: "linear-gradient(90deg, hsl(var(--muted)/0.5) 0%, hsl(var(--muted)) 20%, hsl(var(--muted)/0.5) 40%, hsl(var(--muted)/0.5) 100%)",
      }}
      {...props}
    />
  )
}

export { Skeleton }
