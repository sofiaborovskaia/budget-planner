"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/lib/actions/auth";
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

/**
 * TopNavigation Props
 *
 * @param user - Current authenticated user (from session) or undefined
 */
interface TopNavigationProps {
  user?: {
    id?: string | null;
    email?: string | null;
    name?: string | null;
  };
}

export function TopNavigation({ user }: TopNavigationProps) {
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

  /**
   * Handle logout
   * Calls Server Action to sign out
   */
  const handleLogout = async () => {
    await signOut();
  };

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
          {/* Only show Dashboard and Profile when authenticated */}
          {user && (
            <>
              <NavLink
                href="/"
                isActive={pathname === "/" || pathname.includes("/period/")}
              >
                Dashboard
              </NavLink>

              <NavLink href="/profile" isActive={pathname === "/profile"}>
                Profile
              </NavLink>
            </>
          )}

          <NavLink href="/about" isActive={pathname === "/about"}>
            About & FAQ
          </NavLink>

          {/* Auth Buttons */}
          {user ? (
            <button
              onClick={handleLogout}
              className={`${styles.navLink} hideOnMobile`}
              style={{ border: "none", background: "none", cursor: "pointer" }}
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink href="/login" isActive={pathname === "/login"}>
                Login
              </NavLink>
              <NavLink href="/signup" isActive={pathname === "/signup"}>
                Sign Up
              </NavLink>
            </>
          )}

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
            {/* Only show Profile when authenticated */}
            {user && (
              <Link
                href="/profile"
                className={styles.mobileMenuItem}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
            )}
            <Link
              href="/about"
              className={styles.mobileMenuItem}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About & FAQ
            </Link>

            {/* Mobile Auth */}
            {user ? (
              <button
                onClick={handleLogout}
                className={styles.mobileMenuItem}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: "none",
                }}
              >
                Logout ({user.email})
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={styles.mobileMenuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className={styles.mobileMenuItem}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
