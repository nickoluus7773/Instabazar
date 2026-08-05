import SectionContainer from "../../components/ui/SectionContainer";
import SectionHeading from "../../components/ui/SectionHeading";

export default function PrivacyPolicyPage() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="🔒 Privacy Policy"
        title="Privacy policy"
        gradientText="coming soon"
        description="This page will explain data collection, usage, and privacy controls for vendors and visitors."
      />
    </SectionContainer>
  );
}
