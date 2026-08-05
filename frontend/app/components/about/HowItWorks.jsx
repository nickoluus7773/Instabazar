import Card from "../ui/Card";
import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const steps = [
  {
    title: "Create",
    description: "Bring product details into one workspace and structure them with clarity.",
  },
  {
    title: "Organize",
    description: "Shape catalogs, refine inventory, and prepare listings with less friction.",
  },
  {
    title: "Scale",
    description: "Move from a polished catalog to broader marketplace readiness with confidence.",
  },
];

export default function HowItWorks() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="🧭 How It Works"
        title="A simple path from"
        gradientText="catalog to growth"
        description="Every step is designed to feel calm, structured, and ready for future scale."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className="p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 text-sm font-black text-white">
              0{index + 1}
            </div>
            <h3 className="mt-6 text-2xl font-bold text-slate-900">{step.title}</h3>
            <p className="mt-4 text-base leading-8 text-slate-600">{step.description}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}