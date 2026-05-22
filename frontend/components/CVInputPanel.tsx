"use client";
import { X } from "lucide-react";

interface CVInputPanelProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  label: string;
}

export default function CVInputPanel({ value, onChange, placeholder, label }: CVInputPanelProps) {
  return (
    <div className="relative flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-[var(--text-main)] dark:text-white">
          {label}
        </label>
        {value && (
          <button
            onClick={() => onChange("")}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-[var(--text-secondary)] transition-colors"
            aria-label="Clear"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[220px] px-4 py-3 text-sm border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none placeholder:text-[var(--text-secondary)]"
      />
      <div className="mt-1 text-xs text-[var(--text-secondary)]">
        {value.length} characters
      </div>
    </div>
  );
}
