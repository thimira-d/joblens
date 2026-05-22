"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, User, Menu, X, LogOut } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("joblens_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("joblens_token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[var(--border-color)] shadow-sm dark:bg-[#111827] dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/Logotransparent.png" alt="JobLens.online" width={170} height={40} className="object-contain" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/match"
              className={`px-3 py-2 text-sm font-bold transition-colors ${
                isActive("/match")
                  ? "text-[var(--primary-blue)] underline underline-offset-4"
                  : "text-[var(--text-main)] dark:text-white hover:text-[var(--primary-blue)]"
              }`}
            >
              CV Matcher
            </Link>
            <Link
              href="/results"
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/results")
                  ? "text-[var(--primary-blue)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--primary-blue)]"
              }`}
            >
              Job Search
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                Beta
              </span>
            </Link>

            <div className="w-px h-6 bg-[var(--border-color)] dark:bg-gray-700 mx-1" />

            {isLoggedIn ? (
              <>
                <Link
                  href="/saved"
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/saved")
                      ? "text-[var(--primary-blue)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--primary-blue)]"
                  }`}
                >
                  <Bookmark size={16} /> Saved
                </Link>
                <Link
                  href="/profile"
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/profile")
                      ? "text-[var(--primary-blue)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--primary-blue)]"
                  }`}
                >
                  <User size={16} /> Profile
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/login")
                      ? "text-[var(--primary-blue)]"
                      : "text-[var(--text-main)] dark:text-white hover:text-[var(--primary-blue)]"
                  }`}
                >
                  Log In
                </Link>
                <Link href="/register" className="btn-primary px-4 py-2 text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-[var(--border-color)] pt-3">
            <Link
              href="/match"
              className={`block px-3 py-2 text-sm font-bold ${
                isActive("/match") ? "text-[var(--primary-blue)]" : "text-[var(--text-main)] dark:text-white"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              CV Matcher
            </Link>
            <Link
              href="/results"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-blue)]"
              onClick={() => setMenuOpen(false)}
            >
              Job Search
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">Beta</span>
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/saved" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-blue)]" onClick={() => setMenuOpen(false)}>
                  <Bookmark size={16} /> Saved
                </Link>
                <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-blue)]" onClick={() => setMenuOpen(false)}>
                  <User size={16} /> Profile
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 w-full text-left">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-sm font-medium text-[var(--text-main)] dark:text-white" onClick={() => setMenuOpen(false)}>Log In</Link>
                <Link href="/register" className="block px-3 py-2 text-sm font-medium text-[var(--primary-blue)]" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
