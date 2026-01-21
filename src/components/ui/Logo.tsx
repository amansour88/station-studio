import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "white" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
}

const Logo = ({ className, variant = "default", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
    xl: "h-24",
  };

  const flameColors = {
    default: {
      outer: "#C12B2B",
      middle: "#F7941D",
      inner: "#FFD200",
    },
    white: {
      outer: "#ffffff",
      middle: "#FFD200",
      inner: "#F7941D",
    },
    dark: {
      outer: "#8B1A1A",
      middle: "#D97B0D",
      inner: "#E6C000",
    },
  };

  const textColor = {
    default: "#C12B2B",
    white: "#ffffff",
    dark: "#8B1A1A",
  };

  const colors = flameColors[variant];
  const textFill = textColor[variant];

  return (
    <svg
      viewBox="0 0 200 60"
      className={cn(sizeClasses[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Flame Icon */}
      <g transform="translate(75, 5)">
        {/* Outer flame - Red */}
        <path
          d="M25 0C25 0 15 15 15 28C15 38 20 45 25 48C30 45 35 38 35 28C35 15 25 0 25 0Z"
          fill={colors.outer}
        />
        {/* Middle flame - Orange */}
        <path
          d="M25 8C25 8 18 18 18 28C18 35 21 40 25 42C29 40 32 35 32 28C32 18 25 8 25 8Z"
          fill={colors.middle}
        />
        {/* Inner flame - Yellow */}
        <path
          d="M25 16C25 16 21 22 21 28C21 32 23 35 25 36C27 35 29 32 29 28C29 22 25 16 25 16Z"
          fill={colors.inner}
        />
      </g>

      {/* AWS Text - English */}
      <text
        x="115"
        y="40"
        fontFamily="Cairo, Arial, sans-serif"
        fontSize="26"
        fontWeight="700"
        fill={textFill}
      >
        aws
      </text>

      {/* اوس Text - Arabic */}
      <text
        x="35"
        y="40"
        fontFamily="Cairo, Arial, sans-serif"
        fontSize="26"
        fontWeight="700"
        fill={textFill}
        textAnchor="end"
      >
        اوس
      </text>
    </svg>
  );
};

export default Logo;
