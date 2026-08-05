import Card from "../ui/Card";
import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const features = [
  {
    title: "Catalog Management",
    description:
      "Organize product details, images, pricing, and variants in one clean catalog workspace.",
    icon: "📁",
  },
  {
    title: "Vendor Dashboard",
    description:
      "Monitor listings, vendor activity, and catalog health from a calm command center.",
    icon: "📊",
  },
  {
    title: "Analytics",
    description:
      "See what matters with simple performance signals for products and vendor operations.",
    icon: "📈",
  },
  {
    title: "Marketplace Ready",
    description:
      "Prepare your catalog for future launch across marketplaces without extra setup.",
    icon: "🛒",
  },
  {
    title: "Instagram Integration",
    description:
      "Keep product presentation aligned with Instagram workflows and visual discovery.",
    icon: "📸",
  },
  {
    title: "Inventory Tracking",
    description:
      "Track stock levels, availability, and inventory notes inside the same product system.",
    icon: "🧾",
  },
];

export default function Features() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="💡 Features"
        title="Everything your catalog needs in"
        gradientText="one elegant platform"
        description="InstaBazaar brings together product organization, inventory readiness, and Instagram-friendly presentation in a single workspace."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-2xl">
              {feature.icon}
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">{feature.title}</h3>
            <p className="mt-4 text-base leading-7 text-slate-600">{feature.description}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}
