import { ArrowUpRight, BarChart3, Sparkles, Star } from "lucide-react";
import Card from "../ui/Card";

const benefits = [
  {
    title: "Grow Faster",
    description: "Increase catalog visibility and give your products a sharper, more premium storefront experience.",
    icon: ArrowUpRight,
  },
  {
    title: "Better Insights",
    description: "Understand which products and categories are performing best with deeper analytics and reporting.",
    icon: BarChart3,
  },
  {
    title: "AI Assistance",
    description: "Use AI-powered improvements to polish product listings and make catalog management more efficient.",
    icon: Sparkles,
  },
  {
    title: "Premium Visibility",
    description: "Unlock recognition tools that help premium vendors stand out with Bazaar Choice style visibility benefits.",
    icon: Star,
  },
];

export default function BenefitCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {benefits.map(({ title, description, icon: Icon }) => (
        <Card key={title} className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 via-orange-50 to-yellow-100 text-pink-600">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
          <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
        </Card>
      ))}
    </div>
  );
}
