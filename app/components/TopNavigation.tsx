"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      className={`${styles.navLink} ${isActive && styles.active} hideOnMobile`}
    >
      {children}
    </Link>
  );
}

export function TopNavigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          <Image
            src="/piggy_bank.png"
            alt="Budget Planner Logo"
            width={40}
            height={40}
            className={styles.logoIcon}
          />
          <span>Budget Planner</span>
        </Link>

        {/* Navigation Links */}
        <div className={styles.navLinks}>
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

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="19" r="1" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <Link
              href="/profile"
              className={styles.mobileMenuItem}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
            <Link
              href="/about"
              className={styles.mobileMenuItem}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About & FAQ
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
