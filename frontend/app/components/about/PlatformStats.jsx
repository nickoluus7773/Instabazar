import Card from "../ui/Card";
import SectionContainer from "../ui/SectionContainer";
import SectionHeading from "../ui/SectionHeading";

const stats = [
  { value: "3x", label: "Faster catalog preparation" },
  { value: "24/7", label: "Vendor operations visibility" },
  { value: "100%", label: "Focused on small business growth" },
  { value: "1", label: "Central dashboard for everything" },
];

export default function PlatformStats() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="📈 Platform Stats"
        title="Built for momentum"
        gradientText="from day one"
        description="The experience is designed to make product organization feel lighter, faster, and more professional for every vendor."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-8 text-center">
            <h3 className="text-4xl font-black bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              {stat.value}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{stat.label}</p>
          </Card>
        ))}
      </div>
    </SectionContainer>
  );
}