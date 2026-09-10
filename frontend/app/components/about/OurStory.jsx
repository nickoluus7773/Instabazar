import Card from "../ui/Card";
import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const timeline = [
  {
    year: "2025",
    title: "The Beginning",
    description:
      "We noticed thousands of Instagram sellers struggling to organize products and manage customer inquiries efficiently.",
  },
  {
    year: "Research",
    title: "Understanding the Problem",
    description:
      "We studied how small businesses sell through Instagram and identified the need for a centralized product catalog.",
  },
  {
    year: "Solution",
    title: "Building InstaBazaar",
    description:
      "A modern catalog management platform that helps vendors showcase products professionally and prepare for marketplace expansion.",
  },
  {
    year: "Future",
    title: "Growing Together",
    description:
      "Our vision is to connect social commerce with multiple online marketplaces while giving every small business professional tools.",
  },
];

export default function OurStory() {
  return (
    <SectionContainer padding="py-24" className="border-t border-slate-100 bg-white">
      <SectionHeading
        badge="📖 Our Story"
        title="Built Around Real"
        gradientText="Instagram Businesses"
        description="InstaBazaar wasn't created to become another online marketplace. It was built to solve real problems faced by thousands of Instagram sellers every day."
      />

      <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="space-y-10">
          {timeline.map((item) => (
            <div key={item.title} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 font-bold text-white shadow-lg">
                  ✓
                </div>
                <div className="mt-2 h-full w-px bg-gradient-to-b from-pink-300 to-orange-200"></div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">
                  {item.year}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-8 text-slate-600">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Card className="sticky top-28 p-8 lg:p-10">
          <h3 className="text-3xl font-black text-slate-900">Why We Started</h3>

          <p className="mt-6 text-base leading-8 text-slate-600">
            Thousands of small businesses use Instagram as their primary
            storefront, but managing products, inventory, customer inquiries,
            and future marketplace expansion remains difficult.
          </p>

          <p className="mt-6 text-base leading-8 text-slate-600">
            InstaBazaar bridges this gap by providing one centralized catalog
            management platform where vendors can organize products
            professionally while preparing for scalable online growth.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-6 text-center">
              <h4 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                100%
              </h4>
              <p className="mt-2 text-sm text-slate-500">Vendor Focused</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 text-center">
              <h4 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                SaaS
              </h4>
              <p className="mt-2 text-sm text-slate-500">Catalog Platform</p>
            </div>
          </div>
        </Card>
      </div>
    </SectionContainer>
  );
}
