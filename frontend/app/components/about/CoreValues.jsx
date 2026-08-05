import Card from "../ui/Card";
import Badge from "../ui/Badge";
import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const values = [
  {
    icon: "🌱",
    title: "Vendor First",
    description:
      "Every decision we make begins with helping Instagram businesses grow faster and manage their catalogs effortlessly.",
  },
  {
    icon: "🚀",
    title: "Innovation",
    description:
      "We build modern catalog management tools that simplify selling across social commerce and future marketplaces.",
  },
  {
    icon: "🤝",
    title: "Trust & Transparency",
    description:
      "Verified vendors, reliable product information, and honest relationships create confidence for everyone.",
  },
  {
    icon: "📈",
    title: "Continuous Growth",
    description:
      "Our mission is to help businesses evolve from Instagram stores into scalable online brands.",
  },
];

export default function CoreValues() {
  return (
    <SectionContainer className="bg-slate-50">
      <SectionHeading
        badge="🌟 Core Values"
        title="The Principles Behind"
        gradientText="InstaBazaar"
        description="These values guide every feature we build and every decision we make for our vendor community."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((value) => (
          <Card
            key={value.title}
            className="group p-8 hover:-translate-y-2 transition-all duration-300"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 flex items-center justify-center text-3xl shadow-lg">
              {value.icon}
            </div>

            <h3 className="mt-6 text-2xl font-bold text-slate-900">
              {value.title}
            </h3>

            <p className="mt-4 text-slate-600 leading-8">
              {value.description}
            </p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}