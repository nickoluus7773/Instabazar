import SectionContainer from "../../components/ui/SectionContainer";
import SectionHeading from "../../components/ui/SectionHeading";

export default function CookiesPage() {
  return (
    <SectionContainer padding="py-24" className="bg-white">
      <SectionHeading
        badge="🍪 Cookies"
        title="Cookie policy"
        gradientText="in progress"
        description="This page will outline cookie usage, preferences, and management details in a clear format."
      />
    </SectionContainer>
  );
}
