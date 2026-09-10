import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const roadmap = [
  { phase: "Phase 1", title: "Catalog foundation", description: "Polished product organization for Instagram vendors and creators." },
  { phase: "Phase 2", title: "Marketplace readiness", description: "Prepare listings and inventory for expansion across new channels." },
  { phase: "Phase 3", title: "Growth intelligence", description: "Deliver richer insights so vendors can make sharper commercial decisions." },
];

export default function Roadmap() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="🗺️ Roadmap"
        title="From a focused start"
        gradientText="to a broader platform"
        description="InstaBazaar is building a long-term foundation for modern social commerce, one milestone at a time."
      />

      <Card className="overflow-hidden p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:gap-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
              The next chapter
            </p>
            <h3 className="mt-4 text-3xl font-black text-slate-900">
              Designed to grow alongside the businesses it serves
            </h3>
            <p className="mt-5 text-base leading-8 text-slate-600">
              Our roadmap stays grounded in the everyday needs of vendors who want better tools without extra complexity.
            </p>
          </div>

          <div className="space-y-4">
            {roadmap.map((item) => (
              <div key={item.phase} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-orange-500">{item.phase}</p>
                <h4 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h4>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-200 pt-8">
          <Button>Explore the Platform</Button>
          <Button variant="secondary">Join the Waitlist</Button>
        </div>
      </Card>
    </SectionContainer>
  );
}