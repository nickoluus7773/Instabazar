import LegalPageTemplate from "../components/legal/LegalPageTemplate";

const sections = [
  {
    heading: "1. Platform purpose",
    body: [
      "InstaBazaar is a SaaS catalog management platform designed to help businesses organize products, maintain catalog quality, manage vendor accounts, and prepare for future marketplace integration opportunities. The platform is not a general-purpose online retail marketplace and does not itself operate physical goods fulfillment, warehousing, or shipping services.",
      "By using InstaBazaar, vendors agree that they are responsible for the accuracy, legality, and completeness of the catalog information they upload, including product details, pricing, inventory status, brand identity, and any related content used in connection with the platform.",
    ],
  },
  {
    heading: "2. Vendor responsibilities",
    body: [
      "Vendors are responsible for maintaining valid business information, keeping account credentials secure, complying with relevant laws, and ensuring that the catalog content they publish is honest, lawful, and fit for the intended audience. This includes product descriptions, pricing disclosures, category assignments, and any content used for promotional or commercial use.",
      "InstaBazaar may suspend or restrict account access where a vendor fails to meet platform standards, creates security risks, breaches applicable regulations, or interferes with the integrity or performance of the service. We may also remove or limit catalog content that is misleading, harmful, or non-compliant with platform policy.",
    ],
  },
  {
    heading: "3. Subscription and access",
    body: [
      "Access to selected InstaBazaar features may depend on the subscription plan selected by the vendor. Subscription tiers may differ in the number of products, catalog management tools, analytics visibility, automation capabilities, or support features available. We reserve the right to update feature availability, amounts, and plan descriptions in line with service improvements and product strategy.",
      "Subscription access is granted for a defined period and may be renewed on the terms presented at the time of purchase or renewal. Users are responsible for reviewing current pricing, plan terms, and renewal conditions before continuing to use premium features.",
    ],
  },
  {
    heading: "4. Intellectual property and content",
    body: [
      "InstaBazaar retains ownership of the platform, product materials, design system, software interfaces, and supporting content that form the SaaS experience. Vendors retain ownership of their business content, product assets, and brand information that they upload to the platform, subject to the rights granted to InstaBazaar to provide the service and maintain platform operations.",
      "By submitting catalog content, vendors grant InstaBazaar a limited license to host, display, organize, and support such content within the platform, including internal analytics, operational processing, and future integrations that support platform functionality.",
    ],
  },
  {
    heading: "5. Service availability and modifications",
    body: [
      "InstaBazaar aims to provide a reliable and secure platform, but service availability may be affected by maintenance, upgrades, technical interruptions, or third-party dependencies. We may modify, enhance, or discontinue features in the course of improving the platform. We will use reasonable efforts to communicate material changes where appropriate.",
      "The service is provided on an as-is basis with reasonable care, and while we aim for a high level of reliability, we do not guarantee uninterrupted operation, specific performance levels, or outcomes from customer acquisition or sales activity generated through third-party channels or integrations.",
    ],
  },
  {
    heading: "6. Limitation of liability and disputes",
    body: [
      "InstaBazaar shall not be liable for indirect, incidental, consequential, or punitive damages resulting from use of the platform or inability to access it, including loss of business opportunity, reputation damage, or disruption caused by external integrations or conditions beyond our reasonable control.",
      "These terms will be interpreted in accordance with the governing law of the jurisdiction in which the platform is operated, and disputes should first be handled through reasonable commercial resolution channels before formal legal action is pursued. We encourage vendors to contact support for issue resolution when possible.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalPageTemplate
      badge="📄 Terms & Conditions"
      title="Terms and conditions"
      intro="These terms describe the responsibilities of vendors, users, and InstaBazaar in the context of a SaaS catalog management platform built for managing product data, subscriptions, and vendor operations."
      sections={sections}
    />
  );
}
