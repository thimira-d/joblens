"use client";
import { X, Lock } from "lucide-react";
import Link from "next/link";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginPromptModal({ isOpen, onClose }: LoginPromptModalProps) {
  if (!isOpen) return null;

  const handleRedirect = (path: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
    }
    window.location.href = path;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#111827] rounded-2xl shadow-xl max-w-sm w-full p-8 relative border border-[var(--border-color)] dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-[var(--text-secondary)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <Lock size={24} className="text-[var(--primary-blue)]" />
          </div>

          <h2 className="font-sora font-bold text-xl text-[var(--primary-dark)] dark:text-white mb-2">
            Sign in to Save Your Analysis
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
            Create a free account to save your match results, track your progress, and build your job search history.
          </p>

          <div className="w-full space-y-3">
            <button
              onClick={() => handleRedirect("/login")}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[#0A66C2] to-[#2F80ED] hover:from-[#084C95] hover:to-[#0A66C2] transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => handleRedirect("/register")}
              className="w-full py-2.5 rounded-xl border border-[var(--border-color)] dark:border-gray-700 text-[var(--text-main)] dark:text-white font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Create Free Account
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
