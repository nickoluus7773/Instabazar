import { Check, X } from "lucide-react";

const comparisonRows = [
  ["Product Listings", "10", "50", "Unlimited"],
  ["Analytics", "Basic", "Standard", "Advanced"],
  ["Follow Button", true, true, true],
  ["Instagram Redirect", false, true, true],
  ["Product Badges", false, true, true],
  ["AI Tools", false, false, true],
  ["Bazaar Choice Badge", false, false, true],
];

export default function FeatureComparison() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="px-6 py-5 text-sm font-semibold uppercase tracking-[0.2em]">Features</th>
              <th className="px-6 py-5 text-sm font-semibold uppercase tracking-[0.2em]">Free</th>
              <th className="px-6 py-5 text-sm font-semibold uppercase tracking-[0.2em]">Professional</th>
              <th className="px-6 py-5 text-sm font-semibold uppercase tracking-[0.2em]">Enterprise</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map(([feature, freeValue, professionalValue, enterpriseValue]) => (
              <tr key={feature} className="border-t border-slate-200">
                <td className="px-6 py-5 font-semibold text-slate-800">{feature}</td>
                <td className="px-6 py-5 text-slate-600">
                  {typeof freeValue === "boolean" ? (freeValue ? <Check className="text-emerald-600" size={18} /> : <X className="text-slate-400" size={18} />) : freeValue}
                </td>
                <td className="px-6 py-5 text-slate-600">
                  {typeof professionalValue === "boolean" ? (professionalValue ? <Check className="text-emerald-600" size={18} /> : <X className="text-slate-400" size={18} />) : professionalValue}
                </td>
                <td className="px-6 py-5 text-slate-600">
                  {typeof enterpriseValue === "boolean" ? (enterpriseValue ? <Check className="text-emerald-600" size={18} /> : <X className="text-slate-400" size={18} />) : enterpriseValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4 p-4">
        {comparisonRows.map(([feature, freeValue, professionalValue, enterpriseValue]) => (
          <div key={feature} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-base font-bold text-slate-900">{feature}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-500">Free</span>
                <span>{typeof freeValue === "boolean" ? (freeValue ? <Check className="text-emerald-600" size={18} /> : <X className="text-slate-400" size={18} />) : freeValue}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-500">Professional</span>
                <span>{typeof professionalValue === "boolean" ? (professionalValue ? <Check className="text-emerald-600" size={18} /> : <X className="text-slate-400" size={18} />) : professionalValue}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-500">Enterprise</span>
                <span>{typeof enterpriseValue === "boolean" ? (enterpriseValue ? <Check className="text-emerald-600" size={18} /> : <X className="text-slate-400" size={18} />) : enterpriseValue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
