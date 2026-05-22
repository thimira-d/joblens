"use client";
import { useState } from "react";
import { FileText, Loader2, Sparkles } from "lucide-react";
import { jobsAPI } from "@/lib/api";
import type { UserProfile } from "@/lib/api";

interface CVPasteBoxProps {
  onParsed?: (profile: Partial<UserProfile>) => void;
  value: string;
  onChange: (val: string) => void;
}

export default function CVPasteBox({ onParsed, value, onChange }: CVPasteBoxProps) {
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(false);

  const handleParse = async () => {
    if (!value.trim()) return;
    setParsing(true);
    try {
      const res = await jobsAPI.parseCV(value);
      onParsed?.(res.data);
      setParsed(true);
    } catch (err) {
      console.error("CV parse error:", err);
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="relative">
      <div className="absolute top-3 left-3 text-[var(--text-secondary)]">
        <FileText size={18} />
      </div>
      <textarea
        value={value}
        onChange={(e) => { onChange(e.target.value); setParsed(false); }}
        placeholder="Paste your CV or resume text here... Include your skills, experience, education, and work history for the best AI matching."
        className="w-full h-40 pl-10 pr-4 pt-3 pb-3 text-sm border border-[var(--border-color)] rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-[var(--text-secondary)] transition-all"
      />
      {value.trim() && !parsed && (
        <button
          onClick={handleParse}
          disabled={parsing}
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--primary-blue)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-60"
        >
          {parsing ? (
            <><Loader2 size={12} className="animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles size={12} /> Extract skills</>
          )}
        </button>
      )}
      {parsed && (
        <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Skills extracted
        </div>
      )}
    </div>
  );
}
