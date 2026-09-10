import Button from "../ui/Button";
import SectionContainer from "../ui/SectionContainer";

export default function FooterCTA() {
  return (
    <SectionContainer padding="py-16" className="bg-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Let’s keep the story moving
          </p>
          <h3 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">
            Ready to set your catalog up for growth?
          </h3>
        </div>
        <Button>Start Your Free Trial</Button>
      </div>
    </SectionContainer>
  );
}
