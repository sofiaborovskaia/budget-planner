"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./TopNavigation.module.css";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavLink({ href, children, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`${styles.navLink} ${isActive && styles.active}`}
    >
      {children}
    </Link>
  );
}

export function TopNavigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={styles.nav} data-scrolled={isScrolled}>
      <div className={styles.container}>
        {/* Logo/Home Link */}
        <Link href="/" className={styles.logo}>
          Budget Planner
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <NavLink
            href="/"
            isActive={pathname === "/" || pathname.includes("/period/")}
          >
            Dashboard
          </NavLink>

          <NavLink href="/profile" isActive={pathname === "/profile"}>
            Profile
          </NavLink>

          <NavLink href="/about" isActive={pathname === "/about"}>
            About & FAQ
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
