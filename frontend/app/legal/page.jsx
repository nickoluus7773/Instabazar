import SectionContainer from "../components/ui/SectionContainer";
import SectionHeading from "../components/ui/SectionHeading";

export default function LegalPage() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="⚖️ Legal"
        title="Legal information"
        gradientText="coming soon"
        description="This section is being prepared with the same polished structure as the rest of the experience."
      />
    </SectionContainer>
  );
}
