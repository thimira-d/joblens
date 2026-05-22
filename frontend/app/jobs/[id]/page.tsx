"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Briefcase, DollarSign, Calendar, ExternalLink, Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import MatchScore from "@/components/MatchScore";
import { aiCache, savedAPI } from "@/lib/api";
import type { AnalyzedJob } from "@/lib/api";

const SAMPLE_JOBS: AnalyzedJob[] = [
  {
    job_id: "sample-1",
    job_title: "Junior Software Developer",
    employer_name: "TechCorp Solutions",
    job_city: "San Francisco",
    job_country: "United States",
    job_employment_type: "FULLTIME",
    job_min_salary: 70000,
    job_max_salary: 90000,
    job_salary_currency: "USD",
    job_description: "We are looking for a Junior Software Developer to join our team. You will be responsible for developing and maintaining web applications using React and Python. As part of our engineering team, you will collaborate with senior developers, participate in code reviews, and contribute to our agile development process.\n\nRequirements:\n- Experience with JavaScript/TypeScript\n- Familiarity with React or similar frameworks\n- Basic understanding of Python\n- Good communication skills\n- Strong problem-solving abilities",
    job_apply_link: "https://example.com/apply/1",
    job_publisher: "LinkedIn",
    analysis: { match_score: 85, summary: ["Strong Python skills match", "React experience aligned", "Great culture fit potential"], skill_gaps: ["Kubernetes", "AWS"], why_good_fit: "Your Python and React skills match our tech stack" },
  },
  {
    job_id: "sample-2",
    job_title: "Data Analyst Intern",
    employer_name: "Data Insights Inc",
    job_city: "New York",
    job_country: "United States",
    job_employment_type: "INTERN",
    job_min_salary: 45000,
    job_max_salary: 55000,
    job_salary_currency: "USD",
    job_description: "Join our analytics team as a Data Analyst Intern. You'll help analyze large datasets and create visualizations using SQL and Tableau. This is a great opportunity for recent graduates interested in data analytics.\n\nResponsibilities:\n- Analyze data sets and prepare reports\n- Create dashboards using Tableau\n- Write SQL queries for data extraction\n- Collaborate with cross-functional teams\n\nRequirements:\n- Currently pursuing or recently completed degree in related field\n- Basic SQL knowledge\n- Familiarity with Excel and data visualization tools",
    job_apply_link: "https://example.com/apply/2",
    job_publisher: "Indeed",
    analysis: { match_score: 72, summary: ["SQL knowledge matches", "Analytics background helpful", "Good entry point"], skill_gaps: ["Tableau", "Python"], why_good_fit: "Great opportunity for career growth in data" },
  },
  {
    job_id: "sample-3",
    job_title: "Frontend Engineer",
    employer_name: "WebStart Labs",
    job_city: "Austin",
    job_country: "United States",
    job_employment_type: "FULLTIME",
    job_min_salary: 80000,
    job_max_salary: 110000,
    job_salary_currency: "USD",
    job_description: "We're hiring a Frontend Engineer to build modern web applications using Next.js, TypeScript, and Tailwind CSS. You'll work on building responsive UIs, optimizing performance, and maintaining code quality.\n\nWhat you'll do:\n- Build user interfaces with Next.js and TypeScript\n- Implement responsive designs with Tailwind CSS\n- Collaborate with designers and backend engineers\n- Write clean, maintainable code\n\nRequirements:\n- Experience with React and Next.js\n- Strong TypeScript skills\n- Familiarity with Tailwind CSS\n- Understanding of web performance best practices",
    job_apply_link: "https://example.com/apply/3",
    job_publisher: "Glassdoor",
    analysis: { match_score: 90, summary: ["Next.js experience perfect match", "TypeScript skills highly valued", "CSS expertise aligned"], skill_gaps: ["GraphQL", "Testing"], why_good_fit: "Your skill set is exactly what we're looking for" },
  },
  {
    job_id: "sample-4",
    job_title: "Part-time QA Tester",
    employer_name: "QualityFirst",
    job_city: "Seattle",
    job_country: "United States",
    job_employment_type: "PARTTIME",
    job_min_salary: 35000,
    job_max_salary: 50000,
    job_salary_currency: "USD",
    job_description: "QualityFirst is seeking a Part-time QA Tester to help test our mobile applications and ensure the highest quality standards. This is a flexible role perfect for students or those seeking part-time work.\n\nResponsibilities:\n- Execute test cases on mobile applications\n- Report bugs and track issues in our system\n- Perform regression testing\n- Collaborate with developers on bug fixes\n\nRequirements:\n- Basic understanding of QA processes\n- Attention to detail\n- Good communication skills\n- Availability for 15-20 hours per week",
    job_apply_link: "https://example.com/apply/4",
    job_publisher: "ZipRecruiter",
    analysis: { match_score: 65, summary: ["Basic understanding sufficient", "Flexible on tools", "Training provided"], skill_gaps: ["Mobile testing", "Automation"], why_good_fit: "Perfect for someone starting their career" },
  },
  {
    job_id: "sample-5",
    job_title: "Contract Backend Developer",
    employer_name: "CloudScale Systems",
    job_city: "Boston",
    job_country: "United States",
    job_employment_type: "CONTRACTOR",
    job_min_salary: 95000,
    job_max_salary: 130000,
    job_salary_currency: "USD",
    job_description: "CloudScale is looking for a Contract Backend Developer to help build and scale our microservices architecture using Go and Kubernetes. This is a 6-month contract with potential for extension.\n\nWhat you'll do:\n- Design and implement backend services in Go\n- Work with Kubernetes for container orchestration\n- Collaborate with DevOps on infrastructure\n- Write comprehensive unit and integration tests\n\nRequirements:\n- 3+ years of backend development experience\n- Proficiency in Go or similar language\n- Experience with Kubernetes and Docker\n- Understanding of microservices patterns",
    job_apply_link: "https://example.com/apply/5",
    job_publisher: "LinkedIn",
    analysis: { match_score: 78, summary: ["Backend experience valued", "Scalability knowledge helpful", "Microservices exposure beneficial"], skill_gaps: ["Go", "Docker"], why_good_fit: "Contract role with potential for full-time conversion" },
  },
];

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [job, setJob] = useState<AnalyzedJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const decodedId = decodeURIComponent(id);
      console.log("Job ID from URL:", decodedId);

      if (decodedId.startsWith("sample-")) {
        const sampleJob = SAMPLE_JOBS.find(j => j.job_id === decodedId);
        if (sampleJob) {
          setJob(sampleJob);
          setLoading(false);
          
          const token = localStorage.getItem("joblens_token");
          if (token) {
            try {
              const savedRes = await savedAPI.getAll();
              const isSaved = savedRes.data.some(s => s.job_id === decodedId);
              setSaved(isSaved);
            } catch {}
          }
          return;
        }
      }

      const cachedJobsStr = sessionStorage.getItem("joblens_jobs");
      console.log("Cached jobs from session:", cachedJobsStr ? "exists" : "null");
      
      if (cachedJobsStr) {
        try {
          const jobs: AnalyzedJob[] = JSON.parse(cachedJobsStr);
          console.log("Jobs in cache:", jobs.length);
          if (jobs.length > 0) {
            console.log("First 3 job IDs in cache:", jobs.slice(0, 3).map(j => j.job_id));
          }
          
          const foundJob = jobs.find(j => j.job_id === decodedId || j.job_id === id);
          console.log("Looking for:", decodedId, "| Match found:", !!foundJob, "| Found job ID:", foundJob?.job_id);
          
          if (foundJob) {
            const analysis = aiCache.get(decodedId) || foundJob.analysis;
            setJob({ ...foundJob, analysis: analysis || undefined });
            setLoading(false);
            
            const token = localStorage.getItem("joblens_token");
            if (token) {
              try {
                const savedRes = await savedAPI.getAll();
                const isSaved = savedRes.data.some(s => s.job_id === decodedId || s.job_id === id);
                setSaved(isSaved);
              } catch {}
            }
            return;
          }
        } catch (e) {
          console.error("Error parsing cached jobs:", e);
        }
      }
      
      setLoading(false);
      setJob(null);
    };
    
    loadJob();
  }, [id]);

  const handleSave = async () => {
    const token = localStorage.getItem("joblens_token");
    if (!token) {
      setShowLoginMsg(true);
      setTimeout(() => setShowLoginMsg(false), 3000);
      return;
    }
    if (!job) return;
    setSaveLoading(true);
    try {
      if (saved) {
        await savedAPI.remove(job.job_id);
        setSaved(false);
      } else {
        await savedAPI.save({ job_id: job.job_id, job_title: job.job_title, company: job.employer_name, match_score: job.analysis?.match_score });
        setSaved(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaveLoading(false);
    }
  };

  const formatSalary = (job: AnalyzedJob) => {
    if (!job.job_min_salary && !job.job_max_salary) return null;
    const c = job.job_salary_currency || "USD";
    const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(n);
    if (job.job_min_salary && job.job_max_salary) return `${fmt(job.job_min_salary)} – ${fmt(job.job_max_salary)}`;
    if (job.job_min_salary) return `From ${fmt(job.job_min_salary)}`;
    if (job.job_max_salary) return `Up to ${fmt(job.job_max_salary)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] dark:bg-[#0F172A]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={32} className="animate-spin text-[var(--primary-blue)]" />
          <p className="text-[var(--text-secondary)]">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] dark:bg-[#0F172A]">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-[var(--text-secondary)]">Job not found. Please search again.</p>
          <button onClick={() => router.push("/")} className="btn-primary px-4 py-2 text-sm">
            Back to search
          </button>
        </div>
      </div>
    );
  }

  const salary = formatSalary(job);
  const analysis = job.analysis;
  const postedDate = job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-[#0F172A]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-blue)] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to results
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Job content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Header card */}
            <div className="card p-6 dark:bg-gray-800/50 dark:border-gray-700">
              <div className="flex items-start gap-4">
                {job.employer_logo && (
                  <img src={job.employer_logo} alt={job.employer_name} className="w-14 h-14 rounded-xl border border-[var(--border-color)] object-contain bg-white p-1.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <h1 className="font-sora font-bold text-2xl text-[var(--primary-dark)] dark:text-white mb-1">{job.job_title}</h1>
                  <p className="text-lg text-[var(--text-secondary)] font-medium">{job.employer_name}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-[var(--text-secondary)]">
                    {(job.job_city || job.job_country) && (
                      <span className="flex items-center gap-1.5"><MapPin size={14} /> {[job.job_city, job.job_country].filter(Boolean).join(", ")}</span>
                    )}
                    {job.job_employment_type && (
                      <span className="flex items-center gap-1.5"><Briefcase size={14} /> {job.job_employment_type}</span>
                    )}
                    {salary && (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium"><DollarSign size={14} /> {salary}</span>
                    )}
                    {postedDate && (
                      <span className="flex items-center gap-1.5"><Calendar size={14} /> {postedDate}</span>
                    )}
                  </div>
                  {job.job_publisher && (
                    <span className="mt-3 inline-block px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 text-xs rounded border border-blue-100 dark:border-blue-800">
                      via {job.job_publisher}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6 dark:bg-gray-800/50 dark:border-gray-700">
              <h2 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap text-sm">
                {job.job_description}
              </div>
            </div>
          </div>

          {/* Right: AI Analysis panel */}
          <div className="space-y-4">
            {/* AI Analysis */}
            {analysis ? (
              <div className="card p-5 dark:bg-gray-800/50 dark:border-gray-700">
                <h3 className="font-sora font-semibold text-base text-[var(--text-main)] dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-primary-gradient flex items-center justify-center text-white text-xs">AI</span>
                  AI Analysis
                </h3>

                {/* Score */}
                <div className="flex justify-center mb-4">
                  <MatchScore score={analysis.match_score} size="lg" />
                </div>

                {/* Why good fit */}
                {analysis.why_good_fit && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 mb-4">
                    <p className="text-xs font-semibold text-[var(--primary-blue)] mb-1">Why you're a good fit</p>
                    <p className="text-sm text-[var(--text-secondary)] dark:text-gray-300">{analysis.why_good_fit}</p>
                  </div>
                )}

                {/* Skill gaps */}
                {analysis.skill_gaps?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Skill Gaps</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.skill_gaps.map((gap, i) => (
                        <span key={i} className="skill-gap-pill">{gap}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary bullets */}
                {analysis.summary?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Key Highlights</p>
                    <ul className="space-y-2">
                      {analysis.summary.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)] dark:text-gray-300">
                          <span className="text-[var(--primary-blue)] flex-shrink-0 mt-1">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2 mt-4 pt-4 border-t border-[var(--border-color)] dark:border-gray-600">
                  <a
                    href={job.job_apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
                  >
                    Apply Now <ExternalLink size={14} />
                  </a>
                  <button
                    onClick={handleSave}
                    disabled={saveLoading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm border border-[var(--border-color)] dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-[var(--text-secondary)] dark:text-gray-300"
                  >
                    {saved ? <><BookmarkCheck size={14} className="text-[var(--primary-blue)]" /> Saved</> : <><Bookmark size={14} /> Save job</>}
                  </button>
                  {showLoginMsg && (
                    <p className="text-xs text-red-500 text-center">Please log in to save</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-5 dark:bg-gray-800/50 dark:border-gray-700 text-center">
                <Loader2 size={24} className="animate-spin text-[var(--primary-blue)] mx-auto mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">AI analyzing this job...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
