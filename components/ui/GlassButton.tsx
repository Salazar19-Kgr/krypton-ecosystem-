import type { ButtonHTMLAttributes, ReactNode } from "react";

type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function GlassButton({
  children,
  className = "",
  ...props
}: GlassButtonProps) {
  return (
    <button
      {...props}
      className={`k-glass-button ${className}`}
    >
      {children}
    </button>
  );
}
