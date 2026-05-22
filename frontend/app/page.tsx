"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Brain, Rocket, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-[#0A2540] dark:via-[#0F172A] dark:to-[#0A2540]">
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-56 h-56 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-40 pointer-events-none" />
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 text-xs font-medium text-[var(--primary-blue)]">
              <Sparkles size={12} /> AI-Powered Job Matching Application
            </span>
          </div>

          <h1 className="font-sora font-bold text-4xl sm:text-5xl text-center text-[var(--primary-dark)] dark:text-white leading-tight mb-4">
            Know exactly how well you match{" "}
            <span className="text-gradient">any job</span>{" "}
            — before you apply
          </h1>
          <p className="text-center text-[var(--text-secondary)] text-lg mb-10 max-w-2xl mx-auto">
            Upload your CV, paste any job description, and get an AI match score with skill gaps in seconds. Free to use.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Link href="/match" className="btn-primary w-full sm:w-auto px-8 py-3.5 text-sm font-semibold flex items-center justify-center gap-2">
              <Sparkles size={16} /> Analyze My CV — It&apos;s Free <ArrowRight size={16} />
            </Link>
            <Link href="/results" className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary-blue)] font-medium transition-colors">
              Looking for live job listings? Try Job Search <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 align-middle">Beta</span> →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-12">
          <h2 className="font-sora font-bold text-3xl text-[var(--primary-dark)] dark:text-white mb-3">How it works</h2>
          <p className="text-[var(--text-secondary)]">Three simple steps to smarter job hunting</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <FileText size={28} />,
              step: "01",
              title: "Upload your CV",
              desc: "Upload a PDF or paste your CV text. Our AI reads your skills and experience instantly.",
              color: "text-[var(--primary-blue)] bg-blue-50 dark:bg-blue-900/30",
            },
            {
              icon: <Brain size={28} />,
              step: "02",
              title: "Paste the job description",
              desc: "Copy from LinkedIn, Indeed, or anywhere — just paste the full description.",
              color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30",
            },
            {
              icon: <Rocket size={28} />,
              step: "03",
              title: "Get your match score",
              desc: "See your score, gaps, and strengths instantly. Know exactly why you fit.",
              color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30",
            },
          ].map((item, i) => (
            <div key={i} className="card p-6 dark:bg-gray-800/50 dark:border-gray-700 text-center group hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-4`}>
                {item.icon}
              </div>
              <div className="text-xs font-bold text-[var(--text-secondary)] mb-2">{item.step}</div>
              <h3 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#111827] border-t border-[var(--border-color)] dark:border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-sora font-bold text-[var(--primary-dark)] dark:text-white">JobLens.online</span>
          <p className="text-xs text-[var(--text-secondary)]">© 2026 JobLens.online — AI-powered job matching application.</p>
        </div>
      </footer>
    </div>
  );
}
