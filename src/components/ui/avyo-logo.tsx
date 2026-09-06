import Image from "next/image";

interface AvyoLogoProps { variant?: "light" | "dark" | "symbol"; className?: string }

export function AvyoLogo({ variant = "light", className = "" }: AvyoLogoProps) {
  if (variant === "symbol") return <Image alt="AVYO" className={className} height={56} priority src="/brand/avyo-mark.png" unoptimized width={64} />;
  return <Image alt="AVYO" className={className} height={54} priority src={`/brand/avyo-wordmark-${variant}.png`} unoptimized width={184} />;
}
