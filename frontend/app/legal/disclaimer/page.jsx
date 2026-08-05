import SectionContainer from "../../components/ui/SectionContainer";
import SectionHeading from "../../components/ui/SectionHeading";

export default function DisclaimerPage() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="⚠️ Disclaimer"
        title="Disclaimer"
        gradientText="coming soon"
        description="This page will provide the necessary disclosures and platform limitations in a concise format."
      />
    </SectionContainer>
  );
}
