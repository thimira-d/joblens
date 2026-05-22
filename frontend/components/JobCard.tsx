"use client";
import { useState } from "react";
import Link from "next/link";
import { Bookmark, BookmarkCheck, MapPin, Briefcase, DollarSign, ExternalLink, ChevronRight } from "lucide-react";
import MatchScore from "./MatchScore";
import type { AnalyzedJob } from "@/lib/api";
import { savedAPI } from "@/lib/api";
import { useRouter } from "next/navigation";

interface JobCardProps {
  job: AnalyzedJob;
  onSaveToggle?: (jobId: string, saved: boolean) => void;
  isSaved?: boolean;
}

export default function JobCard({ job, onSaveToggle, isSaved = false }: JobCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(isSaved);
  const [savingLoading, setSavingLoading] = useState(false);
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  const analysis = job.analysis;

  const formatSalary = () => {
    if (!job.job_min_salary && !job.job_max_salary) return null;
    const currency = job.job_salary_currency || "USD";
    const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
    if (job.job_min_salary && job.job_max_salary) return `${fmt(job.job_min_salary)} – ${fmt(job.job_max_salary)}`;
    if (job.job_min_salary) return `From ${fmt(job.job_min_salary)}`;
    if (job.job_max_salary) return `Up to ${fmt(job.job_max_salary)}`;
  };

  const handleSave = async () => {
    const token = localStorage.getItem("joblens_token");
    if (!token) {
      setShowLoginMsg(true);
      setTimeout(() => setShowLoginMsg(false), 3000);
      return;
    }
    setSavingLoading(true);
    try {
      if (saved) {
        await savedAPI.remove(job.job_id);
        setSaved(false);
        onSaveToggle?.(job.job_id, false);
      } else {
        await savedAPI.save({
          job_id: job.job_id,
          job_title: job.job_title,
          company: job.employer_name,
          match_score: analysis?.match_score,
        });
        setSaved(true);
        onSaveToggle?.(job.job_id, true);
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSavingLoading(false);
    }
  };

  const salary = formatSalary();

  return (
    <div className="card p-5 hover:shadow-md transition-shadow group dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-3">
            {job.employer_logo && (
              <img src={job.employer_logo} alt={job.employer_name} className="w-10 h-10 rounded-lg object-contain border border-[var(--border-color)] flex-shrink-0 bg-white p-1" />
            )}
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${encodeURIComponent(job.job_id)}`} className="block">
                <h3 className="font-sora font-semibold text-[var(--text-main)] group-hover:text-[var(--primary-blue)] transition-colors truncate text-base">
                  {job.job_title}
                </h3>
              </Link>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{job.employer_name}</p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[var(--text-secondary)]">
            {(job.job_city || job.job_country) && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {[job.job_city, job.job_country].filter(Boolean).join(", ")}
              </span>
            )}
            {job.job_employment_type && (
              <span className="flex items-center gap-1">
                <Briefcase size={12} />
                {job.job_employment_type}
              </span>
            )}
            {salary && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <DollarSign size={12} />
                {salary}
              </span>
            )}
            {job.job_publisher && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100">
                {job.job_publisher}
              </span>
            )}
          </div>

          {/* AI Analysis */}
          {analysis && (
            <div className="mt-4 space-y-3">
              {/* Summary bullets */}
              {analysis.summary?.length > 0 && (
                <ul className="space-y-1">
                  {analysis.summary.slice(0, 3).map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="text-[var(--primary-blue)] mt-0.5 flex-shrink-0">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              )}

              {/* Skill gaps */}
              {analysis.skill_gaps?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs text-[var(--text-secondary)] flex items-center mr-1">Gaps:</span>
                  {analysis.skill_gaps.slice(0, 4).map((gap, i) => (
                    <span key={i} className="skill-gap-pill">{gap}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side: score + save */}
        <div className="flex flex-col items-end gap-3 flex-shrink-0">
          {analysis && <MatchScore score={analysis.match_score} size="md" />}
          <button
            onClick={handleSave}
            disabled={savingLoading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-[var(--text-secondary)] hover:text-[var(--primary-blue)]"
            title={saved ? "Remove from saved" : "Save job"}
          >
            {saved ? <BookmarkCheck size={18} className="text-[var(--primary-blue)]" /> : <Bookmark size={18} />}
          </button>
          {showLoginMsg && (
            <p className="text-xs text-red-500 text-right whitespace-nowrap">Please log in to save</p>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border-color)] dark:border-gray-700">
        <Link
          href={`/jobs/${encodeURIComponent(job.job_id)}`}
          className="flex items-center gap-1 text-xs font-medium text-[var(--primary-blue)] hover:text-[var(--primary-dark)] transition-colors"
        >
          View details <ChevronRight size={14} />
        </Link>
        <a
          href={job.job_apply_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 btn-primary px-3 py-1.5 text-xs"
        >
          Apply now <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
