"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";
import toast from "react-hot-toast";
import { JOBS_DATA, JobOffer } from "@/app/data/jobs";
import { fieldClass, labelClass } from "@/app/components/forms";
import {
    ArrowRight,
    ArrowUpRight,
    Clock,
    Heart,
    MapPin,
    Search,
    Upload,
    X,
} from "lucide-react";

const JOB_TYPES = ["All", "Full Time", "Part Time", "Freelance", "Contract"] as const;
type TypeFilter = (typeof JOB_TYPES)[number];

const city = (location: string) => location.split(",")[0].trim();

export default function JobsPage() {
    const [keyword, setKeyword] = useState("");
    const [locationFilter, setLocationFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");

    const [jobs, setJobs] = useState<JobOffer[]>(JOBS_DATA);
    const [applyModalJob, setApplyModalJob] = useState<JobOffer | null>(null);

    // Application form state
    const [applicantName, setApplicantName] = useState("");
    const [applicantEmail, setApplicantEmail] = useState("");
    const [applicantPhone, setApplicantPhone] = useState("");
    const [applicantExperience, setApplicantExperience] = useState("");
    const [applicantResume, setApplicantResume] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Figures shown in the header are derived from the real listings
    const cities = useMemo(() => Array.from(new Set(JOBS_DATA.map((j) => city(j.location)))), []);
    const departments = useMemo(() => new Set(JOBS_DATA.map((j) => j.department)).size, []);
    const typeCounts = useMemo(() => {
        const counts: Record<string, number> = { All: JOBS_DATA.length };
        JOBS_DATA.forEach((j) => (counts[j.type] = (counts[j.type] ?? 0) + 1));
        return counts;
    }, []);

    const toggleFavorite = (id: string) => {
        setJobs((prev) =>
            prev.map((job) =>
                job.id === id ? { ...job, isLiked: !job.isLiked } : job
            )
        );
    };

    const filteredJobs = useMemo(() => {
        const kw = keyword.toLowerCase();
        return jobs.filter((job) => {
            const matchesKeyword =
                job.title.toLowerCase().includes(kw) ||
                job.department.toLowerCase().includes(kw) ||
                job.summary.toLowerCase().includes(kw);
            const matchesLoc = locationFilter === "All" || city(job.location) === locationFilter;
            const matchesType = typeFilter === "All" || job.type === typeFilter;
            return matchesKeyword && matchesLoc && matchesType;
        });
    }, [jobs, keyword, locationFilter, typeFilter]);

    const resetFilters = () => {
        setKeyword("");
        setLocationFilter("All");
        setTypeFilter("All");
    };

    // Close the apply modal with Escape
    useEffect(() => {
        if (!applyModalJob) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setApplyModalJob(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [applyModalJob]);

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
        <div className="site min-h-screen flex flex-col bg-ivory text-ink font-sans">
            <Navbar />

            <main className="flex-1">
                {/* ===== Header ===== */}
                <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-7">
                            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink/60 sm:text-xs">
                                <span className="h-2 w-2 bg-lime ring-1 ring-ink/20" aria-hidden="true" />
                                Careers at SmartPOS
                            </p>
                            <h1 className="mt-5 text-[clamp(2.5rem,5.5vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.035em]">
                                Grow with us.
                                <br />
                                <span className="underline decoration-lime decoration-[0.14em] underline-offset-[0.12em] [text-decoration-skip-ink:none]">
                                    Help businesses
                                </span>{" "}
                                thrive.
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/70">
                                Join SmartPOS Rwanda and help restaurants, shops, hotels and pharmacies run
                                smarter. Explore our open roles in sales and business development.
                            </p>
                        </div>

                        {/* Summary card (computed from the listings) */}
                        <dl className="grid grid-cols-3 divide-x divide-white/10 rounded-xl bg-ink text-white lg:col-span-5">
                            {[
                                { label: "Open roles", value: JOBS_DATA.length },
                                { label: "Cities", value: cities.length },
                                { label: "Teams", value: departments },
                            ].map((s) => (
                                <div key={s.label} className="px-5 py-6 sm:px-7 sm:py-8">
                                    <dt className="text-xs font-semibold text-white/55">{s.label}</dt>
                                    <dd className="mt-2 text-4xl font-extrabold tabular-nums tracking-tight text-lime sm:text-5xl">
                                        {String(s.value).padStart(2, "0")}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Search bar */}
                    <div className="mt-12 grid grid-cols-1 gap-2 rounded-xl bg-white p-2 ring-1 ring-inset ring-ink/10 sm:grid-cols-12">
                        <label className="flex items-center gap-3 rounded-md px-4 py-3 focus-within:bg-ivory sm:col-span-7">
                            <Search className="h-5 w-5 shrink-0 text-ink/40" aria-hidden="true" />
                            <span className="sr-only">Search jobs</span>
                            <input
                                type="search"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="Search by role or team — e.g. Sales, Business Development"
                                className="w-full bg-transparent text-sm font-semibold text-ink placeholder:font-normal placeholder:text-ink/40 focus:outline-none"
                            />
                        </label>
                        <label className="flex items-center gap-3 rounded-md px-4 py-3 focus-within:bg-ivory sm:col-span-3 sm:border-l sm:border-ink/10">
                            <MapPin className="h-5 w-5 shrink-0 text-ink/40" aria-hidden="true" />
                            <span className="sr-only">Location</span>
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full cursor-pointer bg-transparent text-sm font-semibold text-ink focus:outline-none"
                            >
                                <option value="All">All locations</option>
                                {cities.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </label>
                        <button
                            type="button"
                            onClick={() => document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth" })}
                            className="inline-flex items-center justify-center gap-2 rounded-md bg-lime px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-lime-dark sm:col-span-2"
                        >
                            Find jobs
                        </button>
                    </div>
                </section>

                {/* ===== Listings ===== */}
                <section id="open-roles" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                    <div className="flex flex-col gap-5 border-b border-ink/15 pb-6 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">Open positions</h2>
                            <p className="mt-1 text-sm text-ink/55" aria-live="polite">
                                Showing {filteredJobs.length} of {JOBS_DATA.length} roles
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by job type">
                            {JOB_TYPES.filter((t) => typeCounts[t]).map((t) => {
                                const selected = typeFilter === t;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setTypeFilter(t)}
                                        className={`rounded-md px-3.5 py-2 text-xs font-bold transition-colors ${
                                            selected ? "bg-ink text-lime" : "bg-white text-ink/70 ring-1 ring-inset ring-ink/10 hover:text-ink"
                                        }`}
                                    >
                                        {t}
                                        <span className={`ml-1.5 tabular-nums ${selected ? "text-white/60" : "text-ink/40"}`}>
                                            {typeCounts[t]}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {filteredJobs.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-white ring-1 ring-inset ring-ink/10">
                                <Search className="h-6 w-6 text-ink/40" aria-hidden="true" />
                            </div>
                            <h3 className="mt-5 text-lg font-bold">No roles match your search</h3>
                            <p className="mt-1 text-sm text-ink/55">Try a different keyword or clear the filters.</p>
                            <button
                                onClick={resetFilters}
                                className="mt-6 rounded-md bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-ink-soft"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-ink/10">
                            {filteredJobs.map((job, i) => (
                                <li key={job.id} className="group relative grid grid-cols-1 gap-4 py-7 md:grid-cols-12 md:items-center md:gap-6">
                                    {/* Hover marker */}
                                    <span
                                        aria-hidden="true"
                                        className="absolute -left-4 top-1/2 hidden h-10 w-1 -translate-y-1/2 bg-lime opacity-0 transition-opacity group-hover:opacity-100 lg:block"
                                    />

                                    {/* Title & meta */}
                                    <div className="flex items-start gap-4 md:col-span-6">
                                        <span className="hidden w-8 shrink-0 pt-1 text-xs font-bold tabular-nums text-ink/35 sm:block">
                                            {String(i + 1).padStart(2, "0")}
                                        </span>
                                        <div className="min-w-0">
                                            <Link
                                                href={`/pages/jobs/${job.id}`}
                                                className="text-lg font-extrabold leading-snug tracking-[-0.01em] decoration-lime decoration-[3px] underline-offset-4 hover:underline sm:text-xl"
                                            >
                                                {job.title}
                                            </Link>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink/60">
                                                <span>{job.department}</span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {job.location}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {job.postedAgo}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Type & pay */}
                                    <div className="flex flex-wrap items-center gap-3 sm:pl-12 md:col-span-3 md:flex-col md:items-start md:gap-1.5 md:pl-0">
                                        <span className="rounded-md bg-lime/50 px-2.5 py-1 text-xs font-bold text-ink">{job.type}</span>
                                        <span className="text-sm font-semibold text-ink">{job.salary}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 sm:pl-12 md:col-span-3 md:justify-end md:pl-0">
                                        <button
                                            onClick={() => toggleFavorite(job.id)}
                                            aria-pressed={Boolean(job.isLiked)}
                                            aria-label={job.isLiked ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
                                            className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors ${
                                                job.isLiked ? "bg-ink text-lime" : "bg-white text-ink/40 ring-1 ring-inset ring-ink/10 hover:text-ink"
                                            }`}
                                        >
                                            <Heart className={`h-4 w-4 ${job.isLiked ? "fill-current" : ""}`} aria-hidden="true" />
                                        </button>
                                        <Link
                                            href={`/pages/jobs/${job.id}`}
                                            className="inline-flex h-10 items-center rounded-md px-4 text-sm font-bold text-ink ring-1 ring-inset ring-ink/15 transition-colors hover:bg-white"
                                        >
                                            Details
                                        </Link>
                                        <button
                                            onClick={() => setApplyModalJob(job)}
                                            className="group/apply inline-flex h-10 items-center gap-1.5 rounded-md bg-ink px-4 text-sm font-bold text-white transition-colors hover:bg-ink-soft"
                                        >
                                            Apply
                                            <ArrowRight className="h-4 w-4 text-lime transition-transform group-hover/apply:translate-x-0.5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* ===== Open application band ===== */}
                <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
                    <Link
                        href="/contact"
                        className="group flex flex-col gap-6 rounded-xl bg-ink p-8 text-white transition-colors hover:bg-ink-soft sm:flex-row sm:items-center sm:justify-between sm:p-10"
                    >
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-lime">Open application</p>
                            <p className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">Don&apos;t see the right role?</p>
                            <p className="mt-2 text-white/60">Tell us about yourself and how you&apos;d like to help SmartPOS grow.</p>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-lime px-5 py-3 text-sm font-bold text-ink sm:self-auto">
                            Get in touch
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                    </Link>
                </section>
            </main>

            {/* ===== Application modal ===== */}
            {applyModalJob && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
                    onClick={(e) => e.target === e.currentTarget && setApplyModalJob(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="apply-title"
                        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white text-ink shadow-2xl sm:rounded-xl"
                    >
                        <div className="sticky top-0 z-10 bg-ink px-6 py-6 text-white sm:px-8">
                            <button
                                onClick={() => setApplyModalJob(null)}
                                aria-label="Close"
                                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md text-white/70 ring-1 ring-inset ring-white/15 hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-4 w-4" aria-hidden="true" />
                            </button>
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-lime">Apply</p>
                            <h3 id="apply-title" className="mt-2 pr-10 text-xl font-extrabold leading-snug">
                                {applyModalJob.title}
                            </h3>
                            <p className="mt-1 text-sm text-white/55">
                                {applyModalJob.location} · {applyModalJob.type}
                            </p>
                        </div>

                        <form onSubmit={handleApplySubmit} className="space-y-5 p-6 sm:p-8">
                            <div>
                                <label htmlFor="apply-name" className={labelClass}>Full name *</label>
                                <input id="apply-name" type="text" required autoComplete="name" value={applicantName}
                                    onChange={(e) => setApplicantName(e.target.value)} className={fieldClass} />
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="apply-email" className={labelClass}>Email *</label>
                                    <input id="apply-email" type="email" required autoComplete="email" value={applicantEmail}
                                        onChange={(e) => setApplicantEmail(e.target.value)} className={fieldClass} />
                                </div>
                                <div>
                                    <label htmlFor="apply-phone" className={labelClass}>Phone</label>
                                    <input id="apply-phone" type="tel" autoComplete="tel" value={applicantPhone}
                                        onChange={(e) => setApplicantPhone(e.target.value)} placeholder="+250 7XX XXX XXX" className={fieldClass} />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="apply-experience" className={labelClass}>Sales experience / pitch note</label>
                                <textarea id="apply-experience" rows={3} value={applicantExperience}
                                    onChange={(e) => setApplicantExperience(e.target.value)}
                                    placeholder="Briefly describe your sales background or the area you'd like to cover…"
                                    className={fieldClass} />
                            </div>

                            <div>
                                <span className={labelClass}>Resume / CV (PDF, DOC, DOCX)</span>
                                <label className="group relative flex cursor-pointer flex-col items-center rounded-md border-2 border-dashed border-ink/15 bg-ivory p-5 text-center transition-colors hover:border-ink focus-within:border-ink">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setApplicantResume(e.target.files[0]);
                                            }
                                        }}
                                        className="sr-only"
                                    />
                                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-ink shadow-sm transition-colors group-hover:bg-lime">
                                        <Upload className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <span className="mt-2 text-sm font-semibold">
                                        {applicantResume ? applicantResume.name : "Click to upload your resume"}
                                    </span>
                                </label>
                            </div>

                            <p className="text-xs leading-relaxed text-ink/50">
                                By applying you agree to our{" "}
                                <Link href="/terms" className="font-semibold text-ink underline underline-offset-2">Terms</Link> and{" "}
                                <Link href="/privacy" className="font-semibold text-ink underline underline-offset-2">Privacy Policy</Link>.
                            </p>

                            <div className="flex items-center justify-end gap-3 border-t border-ink/10 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setApplyModalJob(null)}
                                    className="rounded-md px-5 py-3 text-sm font-bold text-ink ring-1 ring-inset ring-ink/15 hover:bg-ivory"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 rounded-md bg-lime px-6 py-3 text-sm font-bold text-ink hover:bg-lime-dark disabled:opacity-60"
                                >
                                    {isSubmitting ? "Submitting…" : "Submit application"}
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
