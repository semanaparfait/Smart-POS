import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { ContactLine, type LegalSection } from "@/app/components/LegalPage";
import { SITE_CONTACT, SITE_LEGAL } from "@/app/data/site";

export const metadata: Metadata = {
  title: "Privacy Policy | SmartPOS",
  description: "How SmartPOS collects, uses and protects personal data, and the rights you have over your information.",
};

const company = SITE_LEGAL.companyName;
const link = "font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4";

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {company} (&ldquo;SmartPOS&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) provides a point of sale and business
          management platform for businesses in {SITE_LEGAL.country}. For the personal data described in this policy,
          we act as the data controller.
          {SITE_CONTACT.address && <> Our address is {SITE_CONTACT.address}.</>}
        </p>
        <p>
          We process personal data in line with Law No. 058/2021 of 13/10/2021 relating to the protection of personal
          data and privacy, and other applicable laws of Rwanda.
        </p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    title: "Information we collect",
    body: (
      <>
        <p>We only collect the information you choose to give us and what is needed to run our website and services:</p>
        <ul>
          <li>
            <strong>Installation requests:</strong> business name, type of business, location, number of branches,
            plan of interest, contact person&apos;s name, phone number, and optionally email, preferred installation date
            and any notes you add.
          </li>
          <li>
            <strong>Contact messages:</strong> your name, email, optional phone number, the topic you choose and your
            message.
          </li>
          <li>
            <strong>Job applications:</strong> your name, email, optional phone number, your experience note and the
            resume / CV you upload.
          </li>
          <li>
            <strong>Account and login data:</strong> for customers using SmartPOS, your email, password and
            information about the device used to sign in.
          </li>
          <li>
            <strong>Technical data:</strong> basic information your browser sends when you visit our website, such as
            your IP address, browser type and pages requested, which our servers may record for security and
            troubleshooting.
          </li>
        </ul>
        <p>
          Business data that customers enter into the SmartPOS platform (such as sales, products, stock and staff
          records) is processed to provide the service, under the agreement we have with that customer.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use",
    title: "How we use your information",
    body: (
      <ul>
        <li>To respond to your installation request, contact you and set up SmartPOS for your business.</li>
        <li>To answer your questions and provide support.</li>
        <li>To review job applications and contact candidates.</li>
        <li>To provide, secure and maintain your SmartPOS account and the platform.</li>
        <li>To keep our website and services secure, and to detect and prevent misuse.</li>
        <li>To meet our legal and accounting obligations.</li>
      </ul>
    ),
  },
  {
    id: "legal-basis",
    title: "Why we are allowed to use it",
    body: (
      <>
        <p>We process personal data only where the law allows us to, in particular:</p>
        <ul>
          <li><strong>Your consent</strong> — for example when you send us a form. You can withdraw it at any time.</li>
          <li><strong>A contract</strong> — to take steps you ask for before signing up, and to provide the service to customers.</li>
          <li><strong>Legal obligations</strong> — for example tax and accounting records.</li>
          <li><strong>Legitimate interests</strong> — such as keeping our services secure, where these are not overridden by your rights.</li>
        </ul>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>We do not sell your personal data. We only share it when necessary:</p>
        <ul>
          <li>With service providers that help us run our services (for example hosting and IT providers), who may only use it on our instructions.</li>
          <li>With authorities, when required by law or to protect our rights, users or the public.</li>
          <li>With a buyer or successor if our business is reorganised, subject to this policy.</li>
        </ul>
        <p>
          If you contact us through WhatsApp or another third-party service, that service&apos;s own privacy policy also
          applies. If personal data is transferred outside Rwanda, we do so only as permitted by Law No. 058/2021.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    title: "Cookies and browser storage",
    body: (
      <p>
        Our website does not use advertising or tracking cookies. When you sign in to SmartPOS, we store a sign-in token
        in your browser&apos;s local storage so you stay signed in. You can remove it at any time by signing out or
        clearing your browser data.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep personal data only for as long as needed for the purposes described in this policy — for example while
        we handle your request, during our relationship with you, or for the period required by law. When it is no
        longer needed, we delete or anonymise it.
      </p>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>
        We use appropriate technical and organisational measures to protect personal data against loss, misuse and
        unauthorised access, such as access controls and encrypted connections. No system is completely secure, so we
        also ask you to keep your login details private.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>Under Rwandan data protection law, you have the right to:</p>
        <ul>
          <li>Be informed about how your personal data is used.</li>
          <li>Access the personal data we hold about you.</li>
          <li>Ask us to correct inaccurate or incomplete data.</li>
          <li>Ask us to delete your data, where the law allows.</li>
          <li>Object to or ask us to restrict certain processing.</li>
          <li>Receive your data in a usable format and have it transferred, where applicable.</li>
          <li>Withdraw your consent at any time, without affecting earlier processing.</li>
        </ul>
        <p>
          To use any of these rights, contact us <ContactLine />. You can also lodge a complaint with the National
          Cyber Security Authority (NCSA), the supervisory authority for personal data protection in Rwanda.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Our website and services are intended for businesses and adults. We do not knowingly collect personal data from
        children. If you believe a child has sent us personal data, please contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top shows when it last
        changed. Significant changes will be highlighted on our website.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <p>
        For any question about this policy or your personal data, contact us <ContactLine />. Please also read our{" "}
        <Link href="/terms" className={link}>Terms &amp; Conditions</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro={
        <p>
          Your trust matters to us. This policy explains what personal data SmartPOS collects through our website and
          services, why we collect it, and the choices and rights you have.
        </p>
      }
      sections={sections}
      otherDoc={{ label: "Terms & Conditions", href: "/terms" }}
    />
  );
}
