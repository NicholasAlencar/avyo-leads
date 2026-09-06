interface AvyoLogoProps { variant?: "light" | "dark" | "symbol"; className?: string }

export function AvyoLogo({ variant = "light", className = "" }: AvyoLogoProps) {
  if (variant === "symbol") return <span aria-label="AVYO" className={`avyo-symbol ${className}`} role="img" />;
  return <span aria-label="AVYO" className={`avyo-wordmark avyo-wordmark-${variant} ${className}`} role="img" />;
}
