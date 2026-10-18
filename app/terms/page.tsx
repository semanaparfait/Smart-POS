import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { ContactLine, type LegalSection } from "@/app/components/LegalPage";
import { SITE_LEGAL } from "@/app/data/site";

export const metadata: Metadata = {
  title: "Terms & Conditions | SmartPOS",
  description: "The terms that apply when you use the SmartPOS website and request our services.",
};

const company = SITE_LEGAL.companyName;
const link = "font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4";

const sections: LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <>
        <p>
          These Terms &amp; Conditions apply to your use of the SmartPOS website, including the installation request,
          contact and job application forms. The website is operated by {company} (&ldquo;SmartPOS&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;).
        </p>
        <p>By using our website, you agree to these terms. If you do not agree, please do not use the website.</p>
      </>
    ),
  },
  {
    id: "services",
    title: "Our services and service agreements",
    body: (
      <>
        <p>
          SmartPOS is a point of sale and business management platform. The website describes our services and lets you
          request an installation or contact our team.
        </p>
        <p>
          The supply of SmartPOS to a business — including installation, devices, subscription plans, support and
          payment — is governed by a separate agreement between {company} and that business. If that agreement
          conflicts with these terms, the agreement applies.
        </p>
      </>
    ),
  },
  {
    id: "requests",
    title: "Installation requests and enquiries",
    body: (
      <ul>
        <li>Sending an installation request or a message does not create a contract or oblige either party to proceed.</li>
        <li>We will contact you to discuss your needs, confirm availability and agree the details before any installation.</li>
        <li>You agree that the information you provide is accurate and that you are allowed to share it, including on behalf of your business.</li>
      </ul>
    ),
  },
  {
    id: "pricing",
    title: "Pricing",
    body: (
      <p>
        Prices and plan features shown on our website are for information and may change. The price and conditions
        that apply to you are those confirmed in your agreement or quote with {company}.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Accounts and access",
    body: (
      <>
        <p>
          SmartPOS accounts are created by our team as part of setting up your business. There is no public sign-up on
          this website. If you have an account, you are responsible for:
        </p>
        <ul>
          <li>Keeping your login details confidential and not sharing them with unauthorised people.</li>
          <li>All activity that happens under your account.</li>
          <li>Telling us promptly if you suspect unauthorised access.</li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>When using our website and services, you must not:</p>
        <ul>
          <li>Break any law or regulation, or use the services for fraudulent purposes.</li>
          <li>Try to gain unauthorised access to our systems, other accounts or data.</li>
          <li>Interfere with the security or operation of the website, for example by uploading malicious code.</li>
          <li>Send false, misleading or abusive information through our forms.</li>
        </ul>
      </>
    ),
  },
  {
    id: "jobs",
    title: "Job applications",
    body: (
      <p>
        Job listings on our website are invitations to apply, not offers of employment. Any role, pay or commission is
        confirmed only in a written agreement. Information you send in an application is handled as described in our{" "}
        <Link href="/privacy" className={link}>Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: (
      <p>
        The SmartPOS name, logo, website design, text and software are owned by {company} or its licensors and are
        protected by law. You may view the website for your own information, but you may not copy, modify or reuse its
        content or branding without our written permission.
      </p>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party links and services",
    body: (
      <p>
        Our website may link to third-party services, such as WhatsApp or social media. We are not responsible for their
        content or practices, and their own terms and policies apply when you use them.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Disclaimers and liability",
    body: (
      <>
        <p>
          We work to keep the website accurate and available, but it is provided &ldquo;as is&rdquo;. We do not
          guarantee that it will always be uninterrupted, error-free or completely up to date.
        </p>
        <p>
          To the extent permitted by law, {company} is not liable for indirect or consequential loss arising from use of
          the website. Nothing in these terms limits liability that cannot be limited under the laws of Rwanda.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "Privacy",
    body: (
      <p>
        Our <Link href="/privacy" className={link}>Privacy Policy</Link> explains how we collect and use personal data
        when you use our website and services.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms from time to time. The &ldquo;Last updated&rdquo; date at the top shows when they last
        changed. Continuing to use the website after a change means you accept the updated terms.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of the Republic of Rwanda. Any dispute will be handled by the competent
        courts of Rwanda, unless the law requires otherwise.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        For questions about these terms, contact us <ContactLine />.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro={
        <p>
          Please read these terms carefully. They explain the rules for using the SmartPOS website and how requests made
          through it are handled.
        </p>
      }
      sections={sections}
      otherDoc={{ label: "Privacy Policy", href: "/privacy" }}
    />
  );
}
