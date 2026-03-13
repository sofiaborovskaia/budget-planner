import Link from "next/link";
import styles from "./Button.module.css";

interface ButtonLinkProps {
  children: React.ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

export function ButtonLink({
  children,
  href,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: ButtonLinkProps) {
  if (disabled) {
    return (
      <span
        className={`${styles.button} ${styles[variant]} ${styles[size]} ${styles.disabled} ${className}`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
