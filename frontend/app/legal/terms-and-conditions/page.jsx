import SectionContainer from "../../components/ui/SectionContainer";
import SectionHeading from "../../components/ui/SectionHeading";

export default function TermsPage() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="📄 Terms"
        title="Terms and conditions"
        gradientText="coming soon"
        description="This page will present platform rules, responsibilities, and usage expectations clearly."
      />
    </SectionContainer>
  );
}
