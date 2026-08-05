import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const faqs = [
  {
    question: "What is InstaBazaar?",
    answer:
      "InstaBazaar is a catalog management platform for Instagram vendors. It helps organize products, inventory, and marketplace readiness without becoming a marketplace itself.",
  },
  {
    question: "Who can use it?",
    answer:
      "Instagram vendors, creators, and small shops that want a polished store catalog and better product workflows can use InstaBazaar.",
  },
  {
    question: "Is it a marketplace?",
    answer:
      "No. InstaBazaar is a SaaS tool for catalog and inventory management, not a platform for buying and selling between multiple vendors.",
  },
  {
    question: "How does catalog management work?",
    answer:
      "You add products, organize them into categories, update images and descriptions, and keep everything ready for future marketplace or direct sales channels.",
  },
  {
    question: "Can vendors connect marketplaces later?",
    answer:
      "Yes. The platform is designed to prepare catalogs and inventory so vendors can expand to marketplaces later with less friction.",
  },
  {
    question: "Is inventory managed?",
    answer:
      "Inventory tracking is built into the catalog experience so vendors can monitor stock, availability, and product readiness from one place.",
  },
];

export default function FAQ() {
  return (
    <SectionContainer padding="py-24" className="bg-slate-50/70">
      <SectionHeading
        badge="❓ FAQ"
        title="Questions vendors ask most often about"
        gradientText="InstaBazaar"
        description="Clear answers for founders and creators who want a smoother catalog workflow without marketplace complexity."
      />

      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-300"
          >
            <summary className="list-none cursor-pointer text-lg font-semibold text-slate-900">
              {faq.question}
            </summary>
            <p className="mt-4 text-base leading-7 text-slate-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </SectionContainer>
  );
}
