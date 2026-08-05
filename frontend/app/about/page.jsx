import {
  AboutHero,
  Features,
  FAQ,
  FooterCTA,
  HowItWorks,
  MissionVision,
  OurStory,
  PlatformStats,
  PrimaryCTA,
  Roadmap,
  Team,
  WhyChooseUs,
  CoreValues,
} from "../components/about";

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <OurStory />
      <MissionVision />
      <CoreValues />
      <Features />
      <PlatformStats />
      <WhyChooseUs />
      <HowItWorks />
      <Roadmap />
      <Team />
      <FAQ />
      <PrimaryCTA />
      <FooterCTA />
    </>
  );
}