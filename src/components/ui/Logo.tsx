import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import logoAwsTransparent from "@/assets/logo-aws-transparent.png";
import logoFlame from "@/assets/logo-flame.png";

interface LogoProps {
  className?: string;
  variant?: "default" | "white" | "dark" | "flame-only";
  size?: "sm" | "md" | "lg" | "xl";
}

const Logo = forwardRef<HTMLImageElement, LogoProps>(
  ({ className, variant = "default", size = "md" }, ref) => {
    const sizeClasses = {
      sm: "h-8",
      md: "h-12",
      lg: "h-16",
      xl: "h-24",
    };

    // For flame-only variant, use the flame icon
    if (variant === "flame-only") {
      return (
        <img
          ref={ref}
          src={logoFlame}
          alt="اوس"
          className={cn(sizeClasses[size], "w-auto", className)}
        />
      );
    }

    // For all other variants, use the new transparent logo
    return (
      <img
        ref={ref}
        src={logoAwsTransparent}
        alt="اوس للخدمات البترولية - AWS Petroleum Services"
        className={cn(sizeClasses[size], "w-auto", className)}
      />
    );
  }
);

Logo.displayName = "Logo";

export default Logo;
