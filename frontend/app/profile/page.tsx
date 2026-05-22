"use client";
import { useState, useEffect } from "react";
import { Loader2, Plus, X, Save, User, FileText, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { userAPI, authAPI } from "@/lib/api";
import type { UserProfile } from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "", role: "", years_experience: 0, skills: [], location: "", cv_text: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const [email, setEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passSaved, setPassSaved] = useState(false);
  const [passError, setPassError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await userAPI.getProfile();
        setProfile(res.data);
        setEmail(res.data.email || "");
      } catch {
        setError("Could not load profile. Please log in.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await userAPI.updateProfile(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEmail = async () => {
    setEmailSaving(true);
    setEmailSaved(false);
    setEmailError("");
    try {
      await userAPI.updateEmail(email);
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setEmailError(axiosErr?.response?.data?.detail || "Failed to update email.");
    } finally {
      setEmailSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      setPassError("Current password and new password (min 8 chars) are required.");
      return;
    }
    setPassSaving(true);
    setPassSaved(false);
    setPassError("");
    try {
      await authAPI.changePassword({ password: currentPassword, new_password: newPassword });
      setPassSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPassSaved(false), 3000);
    } catch {
      setPassError("Current password is incorrect.");
    } finally {
      setPassSaving(false);
    }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !profile.skills.includes(s)) {
      setProfile({ ...profile, skills: [...profile.skills, s] });
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] dark:bg-[#0F172A]">
        <Navbar />
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[var(--primary-blue)]" /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] dark:bg-[#0F172A]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-gradient rounded-2xl flex items-center justify-center">
            <User size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-sora font-bold text-2xl text-[var(--primary-dark)] dark:text-white">Your Profile</h1>
            <p className="text-[var(--text-secondary)] text-sm">Manage your account, CV, and preferences.</p>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}

        {/* Section 1 — Personal Info */}
        <div className="card p-6 dark:bg-gray-800/50 dark:border-gray-700 space-y-5">
          <h2 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white flex items-center gap-2">
            <User size={18} className="text-[var(--primary-blue)]" /> Personal Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Role</label>
              <input type="text" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="e.g. Frontend Developer" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Years of Experience</label>
              <input type="number" value={profile.years_experience} min={0} max={50} onChange={(e) => setProfile({ ...profile, years_experience: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1.5">Location</label>
              <input type="text" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" placeholder="e.g. New York, Remote" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {profile.skills.map((skill) => (
                <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-[var(--primary-blue)] text-sm rounded-lg">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors"><X size={12} /></button>
                </span>
              ))}
              {profile.skills.length === 0 && <p className="text-sm text-[var(--text-secondary)] italic">No skills added yet.</p>}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSkill()} placeholder="Add a skill and press Enter" className="flex-1 px-3 py-2 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white" />
              <button onClick={addSkill} className="btn-primary px-3 py-2 text-sm flex items-center gap-1"><Plus size={14} /> Add</button>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-color)] dark:border-gray-600 flex items-center gap-3">
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save</>}
            </button>
            {saved && <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Saved</p>}
          </div>
        </div>

        {/* Section 2 — Saved CV */}
        <div className="card p-6 dark:bg-gray-800/50 dark:border-gray-700 space-y-4">
          <h2 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white flex items-center gap-2">
            <FileText size={18} className="text-[var(--primary-blue)]" /> Saved CV
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">Save your CV text here. It will auto-fill on the CV Matcher page so you only need to paste job descriptions.</p>
          <textarea
            value={profile.cv_text}
            onChange={(e) => setProfile({ ...profile, cv_text: e.target.value })}
            placeholder="Paste your full CV text here..."
            className="w-full min-h-[200px] px-4 py-3 text-sm border border-[var(--border-color)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white resize-none placeholder:text-[var(--text-secondary)]"
          />
          <div className="flex items-center gap-3">
            <button onClick={handleSaveProfile} disabled={saving} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save CV</>}
            </button>
            {saved && <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> CV saved</p>}
          </div>
        </div>

        {/* Section 3 — Email */}
        <div className="card p-6 dark:bg-gray-800/50 dark:border-gray-700 space-y-4">
          <h2 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white flex items-center gap-2">
            <Mail size={18} className="text-[var(--primary-blue)]" /> Email Address
          </h2>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2.5 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              placeholder="your@email.com"
            />
            <button onClick={handleSaveEmail} disabled={emailSaving} className="btn-primary px-4 py-2.5 text-sm disabled:opacity-60">
              {emailSaving ? <Loader2 size={14} className="animate-spin" /> : "Update"}
            </button>
          </div>
          {emailError && <p className="text-sm text-red-600">{emailError}</p>}
          {emailSaved && <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Email updated</p>}
        </div>

        {/* Section 4 — Password */}
        <div className="card p-6 dark:bg-gray-800/50 dark:border-gray-700 space-y-4">
          <h2 className="font-sora font-semibold text-lg text-[var(--text-main)] dark:text-white flex items-center gap-2">
            <Lock size={18} className="text-[var(--primary-blue)]" /> Change Password
          </h2>
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full px-3 py-2.5 pr-10 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-main)]">
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                className="w-full px-3 py-2.5 pr-10 text-sm border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-main)]">
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleChangePassword} disabled={passSaving} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">
              {passSaving ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : "Change Password"}
            </button>
            {passError && <p className="text-sm text-red-600">{passError}</p>}
            {passSaved && <p className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle size={14} /> Password changed</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
