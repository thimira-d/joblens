"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, SlidersHorizontal, Search, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import { jobsAPI, aiCache } from "@/lib/api";
import type { AnalyzedJob, UserProfile, Job, JobAnalysis } from "@/lib/api";

const SOURCES = ["LinkedIn", "Indeed", "Glassdoor", "ZipRecruiter", "Other"];
const JOB_TYPES = ["FULLTIME", "PARTTIME", "INTERN", "CONTRACTOR"];

export default function ResultsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<AnalyzedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchJobType, setSearchJobType] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setJobs([]);
    setHasSearched(true);
    setAnalyzing(false);

    try {
      const searchRes = await jobsAPI.search({
        query: searchQuery,
        skills: [],
        location: searchLocation,
        job_type: searchJobType,
      });

      const fetchedJobs: Job[] = searchRes.data;
      const jobsWithAnalysis: AnalyzedJob[] = [...fetchedJobs];

      const uncachedJobs = fetchedJobs.filter(j => !aiCache.get(j.job_id));
      const cachedJobs = fetchedJobs.filter(j => !!aiCache.get(j.job_id));

      cachedJobs.forEach((job) => {
        const cached = aiCache.get(job.job_id);
        const idx = jobsWithAnalysis.findIndex(j => j.job_id === job.job_id);
        if (idx >= 0 && cached) jobsWithAnalysis[idx] = { ...jobsWithAnalysis[idx], analysis: cached };
      });

      setJobs([...jobsWithAnalysis]);
      setLoading(false);

      if (uncachedJobs.length > 0) {
        setAnalyzing(true);
        const userProfile: UserProfile = {
          name: "Job Seeker",
          role: "",
          years_experience: 0,
          skills: [],
          location: searchLocation,
        };

        try {
          const analysisRes = await jobsAPI.analyze({ jobs: uncachedJobs, user_profile: userProfile });
          const analyses: JobAnalysis[] = analysisRes.data;

          uncachedJobs.forEach((job, i) => {
            if (analyses[i]) {
              aiCache.set(job.job_id, analyses[i]);
              const idx = jobsWithAnalysis.findIndex(j => j.job_id === job.job_id);
              if (idx >= 0) jobsWithAnalysis[idx] = { ...jobsWithAnalysis[idx], analysis: analyses[i] };
            }
          });

          const sortedJobs = [...jobsWithAnalysis].sort((a, b) => (b.analysis?.match_score || 0) - (a.analysis?.match_score || 0));
          setJobs(sortedJobs);
        } catch {
          setJobs([...jobsWithAnalysis]);
        }
      }
    } catch {
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const filteredJobs = jobs.filter(j => {
    if (selectedTypes.length && !selectedTypes.includes(j.job_employment_type || "")) return false;
    if (selectedSources.length && j.job_publisher && !selectedSources.some(s => j.job_publisher?.toLowerCase().includes(s.toLowerCase()))) return false;
    return true;
  });

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-[#0F172A]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[var(--border-color)] dark:border-gray-700 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Job title, skills, or keywords..."
                className="w-full px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Location (optional)"
              className="sm:w-48 px-4 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
            <select
              value={searchJobType}
              onChange={(e) => setSearchJobType(e.target.value)}
              className="sm:w-40 px-3 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white text-[var(--text-secondary)]"
            >
              <option value="">Any type</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="btn-primary px-6 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Search
            </button>
          </div>
        </div>

        {/* Results Header */}
        {hasSearched && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-sora font-bold text-2xl text-[var(--primary-dark)] dark:text-white">
                {loading ? "Searching jobs..." : `${filteredJobs.length} jobs found`}
              </h1>
              {analyzing && (
                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5 mt-1">
                  <Loader2 size={12} className="animate-spin text-[var(--primary-blue)]" />
                  AI is scoring your match...
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 transition-colors"
              >
                <SlidersHorizontal size={15} /> Filters
                {(selectedTypes.length + selectedSources.length) > 0 && (
                  <span className="bg-[var(--primary-blue)] text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                    {selectedTypes.length + selectedSources.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {sidebarOpen && (
            <aside className="w-56 flex-shrink-0">
              <div className="card p-4 dark:bg-gray-800/50 dark:border-gray-700 space-y-5 sticky top-20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-[var(--text-main)] dark:text-white">Filters</h3>
                  <button onClick={() => setSidebarOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-main)]"><X size={14} /></button>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Job Type</h4>
                  <div className="space-y-1.5">
                    {JOB_TYPES.map(t => (
                      <label key={t} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(t)}
                          onChange={() => toggle(selectedTypes, setSelectedTypes, t)}
                          className="rounded border-gray-300 text-[var(--primary-blue)] focus:ring-[var(--primary-blue)]"
                        />
                        <span className="text-sm text-[var(--text-secondary)] dark:text-gray-300">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Source</h4>
                  <div className="space-y-1.5">
                    {SOURCES.map(s => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(s)}
                          onChange={() => toggle(selectedSources, setSelectedSources, s)}
                          className="rounded border-gray-300 text-[var(--primary-blue)] focus:ring-[var(--primary-blue)]"
                        />
                        <span className="text-sm text-[var(--text-secondary)] dark:text-gray-300">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {(selectedTypes.length + selectedSources.length) > 0 && (
                  <button
                    onClick={() => { setSelectedTypes([]); setSelectedSources([]); }}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </aside>
          )}

          <div className="flex-1 min-w-0 space-y-4">
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 size={36} className="animate-spin text-[var(--primary-blue)]" />
                <p className="text-[var(--text-secondary)]">Searching across job platforms...</p>
              </div>
            )}

            {error && (
              <div className="card p-8 text-center dark:bg-gray-800/50 dark:border-gray-700">
                <p className="text-red-500 font-medium mb-2">Something went wrong</p>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-primary px-4 py-2 text-sm">Try again</button>
              </div>
            )}

            {!loading && !error && hasSearched && filteredJobs.length === 0 && (
              <div className="card p-12 text-center dark:bg-gray-800/50 dark:border-gray-700">
                <p className="text-[var(--text-secondary)] mb-4">No jobs found. Try adjusting your search or clearing filters.</p>
              </div>
            )}

            {!hasSearched && !loading && (
              <div className="card p-16 text-center dark:bg-gray-800/50 dark:border-gray-700">
                <Search size={48} className="mx-auto text-[var(--border-color)] mb-4" />
                <h3 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-2">Search for jobs</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-2">Enter a job title, skill, or keyword above to find real job listings from Adzuna.</p>
                <p className="text-xs text-[var(--text-secondary)]">Try: &quot;Python developer&quot;, &quot;React engineer&quot;, &quot;Data analyst&quot;</p>
              </div>
            )}

            {filteredJobs.map((job) => (
              <JobCard key={job.job_id} job={job} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
