import Card from "../ui/Card";
import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const pillars = [
  {
    title: "Mission",
    description:
      "We exist to help Instagram businesses present their offerings with clarity, confidence, and professional structure.",
  },
  {
    title: "Vision",
    description:
      "We envision a future where every small seller can scale through a single, elegant catalog management system.",
  },
];

export default function MissionVision() {
  return (
    <SectionContainer padding="py-24" className="bg-slate-50/70">
      <SectionHeading
        badge="🎯 Mission & Vision"
        title="A platform designed to"
        gradientText="elevate every vendor story"
        description="Our work is centered on giving creators and merchants the clarity they need to present products beautifully and grow with confidence."
        center={false}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {pillars.map((pillar) => (
          <Card key={pillar.title} className="p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
              {pillar.title}
            </p>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">
              {pillar.title === "Mission" ? "Make catalog growth feel effortless" : "Build the infrastructure for modern social commerce"}
            </h3>
            <p className="mt-5 text-base leading-8 text-slate-600">
              {pillar.description}
            </p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}