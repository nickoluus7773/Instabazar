import Card from "../ui/Card";
import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const team = [
  {
    name: "Aarav Patel",
    role: "Founder & Product Lead",
    description:
      "Shapes the product vision and keeps the platform grounded in vendor needs.",
  },
  {
    name: "Neha Singh",
    role: "Lead Developer",
    description:
      "Builds the dashboard, catalog tools, and responsive experience for every screen.",
  },
  {
    name: "Mira Sharma",
    role: "Operations & Growth",
    description:
      "Connects with creators and vendors to translate feedback into useful features.",
  },
];

export default function Team() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="👥 Team"
        title="Built by a small"
        gradientText="mission-driven crew"
        description="Our team brings product, design, and vendor-focused thinking together in a single, calm launch experience."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {team.map((member) => (
          <Card key={member.name} className="p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-2xl">
              {member.name
                .split(" ")
                .map((word) => word[0])
                .join("")}
            </div>
            <h3 className="mt-6 text-2xl font-bold text-slate-900">{member.name}</h3>
            <p className="mt-2 text-sm font-semibold text-orange-500">{member.role}</p>
            <p className="mt-4 text-base leading-7 text-slate-600">{member.description}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}
