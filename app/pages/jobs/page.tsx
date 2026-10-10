"use client";

import { useState, useMemo } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import toast from "react-hot-toast";
import { JOBS_DATA, JobOffer } from "@/app/data/jobs";
import {
    Search,
    MapPin,
    Briefcase,
    Heart,
    Clock,
    X,
    Upload,
    Layers,
    Check,
    TrendingUp,
    Award,
    DollarSign,
    ArrowRight,
    ExternalLink,
} from "lucide-react";

export default function JobsPage() {
    const [keyword, setKeyword] = useState("");
    const [locationInput, setLocationInput] = useState("");

    const [jobs, setJobs] = useState<JobOffer[]>(JOBS_DATA);
    const [applyModalJob, setApplyModalJob] = useState<JobOffer | null>(null);

    // Application form state
    const [applicantName, setApplicantName] = useState("");
    const [applicantEmail, setApplicantEmail] = useState("");
    const [applicantPhone, setApplicantPhone] = useState("");
    const [applicantExperience, setApplicantExperience] = useState("");
    const [applicantResume, setApplicantResume] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleFavorite = (id: string) => {
        setJobs((prev) =>
            prev.map((job) =>
                job.id === id ? { ...job, isLiked: !job.isLiked } : job
            )
        );
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter((job) => {
            const matchesKeyword =
                job.title.toLowerCase().includes(keyword.toLowerCase()) ||
                job.department.toLowerCase().includes(keyword.toLowerCase()) ||
                job.summary.toLowerCase().includes(keyword.toLowerCase());

            const matchesLoc =
                locationInput === "" ||
                job.location.toLowerCase().includes(locationInput.toLowerCase());

            return matchesKeyword && matchesLoc;
        });
    }, [jobs, keyword, locationInput]);

    const handleApplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!applicantName || !applicantEmail) {
            toast.error("Please provide your name and email.");
            return;
        }
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success(
                `Application submitted for ${applyModalJob?.title || "Sales Agent"}! Our team will contact you soon.`,
                { duration: 5000 }
            );
            setApplicantName("");
            setApplicantEmail("");
            setApplicantPhone("");
            setApplicantExperience("");
            setApplicantResume(null);
            setApplyModalJob(null);
        }, 1200);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-slate-900 font-sans">
            <Navbar />

            {/* Hero Section with Laptop Image Overlay & Curved Arc Bottom */}
            <section className="relative bg-[#0e1726] text-white pt-20 pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Background Image of Laptop & Office */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80"
                        alt="Sales Agent Presentation"
                        className="w-full h-full object-cover object-center opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0e1726]/90 via-[#0e1726]/85 to-[#0e1726]" />
                </div>


                <div className="relative z-10 mx-auto max-w-4xl text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-200 backdrop-blur-md mb-2">
                        <TrendingUp className="w-4 h-4 text-[#CCFF00]" />
                        <span>Build Your Career with SmartPOS Rwanda</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                        Find Your Next <br />
                        <span className="text-[#CCFF00]">Opportunity at SmartPOS</span>
                    </h1>
                    <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
                        Discover career opportunities at SmartPOS Rwanda and grow with us in technology, sales, marketing, and more.
                    </p>

                    {/* Job Search Card */}
                    <div className="pt-6 max-w-3xl mx-auto">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/40 text-slate-800 text-left">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

                                {/* Keyword Search */}
                                <div className="md:col-span-5 space-y-1 px-3 py-1">
                                    <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                                        Job Title / Keyword
                                    </label>

                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder="e.g. Developer, Sales, Marketing"
                                        className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                                    />
                                </div>

                                {/* Divider */}
                                <div className="hidden md:block md:col-span-1 border-r border-slate-200 h-8 mx-auto" />

                                {/* Location Search */}
                                <div className="md:col-span-4 space-y-1 px-3 py-1">
                                    <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                                        Location in Rwanda
                                    </label>

                                    <input
                                        type="text"
                                        value={locationInput}
                                        onChange={(e) => setLocationInput(e.target.value)}
                                        placeholder="Kigali, Huye, Musanze..."
                                        className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                                    />
                                </div>

                                {/* Find Jobs Button */}
                                <div className="md:col-span-2">
                                    <button
                                        onClick={() => {
                                            const element = document.getElementById("jobs-list-section");

                                            if (element) {
                                                element.scrollIntoView({ behavior: "smooth" });
                                            }
                                        }}
                                        className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-white font-extrabold text-xs tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <span>Find Jobs</span>
                                        <Search className="w-3.5 h-3.5 text-[#CCFF00]" />
                                    </button>
                                </div>

                            </div>
                        </div>

                        {/* Job Categories */}
                        <div className="mt-4 text-xs text-slate-300 font-medium leading-6">
                            Explore Careers:{" "}
                            <span className="text-white font-semibold">
                                Technology, Sales, Marketing, Customer Support, Business Development
                            </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-400">
                            <MapPin className="w-3.5 h-3.5 inline mr-1 text-[#CCFF00]" />
                            Opportunities across Rwanda
                        </div>
                    </div>
                </div>
                ```

                {/* Bottom Curved Arc SVG Cutout */}
                <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none z-10">
                    <svg
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                        className="relative block w-full h-16 sm:h-20 text-[#F8FAF8] fill-current"
                    >
                        <path d="M0,0 Q600,120 1200,0 L1200,120 L0,120 Z" />
                    </svg>
                </div>
            </section>

            {/* Jobs Section (Directly after Hero) */}
            <section id="jobs-list-section" className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl w-full">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Current Openings
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                        Open Sales Agent Positions
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal leading-relaxed">
                        Click on any position to view complete job details or submit an application.
                    </p>
                </div>

                {/* 2-Column Tinted Job Cards Grid */}
                {filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
                        <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-800">No Sales Roles Found</h3>
                        <p className="text-xs text-slate-400 mt-1">Try resetting your search filters.</p>
                        <button
                            onClick={() => {
                                setKeyword("");
                                setLocationInput("");
                            }}
                            className="mt-4 px-4 py-2 rounded-lg bg-black text-white text-xs font-bold"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-4 relative group"
                            >
                                {/* Left Side: Logo & Details */}
                                <div className="flex items-start gap-4 flex-1">
                                    {/* Brand Logo Box */}
                                    <div
                                        className={`w-12 h-12 rounded-2xl ${job.companyLogoBg} text-[#CCFF00] flex items-center justify-center font-extrabold text-xl shrink-0 shadow-sm`}
                                    >
                                        {job.companyLogoText}
                                    </div>

                                    <div className="space-y-1">
                                        <Link
                                            href={`/pages/jobs/${job.id}`}
                                            className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-600 transition-colors flex items-center gap-1.5 group/title"
                                        >
                                            <span>{job.title}</span>
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/title:text-emerald-600 opacity-0 group-hover/title:opacity-100 transition-opacity" />
                                        </Link>

                                        <div className="text-xs font-semibold text-slate-600">
                                            Via <span className="underline">{job.company}</span>
                                        </div>

                                        <div className="space-y-1 pt-1.5 text-xs text-slate-500 font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{job.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{job.department}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                                                <span className="font-bold text-slate-900">{job.salary}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Type Badge, Heart Icon, Posted Time */}
                                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold">
                                        {job.type}
                                    </span>

                                    <div className="flex items-center gap-3 mt-auto">
                                        <button
                                            onClick={() => toggleFavorite(job.id)}
                                            className={`p-1.5 rounded-full transition-colors ${job.isLiked ? "text-red-500" : "text-slate-300 hover:text-red-400"
                                                }`}
                                            title="Bookmark Job"
                                        >
                                            <Heart
                                                className={`w-4 h-4 ${job.isLiked ? "fill-current text-red-500" : ""}`}
                                            />
                                        </button>

                                        <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{job.postedAgo}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-3">
                                        <Link
                                            href={`/pages/jobs/${job.id}`}
                                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
                                        >
                                            Details
                                        </Link>
                                        <button
                                            onClick={() => setApplyModalJob(job)}
                                            className="px-4 py-1.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Application Form Modal */}
            {applyModalJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
                    <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative text-slate-800">
                        <button
                            onClick={() => setApplyModalJob(null)}
                            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                            Apply as Sales Agent: {applyModalJob.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-5">
                            Please complete your applicant details below.
                        </p>

                        <form onSubmit={handleApplySubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={applicantName}
                                    onChange={(e) => setApplicantName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={applicantEmail}
                                    onChange={(e) => setApplicantEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    value={applicantPhone}
                                    onChange={(e) => setApplicantPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Sales Experience / Pitch Note
                                </label>
                                <textarea
                                    rows={3}
                                    value={applicantExperience}
                                    onChange={(e) => setApplicantExperience(e.target.value)}
                                    placeholder="Briefly describe your sales background or target merchant territory..."
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-black"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Resume / CV (PDF, DOCX) *
                                </label>
                                <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50">
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
                                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                                    {applicantResume ? (
                                        <span className="text-xs font-bold text-black">{applicantResume.name}</span>
                                    ) : (
                                        <span className="text-xs text-slate-600">Click to upload resume</span>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setApplyModalJob(null)}
                                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 rounded-lg bg-black text-white text-xs font-bold hover:bg-slate-900"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Application"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}