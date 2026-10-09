"use client";

import { useState, useMemo } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import toast from "react-hot-toast";
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
} from "lucide-react";

interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyLogoBg: string;
  companyLogoText: string;
  department: string;
  location: string;
  type: "Full Time" | "Part Time" | "Freelance" | "Contract";
  salary: string;
  postedAgo: string;
  isLiked?: boolean;
  summary: string;
  responsibilities: string[];
  requirements: string[];
}

const INITIAL_JOBS: JobOffer[] = [
  {
    id: "job-1",
    title: "Post-Room Operate",
    company: "Tourt Design LTD",
    companyLogoBg: "bg-emerald-500",
    companyLogoText: "T",
    department: "Accountancy",
    location: "Wellesley Rd, London",
    type: "Freelance",
    salary: "$2,500 / mo",
    postedAgo: "1 Hr Ago",
    summary:
      "Responsible for managing incoming and outgoing merchant correspondence, invoice processing, and office administrative flows.",
    responsibilities: [
      "Process daily mail, invoices, and physical documentation for POS accounts.",
      "Maintain digital filing systems and coordinate with accounts department.",
    ],
    requirements: [
      "1+ years experience in office administration or postal operations.",
      "Basic computer literacy and organization skills.",
    ],
  },
  {
    id: "job-2",
    title: "Data Entry Specialist",
    company: "Techno Inc.",
    companyLogoBg: "bg-red-500",
    companyLogoText: "T",
    department: "Data Entry",
    location: "Street 40/A, London",
    type: "Freelance",
    salary: "$3,200 / mo",
    postedAgo: "3 Hr Ago",
    summary:
      "Accurately input restaurant menu items, pricing catalogues, and inventory databases into SmartPOS merchant backend.",
    responsibilities: [
      "Bulk upload inventory records and category databases with high accuracy.",
      "Verify data integrity and format POS menu structures.",
    ],
    requirements: [
      "Fast typing speed (60+ WPM) and high attention to detail.",
      "Familiarity with Excel / Google Sheets.",
    ],
  },
  {
    id: "job-3",
    title: "Graphic Designer",
    company: "Devon Design",
    companyLogoBg: "bg-cyan-500",
    companyLogoText: "D",
    department: "Graphics",
    location: "West Sight, USA",
    type: "Freelance",
    salary: "$4,500 / mo",
    postedAgo: "4 Hr Ago",
    summary:
      "Create captivating marketing banners, social media assets, and promotional materials for SmartPOS branding campaigns.",
    responsibilities: [
      "Design web banners, digital ad campaigns, and print collaterals.",
      "Maintain consistent brand guidelines across all customer touchpoints.",
    ],
    requirements: [
      "Proficiency in Adobe Illustrator, Photoshop, or Figma.",
      "Portfolio showcasing brand design and marketing visual graphics.",
    ],
  },
  {
    id: "job-4",
    title: "Web Developer",
    company: "MegaNews",
    companyLogoBg: "bg-purple-600",
    companyLogoText: "M",
    department: "Development",
    location: "San Francisco, California",
    type: "Freelance",
    salary: "$7,500 / mo",
    postedAgo: "5 Hr Ago",
    summary:
      "Build high-performance web applications, merchant portals, and landing pages using Next.js, React, and modern CSS.",
    responsibilities: [
      "Develop responsive UI components and interactive merchant dashboards.",
      "Optimize frontend web speed, SEO performance, and cross-browser accessibility.",
    ],
    requirements: [
      "3+ years experience with React, TypeScript, and modern CSS frameworks.",
      "Familiarity with REST APIs and state management.",
    ],
  },
  {
    id: "job-5",
    title: "Digital Marketer",
    company: "AB Marketer LTD",
    companyLogoBg: "bg-rose-500",
    companyLogoText: "A",
    department: "Marketing",
    location: "Wellesley Rd, London",
    type: "Freelance",
    salary: "$4,000 / mo",
    postedAgo: "6 Hr Ago",
    summary:
      "Plan and execute Google Ads, SEO strategies, and content marketing to drive merchant signups for SmartPOS.",
    responsibilities: [
      "Manage pay-per-click ad campaigns and track conversion metrics.",
      "Create high-converting landing page copy and newsletter campaigns.",
    ],
    requirements: [
      "2+ years experience in digital marketing or growth hacking for SaaS.",
      "Strong analytical skills with Google Analytics & Ads Manager.",
    ],
  },
  {
    id: "job-6",
    title: "UI/UX Designer",
    company: "Design Hunter",
    companyLogoBg: "bg-indigo-600",
    companyLogoText: "F",
    department: "Design",
    location: "Zoo Rd, London",
    type: "Freelance",
    salary: "$6,800 / mo",
    postedAgo: "8 Hr Ago",
    summary:
      "Craft seamless user experiences for cashier touchscreens, mobile payment terminals, and inventory dashboards.",
    responsibilities: [
      "Conduct user research with restaurant cashiers and store managers.",
      "Create interactive wireframes, user journeys, and Figma design components.",
    ],
    requirements: [
      "Strong portfolio of SaaS or mobile UI/UX designs.",
      "Experience with design systems and interactive prototyping.",
    ],
  },
];

export default function JobsPage() {
  const [keyword, setKeyword] = useState("");
  const [locationInput, setLocationInput] = useState("");

  const [jobs, setJobs] = useState<JobOffer[]>(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [applyModalJob, setApplyModalJob] = useState<JobOffer | null>(null);

  // Application form state
  const [applicantName, setApplicantName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [applicantPhone, setApplicantPhone] = useState("");
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
        job.company.toLowerCase().includes(keyword.toLowerCase()) ||
        job.department.toLowerCase().includes(keyword.toLowerCase());

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
        `Application submitted for ${applyModalJob?.title || "Position"}! We will contact you soon.`,
        { duration: 5000 }
      );
      setApplicantName("");
      setApplicantEmail("");
      setApplicantPhone("");
      setApplicantResume(null);
      setApplyModalJob(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] text-slate-800 font-sans">
      <Navbar />

      {/* Hero Section with Laptop Image Overlay & Curved Arc Bottom */}
      <section className="relative bg-[#0e1726] text-white pt-20 pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Image of Laptop & Office */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
            alt="Office workspace"
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0e1726]/90 via-[#0e1726]/85 to-[#0e1726]" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center space-y-4">
          <span className="text-xs sm:text-sm font-medium tracking-wide text-slate-300">
            Find Jobs, Employment & Career Opportunities
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Drop Resume & Get <br />
            Your Desired Job!
          </h1>

          {/* Floating White Translucent Search Bar Card */}
          <div className="pt-6 max-w-3xl mx-auto">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/40 text-slate-800 text-left">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                
                {/* Input 1: Keyword */}
                <div className="md:col-span-5 space-y-1 px-3 py-1">
                  <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Keyword:
                  </label>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Job Title"
                    className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block md:col-span-1 border-r border-slate-200 h-8 mx-auto" />

                {/* Input 2: Location */}
                <div className="md:col-span-4 space-y-1 px-3 py-1">
                  <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                    Location:
                  </label>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="City or State"
                    className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                </div>

                {/* Red Search Button */}
                <div className="md:col-span-2">
                  <button
                    onClick={() => {
                      const element = document.getElementById("jobs-list-section");
                      if (element) element.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#ff3b30] hover:bg-[#e03126] text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>FIND A JOB</span>
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

            {/* Trending Keywords line */}
            <div className="mt-4 text-xs text-slate-300 font-medium">
              Trending Keywords: <span className="text-white font-semibold">Automotive, Education, Health and Care, Engineering, IT</span>
            </div>
          </div>
        </div>

        {/* Bottom Curved Arc SVG Cutout */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none z-10">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-16 sm:h-20 text-[#F7F9FC] fill-current"
          >
            <path d="M0,0 Q600,120 1200,0 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* Jobs Section (Directly after Hero) */}
      <section id="jobs-list-section" className="py-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Jobs You May Be Interested In
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 font-normal leading-relaxed">
            Handpicked roles across top companies and growing tech departments.
          </p>
        </div>

        {/* 2-Column Tinted Job Cards Grid */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No positions found</h3>
            <p className="text-xs text-slate-400 mt-1">Try resetting your keyword or location search.</p>
            <button
              onClick={() => {
                setKeyword("");
                setLocationInput("");
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-[#ff3b30] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-[#FFF6F6] rounded-2xl p-6 border border-red-100/80 shadow-sm hover:shadow-md transition-all flex items-start justify-between gap-4 relative group"
              >
                {/* Left Side: Logo & Details */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Brand Logo Box */}
                  <div
                    className={`w-12 h-12 rounded-2xl ${job.companyLogoBg} text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-sm`}
                  >
                    {job.companyLogoText}
                  </div>

                  <div className="space-y-1">
                    <h3
                      onClick={() => setSelectedJob(job)}
                      className="text-base sm:text-lg font-bold text-slate-900 hover:text-[#ff3b30] transition-colors cursor-pointer"
                    >
                      {job.title}
                    </h3>

                    <div className="text-xs font-semibold text-[#ff3b30]">
                      Via <span className="underline">{job.company}</span>
                    </div>

                    <div className="space-y-1 pt-1 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Type Badge, Heart Icon, Posted Time */}
                <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                  <span className="px-3 py-1 rounded-full bg-white text-slate-600 border border-slate-200/80 text-[11px] font-bold shadow-2xs">
                    {job.type}
                  </span>

                  <div className="flex items-center gap-3 mt-auto">
                    <button
                      onClick={() => toggleFavorite(job.id)}
                      className={`p-1.5 rounded-full transition-colors ${
                        job.isLiked ? "text-red-500" : "text-slate-300 hover:text-red-400"
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

                  <button
                    onClick={() => setApplyModalJob(job)}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-[#ff3b30] text-white hover:bg-[#e03126] text-xs font-bold shadow-sm transition-all"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative text-slate-800">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div>
                <span className="px-3 py-1 rounded bg-red-50 text-[#ff3b30] text-xs font-bold">
                  {selectedJob.department}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-2">{selectedJob.title}</h2>
                <p className="text-xs font-bold text-[#ff3b30] mt-1">Via {selectedJob.company}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Job Overview
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">{selectedJob.summary}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Responsibilities
                </h4>
                <ul className="space-y-1 text-xs text-slate-700">
                  {selectedJob.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#ff3b30] shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const j = selectedJob;
                    setSelectedJob(null);
                    setApplyModalJob(j);
                  }}
                  className="px-5 py-2 rounded-lg bg-[#ff3b30] text-white text-xs font-bold hover:bg-[#e03126]"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Apply for {applyModalJob.title}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Submit your resume to {applyModalJob.company}.
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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#ff3b30]"
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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-[#ff3b30]"
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
                    <span className="text-xs font-bold text-[#ff3b30]">{applicantResume.name}</span>
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
                  className="px-5 py-2 rounded-lg bg-[#ff3b30] text-white text-xs font-bold hover:bg-[#e03126]"
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