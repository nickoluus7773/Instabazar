import Card from "../ui/Card";
import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const reasons = [
  {
    title: "Professional presentation",
    description: "Turn scattered product details into polished catalogs that feel ready for growth.",
  },
  {
    title: "Operational clarity",
    description: "Keep inventory, listings, and vendor activity organized without spreadsheet fatigue.",
  },
  {
    title: "Future-ready workflow",
    description: "Prepare for marketplace expansion with a system that scales as your business evolves.",
  },
  {
    title: "Simple collaboration",
    description: "Give teams a calm, shared workspace built around the tools they actually need.",
  },
];

export default function WhyChooseUs() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <SectionHeading
          badge="✨ Why Choose InstaBazaar"
          title="A better way to"
          gradientText="manage growth"
          description="The platform combines product organization, presentation, and preparation into one experience designed for modern vendors."
          center={false}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {reasons.map((reason) => (
            <Card key={reason.title} className="p-8">
              <h3 className="text-xl font-bold text-slate-900">{reason.title}</h3>
              <p className="mt-4 text-base leading-7 text-slate-600">{reason.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}