"use client";

import React, { useState, useRef } from "react";
import useCompaniesStore from "@/stores/companies/companystore";
import {
  CompanyKind,
  type CompanyTypePayload,
  type CompanyTypeResponse,
} from "@/stores/companies/companyTypes";
import {
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  X,
  Copy,
  Check,
} from "lucide-react";


interface AddCompanyProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddCompany({ onSuccess, onCancel }: AddCompanyProps) {
  const addCompany = useCompaniesStore((state: any) => state.addCompany);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCompany, setCreatedCompany] = useState<CompanyTypeResponse | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    location: "",
    type: CompanyKind.RESTAURANT,
    logo: null as File | null,
  };

  const [companyData, setCompanyData] = useState(initialFormState);

  const resetForm = () => {
    setCompanyData(initialFormState);
    setLogoPreview(null);
    setCreatedCompany(null);
    setCopiedCode(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setCompanyData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setCompanyData((prev) => ({ ...prev, logo: file }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setCompanyData((prev) => ({ ...prev, logo: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleAddCompany = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const companyPayload: CompanyTypePayload = {
        name: companyData.name,
        email: companyData.email,
        phone_number: companyData.phone,
        location: companyData.location,
        type: companyData.type,
      };

      let response: CompanyTypeResponse;

      if (addCompany) {
        response = await addCompany(companyPayload);
      } else {
        // Fallback simulation matching CompanyTypeResponse
        response = {
          id: `comp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          code: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
          logo: logoPreview,
          name: companyData.name,
          email: companyData.email,
          phone_number: companyData.phone,
          location: companyData.location,
          type: companyData.type,
        };
      }

      setCreatedCompany(response);
    } catch (error) {
      console.error("Failed to add company:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto my-8 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Add Company</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a new company profile and upload its branding.
          </p>
        </div>

        <form onSubmit={handleAddCompany} className="flex flex-col gap-6">
          {/* Logo Upload Section */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Company Logo
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex items-center justify-center border-2 border-dashed rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-gray-200 bg-gray-50/60 hover:bg-gray-100/60 hover:border-gray-300"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                id="logo"
                name="logo"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFile(e.target.files[0]);
                }}
              />

              {logoPreview ? (
                <div className="relative group w-28 h-28 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                  <img
                    src={logoPreview}
                    alt="Company Logo Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLogo();
                    }}
                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium"
                  >
                    Change / Remove
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 text-gray-400 flex items-center justify-center rounded-full bg-white shadow-xs">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    Click to upload{" "}
                    <span className="font-normal text-gray-500">
                      or drag and drop
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, SVG or WEBP (up to 5MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={companyData.name}
                onChange={handleInputChange}
                placeholder="e.g. Kigali Heights Cafe"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={companyData.email}
                onChange={handleInputChange}
                placeholder="contact@company.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={companyData.phone}
                onChange={handleInputChange}
                placeholder="+250 (787) 845-162"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className="text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={companyData.location}
                onChange={handleInputChange}
                placeholder="e.g. Kigali, Rwanda"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="type" className="text-sm font-medium text-gray-700">
                Business Type
              </label>
              <select
                id="type"
                name="type"
                required
                value={companyData.type}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer capitalize"
              >
                {Object.values(CompanyKind).map((kind) => (
                  <option key={kind} value={kind}>
                    {kind.charAt(0) + kind.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all disabled:opacity-60 flex items-center gap-2"
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              )}
              {isSubmitting ? "Adding..." : "Add Company"}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {createdCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 p-6 sm:p-7">
            {/* Close Icon Button */}
            <button
              type="button"
              onClick={() => {
                setCreatedCompany(null);
                onSuccess?.();
              }}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header / Icon */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Company Registered
                </h3>
                <p className="text-xs text-gray-500">
                  Business profile successfully created and activated.
                </p>
              </div>
            </div>

            {/* Company Visual Header */}
            <div className="mt-5 flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
              {createdCompany.logo ? (
                <img
                  src={createdCompany.logo}
                  alt={createdCompany.name}
                  className="h-14 w-14 rounded-xl object-cover border border-gray-200 shadow-xs shrink-0"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white border border-gray-200 text-emerald-600 shadow-xs">
                  <Building2 className="h-7 w-7" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-semibold text-gray-900 truncate">
                  {createdCompany.name}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {createdCompany.type}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono truncate">
                    ID: {createdCompany.id}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Metadata Grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
              {/* Code with Copy Button */}
              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Hash className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-[10px] uppercase font-semibold text-gray-400">
                      Company Code
                    </span>
                    <span className="font-mono text-xs font-semibold text-gray-900 truncate block">
                      {createdCompany.code}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(createdCompany.code)}
                  title="Copy Code"
                  className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {copiedCode ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white p-2.5">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-semibold text-gray-400">
                    Email
                  </span>
                  <span className="text-xs text-gray-900 truncate block">
                    {createdCompany.email}
                  </span>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white p-2.5">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-semibold text-gray-400">
                    Phone
                  </span>
                  <span className="text-xs text-gray-900 truncate block">
                    {createdCompany.phone_number}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white p-2.5">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-semibold text-gray-400">
                    Location
                  </span>
                  <span className="text-xs text-gray-900 truncate block">
                    {createdCompany.location}
                  </span>
                </div>
              </div>

              {/* Created Date */}
              <div className="sm:col-span-2 flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white p-2.5">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <span className="block text-[10px] uppercase font-semibold text-gray-400">
                    Created At
                  </span>
                  <span className="text-xs text-gray-900">
                    {new Date(createdCompany.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Add Another
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatedCompany(null);
                  onSuccess?.();
                }}
                className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}