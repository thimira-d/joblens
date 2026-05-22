"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, ExternalLink, BadgeCheck, Bookmark,
  Upload, FileText, X, ChevronDown, ChevronUp, CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MatchScoreCard from "@/components/MatchScoreCard";
import SkillPill from "@/components/SkillPill";
import LoginPromptModal from "@/components/LoginPromptModal";
import { matchAPI, savedAPI, userAPI } from "@/lib/api";

export default function MatchPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cvText, setCvText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [result, setResult] = useState<{
    match_score: number;
    why_good_fit: string;
    skill_gaps: string[];
    matching_skills: string[];
    summary: string[];
    recommendation: string;
  } | null>(null);

  const [cvSource, setCvSource] = useState<"upload" | "paste">("upload");
  const [cvFileName, setCvFileName] = useState("");
  const [cvExtracted, setCvExtracted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("joblens_token");
    if (token) {
      userAPI.getProfile().then((res) => {
        if (res.data.cv_text && res.data.cv_text.trim().length > 0) {
          setCvText(res.data.cv_text);
          setCvFileName("Saved CV");
          setCvExtracted(true);
        }
      }).catch(() => {});
    }
  }, []);

  const isValid = cvText.trim().length >= 50 && jobDescription.trim().length >= 50;

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setUploadError("Only PDF files are accepted");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be under 5MB");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const res = await matchAPI.uploadCVPdf(file);
      setCvText(res.cv_text);
      setCvFileName(file.name);
      setCvExtracted(true);
      setShowPreview(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setUploadError(axiosErr?.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAnalyze = async () => {
    if (!isValid) return;
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);
    try {
      const res = await matchAPI.analyze(cvText, jobDescription);
      setResult(res.data);
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    const token = localStorage.getItem("joblens_token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }
    saveAnalysis();
  };

  const saveAnalysis = async () => {
    if (!result) return;
    try {
      await savedAPI.save({
        job_id: "cv_match_" + Date.now(),
        job_title: jobDescription.substring(0, 60) || "Job Analysis",
        company: "CV Match Analysis",
        match_score: result.match_score,
        skill_gaps: result.skill_gaps,
        matching_skills: result.matching_skills,
        why_good_fit: result.why_good_fit,
        recommendation: result.recommendation,
        job_description: jobDescription,
        saved_type: "cv_match",
      });
      setSaved(true);
    } catch {
      setError("Could not save — please try again");
    }
  };

  const handleReset = () => {
    setJobDescription("");
    setResult(null);
    setError("");
    setSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearCV = () => {
    setCvText("");
    setCvFileName("");
    setCvExtracted(false);
    setResult(null);
    setJobDescription("");
    setError("");
    setSaved(false);
    setCvSource("upload");
  };

  const scoreColor = (s: number) => {
    if (s >= 80) return "text-[var(--success)]";
    if (s >= 60) return "text-[var(--primary-blue)]";
    return "text-[var(--text-secondary)]";
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-[#0F172A]">
      <Navbar />

      <LoginPromptModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--primary-blue)] transition-colors mb-8">
          <ArrowLeft size={14} /> Home
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-sora font-bold text-3xl sm:text-4xl text-[var(--primary-dark)] dark:text-white mb-3">
            CV Match Analyzer
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Upload your CV and paste any job description to see how well you match before you apply
          </p>
        </div>

        {/* CV Loaded Banner */}
        {cvText && (
          <div className="mb-6 flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <CheckCircle size={16} />
              {cvFileName === "Saved CV" ? "Saved CV loaded from your profile" : `CV loaded: ${cvFileName}`} — Ready to analyze
            </div>
            <button onClick={handleClearCV} className="text-xs text-emerald-600 dark:text-emerald-500 hover:underline font-medium">
              Clear CV
            </button>
          </div>
        )}

        {/* CV Input Section */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[var(--border-color)] dark:border-gray-700 shadow-sm p-6 mb-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setCvSource("upload")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
                cvSource === "upload"
                  ? "bg-white dark:bg-gray-700 text-[var(--primary-blue)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              }`}
            >
              <Upload size={14} /> Upload PDF
            </button>
            <button
              onClick={() => setCvSource("paste")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
                cvSource === "paste"
                  ? "bg-white dark:bg-gray-700 text-[var(--primary-blue)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              }`}
            >
              <FileText size={14} /> Paste Text
            </button>
          </div>

          {/* Upload Tab */}
          {cvSource === "upload" && (
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--border-color)] dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-[var(--primary-blue)] hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={28} className="animate-spin text-[var(--primary-blue)]" />
                    <p className="text-sm text-[var(--text-secondary)]">Extracting text from PDF...</p>
                  </div>
                ) : cvExtracted ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle size={28} className="text-[var(--success)]" />
                    <p className="text-sm font-medium text-[var(--text-main)] dark:text-white">{cvFileName}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Click to upload a different CV</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={28} className="text-[var(--text-secondary)]" />
                    <p className="text-sm font-medium text-[var(--text-main)] dark:text-white">Click to upload or drag and drop your CV</p>
                    <p className="text-xs text-[var(--text-secondary)]">PDF files only, max 5MB</p>
                  </div>
                )}
              </div>
              {uploadError && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                  {uploadError}
                </div>
              )}
              {cvExtracted && cvText && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1 text-xs text-[var(--primary-blue)] font-medium hover:underline"
                  >
                    {showPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {showPreview ? "Hide" : "Show"} extracted text preview
                  </button>
                  {showPreview && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-[var(--text-secondary)] max-h-32 overflow-y-auto whitespace-pre-wrap">
                      {cvText.substring(0, 300)}...
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Paste Tab */}
          {cvSource === "paste" && (
            <div className="relative">
              <textarea
                value={cvText}
                onChange={(e) => { setCvText(e.target.value); setCvFileName("Pasted CV"); setCvExtracted(true); }}
                placeholder="Paste your full CV text here..."
                className="w-full min-h-[220px] px-4 py-3 text-sm border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none placeholder:text-[var(--text-secondary)]"
              />
              <div className="mt-1 text-xs text-[var(--text-secondary)]">{cvText.length} characters</div>
            </div>
          )}
        </div>

        {/* Job Description */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[var(--border-color)] dark:border-gray-700 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-[var(--text-main)] dark:text-white">
              Job Description
            </label>
            {jobDescription && (
              <button
                onClick={() => { setJobDescription(""); setResult(null); setSaved(false); }}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-[var(--text-secondary)] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full min-h-[220px] px-4 py-3 text-sm border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none placeholder:text-[var(--text-secondary)]"
          />
          <div className="mt-1 text-xs text-[var(--text-secondary)]">{jobDescription.length} characters</div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!isValid || loading}
          className="w-full py-3.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-[#0A66C2] to-[#2F80ED] hover:from-[#084C95] hover:to-[#0A66C2] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze My Match"
          )}
        </button>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Match Score Card */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[var(--border-color)] dark:border-gray-700 shadow-sm p-8 flex flex-col items-center">
              <MatchScoreCard score={result.match_score} recommendation={result.recommendation} />
            </div>

            {/* Why Good Fit */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[var(--border-color)] dark:border-gray-700 shadow-sm p-6">
              <h3 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-3">
                Why You&apos;re a Good Fit
              </h3>
              <div className="p-4 rounded-lg bg-[#EFF6FF] dark:bg-blue-900/20 border-l-4 border-[#0A66C2]">
                <p className="text-sm text-[var(--text-main)] dark:text-gray-200 leading-relaxed">
                  {result.why_good_fit}
                </p>
              </div>
            </div>

            {/* Matching Skills */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[var(--border-color)] dark:border-gray-700 shadow-sm p-6">
              <h3 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-3 flex items-center gap-2">
                Your Matching Skills <BadgeCheck size={18} className="text-[var(--success)]" />
              </h3>
              <div className="flex flex-wrap gap-2">
                {(result.matching_skills || []).length > 0 ? (
                  result.matching_skills.map((skill, i) => (
                    <SkillPill key={i} skill={skill} variant="match" />
                  ))
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">No direct skill matches found</p>
                )}
              </div>
            </div>

            {/* Skills to Learn */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[var(--border-color)] dark:border-gray-700 shadow-sm p-6">
              <h3 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-3">
                Skills to Learn
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {(result.skill_gaps || []).length > 0 ? (
                  result.skill_gaps.map((skill, i) => (
                    <SkillPill key={i} skill={skill} variant="gap" />
                  ))
                ) : (
                  <p className="text-sm text-[var(--success)] font-medium">
                    Great news — no skill gaps found! You meet all requirements.
                  </p>
                )}
              </div>
              {(result.skill_gaps || []).length > 0 && (
                <p className="text-xs text-[var(--text-secondary)] mt-2">
                  These skills appear in the job description but not in your CV
                </p>
              )}
            </div>

            {/* Job Summary */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[var(--border-color)] dark:border-gray-700 shadow-sm p-6">
              <h3 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white mb-3">
                Job Summary
              </h3>
              {(result.summary || []).length > 0 ? (
                <ul className="space-y-2">
                  {result.summary.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-main)] dark:text-gray-200">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${scoreColor(result.match_score)}`} />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--text-secondary)]">No summary available</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saved}
                className={`flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  saved
                    ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 cursor-default"
                    : "border border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-900/20"
                }`}
              >
                <Bookmark size={16} />
                {saved ? "Saved ✓" : "Save This Analysis"}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl border border-[var(--border-color)] dark:border-gray-700 text-[var(--text-main)] dark:text-white font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Analyze Another Job
              </button>
              <button
                onClick={() => router.push("/results")}
                className="flex-1 py-3 rounded-xl text-[var(--text-secondary)] font-medium text-sm hover:text-[var(--primary-blue)] transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                Search Live Jobs
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  Beta
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
