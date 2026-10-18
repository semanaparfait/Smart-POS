/**
 * Public contact details for SmartPOS.
 *
 * TODO: fill these in with the real SmartPOS details.
 * Any field left empty ("") is hidden automatically on the website,
 * so nothing broken or fake is ever shown to visitors.
 */
export const SITE_CONTACT = {
  /** Display format, e.g. "+250 788 123 456" */
  phone: "",
  /** International digits only, no "+" or spaces, e.g. "250788123456" (used for wa.me links) */
  whatsapp: "",
  email: "",
  /** e.g. "KG 7 Ave, Kigali, Rwanda" */
  address: "",
  /** e.g. "Mon–Sat, 8:00–18:00" */
  hours: "",
};

/** Social profile URLs. Empty entries are hidden. */
export const SITE_SOCIAL = {
  facebook: "",
  twitter: "",
  linkedin: "",
  youtube: "",
};

export const whatsappLink = (message = "Hello SmartPOS, I would like to know more.") =>
  SITE_CONTACT.whatsapp
    ? `https://wa.me/${SITE_CONTACT.whatsapp}?text=${encodeURIComponent(message)}`
    : "";

export const phoneLink = () =>
  SITE_CONTACT.phone ? `tel:${SITE_CONTACT.phone.replace(/[^\d+]/g, "")}` : "";

/** Business types offered in the installation request form */
export const BUSINESS_TYPES = [
  "Restaurant",
  "Bar",
  "Hotel / Motel",
  "Supermarket",
  "Pharmacy",
  "Shop / Retail",
  "Mall / Multi-branch",
  "Other",
] as const;

/** Plans as named in the Pricing section */
export const PLANS = ["Starter", "Business", "Enterprise", "Not sure yet"] as const;

/** Topics offered on the contact form (?topic=sales pre-selects one) */
export const CONTACT_TOPICS = [
  { value: "general", label: "General question" },
  { value: "sales", label: "Sales & pricing" },
  { value: "support", label: "Support" },
  { value: "partnership", label: "Partnership" },
] as const;

/**
 * Legal details used by the Terms & Conditions and Privacy Policy pages.
 * TODO: confirm with your lawyer — use the company's registered legal name.
 */
export const SITE_LEGAL = {
  /** Registered company name, e.g. "SmartPOS Ltd" */
  companyName: "SmartPOS",
  country: "Rwanda",
  /** Update this date whenever either document changes */
  lastUpdated: "18 October 2026",
};
