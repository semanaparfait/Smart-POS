import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";

// Where the website may send requests: itself and the SmartPOS API.
const api = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_URL ? new URL(process.env.NEXT_PUBLIC_API_URL).origin : "";
  } catch {
    return "";
  }
})();

// Where error reports go (Sentry), when it is set up.
const sentry = (() => {
  try {
    return process.env.NEXT_PUBLIC_SENTRY_DSN ? `https://${new URL(process.env.NEXT_PUBLIC_SENTRY_DSN).host}` : "";
  } catch {
    return "";
  }
})();

// What the browser may load. Fonts are bundled by next/font; pictures come from
// the API's storage (Cloudinary) and image search, so any https image is allowed.
const csp = [
  "default-src 'self'",
  // Next.js runs small inline scripts; the dev server also needs eval.
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${api} ${sentry}${dev ? " ws: http://localhost:*" : ""}`.replace(/\s+/g, " ").trim(),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Nobody can show the website inside their own page (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Browsers keep using HTTPS for this site for two years.
  ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
