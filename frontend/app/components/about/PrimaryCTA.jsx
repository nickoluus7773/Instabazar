import Button from "../ui/Button";
import GradientText from "../ui/GradientText";
import SectionContainer from "../ui/SectionContainer";

export default function PrimaryCTA() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-400 p-14 text-center text-white shadow-2xl shadow-orange-200/30">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/90">
          Ready to prepare your catalog
        </p>
        <h2 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
          Launch your vendor workflow with <GradientText>clarity and confidence</GradientText>
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/85">
          InstaBazaar is designed for vendors who want polished catalogs, inventory clarity, and a path toward marketplace readiness without extra complexity.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button className="min-w-[190px]">Become a Vendor</Button>
          <Button variant="secondary" className="min-w-[190px]">Explore Catalog</Button>
        </div>
      </div>
    </SectionContainer>
  );
}
