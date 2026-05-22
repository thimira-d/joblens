"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2, Trash2, ExternalLink, Calendar, Building2, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import MatchScore from "@/components/MatchScore";
import SkillPill from "@/components/SkillPill";
import { savedAPI } from "@/lib/api";

interface SavedJob {
  id: number;
  job_id: string;
  job_title: string;
  company: string;
  match_score?: number;
  skill_gaps?: string[];
  matching_skills?: string[];
  why_good_fit?: string;
  recommendation?: string;
  job_description?: string;
  saved_type?: string;
  date_saved: string;
}

export default function SavedJobsPage() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedDesc, setExpandedDesc] = useState<Record<number, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await savedAPI.getAll();
        setSavedJobs(res.data);
      } catch {
        setError("Failed to load saved jobs. Please log in first.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRemove = async (jobId: string) => {
    try {
      await savedAPI.remove(jobId);
      setSavedJobs(prev => prev.filter(j => j.job_id !== jobId));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDesc = (id: number) => {
    setExpandedDesc(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cvMatchJobs = savedJobs.filter(j => j.saved_type === "cv_match");
  const jobSearchJobs = savedJobs.filter(j => j.saved_type !== "cv_match");

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-[#0F172A]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center">
            <Bookmark size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-sora font-bold text-2xl text-[var(--primary-dark)] dark:text-white">Saved Jobs</h1>
            <p className="text-sm text-[var(--text-secondary)]">{savedJobs.length} item{savedJobs.length !== 1 ? "s" : ""} saved</p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[var(--primary-blue)]" /></div>
        )}

        {error && (
          <div className="card p-8 text-center dark:bg-gray-800/50 dark:border-gray-700">
            <p className="text-[var(--text-secondary)] mb-4">{error}</p>
            <button onClick={() => router.push("/login")} className="btn-primary px-5 py-2 text-sm">Log in</button>
          </div>
        )}

        {!loading && !error && savedJobs.length === 0 && (
          <div className="card p-16 text-center dark:bg-gray-800/50 dark:border-gray-700">
            <Bookmark size={48} className="mx-auto text-[var(--border-color)] mb-4" />
            <h3 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-2">No saved items yet</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Save jobs or match analyses you&apos;re interested in and come back to them later.</p>
            <button onClick={() => router.push("/match")} className="btn-primary px-6 py-2.5 text-sm">Analyze your CV</button>
          </div>
        )}

        {/* CV Match Analyses */}
        {cvMatchJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-4 flex items-center gap-2">
              CV Match Analyses
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                {cvMatchJobs.length}
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cvMatchJobs.map((job) => (
                <div
                  key={job.id}
                  className="card p-5 dark:bg-gray-800/50 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400">
                          CV Match
                        </span>
                      </div>
                      <h3 className="font-sora font-semibold text-sm text-[var(--text-main)] dark:text-white leading-snug truncate">
                        {job.job_title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-secondary)]">
                        <Building2 size={12} />
                        {job.company}
                      </div>
                    </div>
                    {job.match_score !== undefined && (
                      <MatchScore score={job.match_score} size="sm" />
                    )}
                  </div>

                  {job.recommendation && (
                    <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-3 ${
                      job.recommendation === "Strong Match" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                      job.recommendation === "Possible Match" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" :
                      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                      {job.recommendation}
                    </div>
                  )}

                  {job.why_good_fit && (
                    <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2 italic">
                      &ldquo;{job.why_good_fit}&rdquo;
                    </p>
                  )}

                  {(job.matching_skills || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {job.matching_skills!.slice(0, 4).map((s, i) => (
                        <SkillPill key={i} skill={s} variant="match" />
                      ))}
                      {(job.matching_skills!.length) > 4 && (
                        <span className="text-xs text-[var(--text-secondary)]">+{job.matching_skills!.length - 4}</span>
                      )}
                    </div>
                  )}

                  {(job.skill_gaps || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.skill_gaps!.slice(0, 4).map((s, i) => (
                        <SkillPill key={i} skill={s} variant="gap" />
                      ))}
                      {(job.skill_gaps!.length) > 4 && (
                        <span className="text-xs text-[var(--text-secondary)]">+{job.skill_gaps!.length - 4}</span>
                      )}
                    </div>
                  )}

                  {job.job_description && (
                    <div className="mb-3">
                      <button
                        onClick={() => toggleDesc(job.id)}
                        className="flex items-center gap-1 text-xs text-[var(--primary-blue)] font-medium hover:underline"
                      >
                        {expandedDesc[job.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        {expandedDesc[job.id] ? "Hide" : "Show"} job description
                      </button>
                      {expandedDesc[job.id] && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-[var(--text-secondary)] max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {job.job_description}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-3">
                    <Calendar size={12} />
                    Saved {new Date(job.date_saved).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)] dark:border-gray-600">
                    <button
                      onClick={() => handleRemove(job.job_id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 py-1.5 border border-red-200 dark:border-red-800 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Job Search Saves */}
        {jobSearchJobs.length > 0 && (
          <div>
            {cvMatchJobs.length > 0 && (
              <h2 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-4">Saved Jobs</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobSearchJobs.map((job) => (
                <div
                  key={job.id}
                  className="card p-5 dark:bg-gray-800/50 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => router.push(`/jobs/${job.job_id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-sora font-semibold text-base text-[var(--text-main)] dark:text-white group-hover:text-[var(--primary-blue)] transition-colors leading-snug">
                        {job.job_title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-sm text-[var(--text-secondary)]">
                        <Building2 size={13} />
                        {job.company}
                      </div>
                    </div>
                    {job.match_score !== undefined && (
                      <MatchScore score={job.match_score} size="sm" />
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-4">
                    <Calendar size={12} />
                    Saved {new Date(job.date_saved).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-color)] dark:border-gray-600">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/jobs/${job.job_id}`); }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--primary-blue)] hover:text-[var(--primary-dark)] py-1.5 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
                    >
                      View details <ExternalLink size={11} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemove(job.job_id); }}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Remove from saved"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
