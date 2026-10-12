import LegalPageTemplate from "../components/legal/LegalPageTemplate";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/home/Footer";

const sections = [
  {
    heading: "1. Information we collect",
    body: [
      "InstaBazaar collects the information needed to operate a modern vendor catalog platform securely and effectively. This includes account details such as your name, email address, phone number, business information, vendor profile data, and authentication identifiers used to manage your access.",
      "We also process catalog information that vendors provide to publish products, organize categories, set pricing, track SKU information, and manage inventory visibility across Instagram-based sales workflows. In analytics contexts, we may collect usage data such as page views, feature activity, conversion events, and dashboard interactions to improve platform quality and help vendors understand performance trends.",
    ],
  },
  {
    heading: "2. How we use information",
    body: [
      "We use information to create and manage vendor accounts, power product management workflows, deliver subscription features, support analytics dashboards, and maintain the operational integrity of the platform. This includes account administration, catalog validation, customer support, product performance insights, and the presentation of relevant recommendations or growth metrics.",
      "For vendor businesses, information is also used to support account security, onboarding, verification, marketplace integration readiness, and the management of catalogs and product listings across future commerce channels. We do not sell personal information to third parties for direct marketing purposes.",
    ],
  },
  {
    heading: "3. Cookies and analytics",
    body: [
      "InstaBazaar uses cookies and similar technologies to remember user preferences, support secure login sessions, measure product and page engagement, and understand how visitors and vendors use the platform. These tools help us improve user experience, monitor performance, and identify friction points in the onboarding and catalog workflow.",
      "Analytics may include aggregated traffic, page performance, event tracking, feature usage, and vendor dashboard statistics. We use this information to improve reliability, optimize workflows, and provide more relevant platform insights. Cookie preferences may be managed through your browser settings at any time.",
    ],
  },
  {
    heading: "4. Vendor and business data",
    body: [
      "Vendor accounts may include brand information, product content, pricing details, company data, social media identifiers, and catalog structure required to manage listings. We treat this information as business data needed to operate the SaaS catalog management service and to enable platform features such as analytics, product organization, and future marketplace expansion.",
      "Where vendors integrate third-party tools, social channels, or future marketplace connectors, we may process limited metadata needed to support these integrations. We require reasonable safeguards for transmission, access, and storage in accordance with the security practices described in this policy.",
    ],
  },
  {
    heading: "5. Data retention and security",
    body: [
      "We retain personal and business information only for as long as necessary to provide the platform, fulfill legal obligations, resolve disputes, and improve service quality. Account data may be retained during active subscription periods and for a reasonable period afterward, unless a user requests deletion in accordance with applicable rights or legal requirements.",
      "InstaBazaar uses industry-appropriate administrative, technical, and organizational safeguards to protect user information from unauthorized access, misuse, or loss. These safeguards include access controls, secure infrastructure practices, encryption in transit where applicable, and review of internal workflows. No system is completely risk-free, but we continuously work to reduce exposure and improve resilience.",
    ],
  },
  {
    heading: "6. Your rights and controls",
    body: [
      "Users may be able to update profile details, manage account preferences, and review product or catalog information directly within the platform. Vendors can manage the content they share, update business information, and request support for account-related adjustments. Where legally applicable, you may be entitled to access, correct, delete, or restrict certain personal data processed by InstaBazaar.",
      "For privacy questions or account-related requests, contact the support team at support@instabazaar.com. We will respond in a timely manner and work to resolve legitimate concerns in accordance with applicable privacy law and platform policy.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <Navbar />
      <LegalPageTemplate
      badge="🔒 Privacy Policy"
      title="Privacy policy"
      intro="This policy explains how InstaBazaar handles user, vendor, and platform data for catalog management, subscription operations, analytics, and future commerce integrations."
        sections={sections}
      />
      <Footer />
    </main>
  );
}
