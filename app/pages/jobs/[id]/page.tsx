"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import toast from "react-hot-toast";
import { getJobById, JOBS_DATA } from "@/app/data/jobs";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  ChevronLeft,
  Upload,
  Check,
  Award,
  Layers,
  Sparkles,
  Share2,
  ArrowRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const job = getJobById(jobId) || JOBS_DATA[0]; // fallback to first job if direct match or default

  // Application form states
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
  const [applicantExperience, setApplicantExperience] = useState("");
  const [applicantResume, setApplicantResume] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !applicantEmail) {
      toast.error("Please provide your name and email address.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Application submitted successfully for ${job.title}! Our team will review your application and contact you soon.`,
        { duration: 6000 }
      );
      setApplicantName("");
      setApplicantEmail("");
      setApplicantPhone("");
      setApplicantExperience("");
      setApplicantResume(null);
    }, 1200);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard!");
    } else {
      toast("Link ready: " + window.location.href);
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-slate-900 font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold">Position Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">The job position you are looking for may have expired or moved.</p>
          <Link
            href="/pages/jobs"
            className="mt-6 px-6 py-2.5 rounded-xl bg-black text-white text-xs font-bold"
          >
            Back to All Open Jobs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-slate-900 font-sans">
      <Navbar />

      {/* Top Header / Breadcrumbs */}
      <section className="bg-[#0e1726] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Back button link */}
          <Link
            href="/pages/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-[#CCFF00] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Job Offers</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-white/10 text-[#CCFF00] text-xs font-bold backdrop-blur-md">
                  {job.department}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-md">
                  {job.type}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Posted {job.postedAgo}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {job.title}
              </h1>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-white">
                  <Building2 className="w-4 h-4 text-[#CCFF00]" /> {job.company}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[#CCFF00] font-bold">
                  <DollarSign className="w-4 h-4" /> {job.salary}
                </span>
              </div>
            </div>

            {/* Quick Action Header Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleShare}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Share Job"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <a
                href="#application-form"
                className="px-6 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-extrabold text-xs tracking-wider uppercase shadow-lg transition-all flex items-center gap-1.5"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Job Details & Application Form */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Role Summary Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Role Overview
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                {job.summary}
              </p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Key Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements & Qualifications */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                Agent Requirements & Qualifications
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Benefits & Perks (if available) */}
            {job.benefits && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
                  What We Offer
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {job.benefits.map((ben, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800">{ben}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inline Application Form */}
            <div id="application-form" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full bg-black text-[#CCFF00] text-xs font-bold">
                  Direct Application
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Apply for {job.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Complete the form below to submit your application directly to the SmartPOS hiring team.
                </p>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Sales Background & Pitch Note
                  </label>
                  <textarea
                    rows={3}
                    value={applicantExperience}
                    onChange={(e) => setApplicantExperience(e.target.value)}
                    placeholder="Briefly describe your sales experience or target merchant area..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Upload Resume / CV (PDF, DOCX) *
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-black rounded-2xl p-6 text-center bg-slate-50 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setApplicantResume(e.target.files[0]);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-7 h-7 text-slate-400 group-hover:text-black mx-auto mb-2 transition-colors" />
                    {applicantResume ? (
                      <span className="text-xs font-bold text-black">{applicantResume.name}</span>
                    ) : (
                      <div>
                        <span className="text-xs font-bold text-slate-700">Click to upload resume</span>{" "}
                        <span className="text-xs text-slate-400">or drag and drop</span>
                        <p className="text-[10px] text-slate-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-black hover:bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <ArrowRight className="w-4 h-4 text-[#CCFF00]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right Column: Job Overview Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-6 sticky top-28">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Job Overview
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Company
                    </span>
                    <span className="text-xs font-bold text-slate-800">{job.company}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Location
                    </span>
                    <span className="text-xs font-bold text-slate-800">{job.location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Employment Type
                    </span>
                    <span className="text-xs font-bold text-slate-800">{job.type}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Department
                    </span>
                    <span className="text-xs font-bold text-slate-800">{job.department}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Compensation
                    </span>
                    <span className="text-xs font-bold text-slate-900">{job.salary}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <a
                  href="#application-form"
                  className="w-full block text-center py-3 rounded-xl bg-black hover:bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase shadow-sm transition-colors"
                >
                  Apply Now
                </a>

                <button
                  onClick={handleShare}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Job Offer</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}