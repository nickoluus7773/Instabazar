import { ArrowRight, Check, Sparkles } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Card from "../ui/Card";

export default function PricingCard({ plan, isPopular = false, billingMode = "monthly" }) {
  const displayPrice = billingMode === "yearly" ? plan.yearlyPrice ?? plan.monthlyPrice : plan.monthlyPrice;

  return (
    <Card
      className={`relative p-8 ${
        isPopular
          ? "border-pink-300 shadow-[0_30px_80px_-35px_rgba(236,72,153,0.7)]"
          : ""
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="border-transparent bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 text-white">
            <Sparkles className="h-4 w-4" />
            Most Popular
          </Badge>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
        {isPopular && (
          <span className="rounded-full bg-pink-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-pink-600">
            Popular
          </span>
        )}
      </div>

      <p className="mt-4 text-slate-600">{plan.description}</p>

      <div className="mt-8 flex items-end gap-2">
        <span className="text-5xl font-black text-slate-900">
          {typeof displayPrice === "number" ? `₹${displayPrice}` : displayPrice}
        </span>
        {displayPrice !== "Free" && (
          <span className="pb-2 text-sm text-slate-500">
            /{billingMode === "yearly" ? "mo billed yearly" : "month"}
          </span>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {plan.features.map((feature) => (
          <div key={feature.text} className="flex items-start gap-3 text-slate-700">
            <span
              className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                feature.included ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
              }`}
            >
              {feature.included ? <Check size={14} /> : <span className="text-xs font-bold">×</span>}
            </span>
            <span>{feature.text}</span>
          </div>
        ))}
      </div>

      <Button
        href={plan.ctaHref}
        variant={isPopular ? "primary" : "dark"}
        className="mt-8 w-full shrink-0"
      >
        {plan.cta}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  );
}
