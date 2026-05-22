"use client";
import { Search, MapPin } from "lucide-react";

interface SearchBarProps {
  query: string;
  location: string;
  jobType: string;
  onQueryChange: (val: string) => void;
  onLocationChange: (val: string) => void;
  onJobTypeChange: (val: string) => void;
}

const JOB_TYPES = ["Any type", "FULLTIME", "PARTTIME", "INTERN", "CONTRACTOR"];

export default function SearchBar({
  query, location, jobType,
  onQueryChange, onLocationChange, onJobTypeChange
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="relative flex-1">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Job title, skill, or keyword"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>
      <div className="relative sm:w-44">
        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
        <input
          type="text"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Location"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        />
      </div>
      <select
        value={jobType}
        onChange={(e) => onJobTypeChange(e.target.value)}
        className="sm:w-36 px-3 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-[var(--text-secondary)]"
      >
        {JOB_TYPES.map((t) => <option key={t} value={t === "Any type" ? "" : t}>{t}</option>)}
      </select>
    </div>
  );
}
