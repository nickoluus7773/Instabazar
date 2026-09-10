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
import Navbar from "../components/layout/Navbar";

export default function AboutPage() {
  return (
    <>
    <Navbar/>
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