import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TopVendors from "@/components/home/TopVendors";
import CTASection from "@/components/home/CTASection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <TopVendors />
      <CTASection />
      <Footer />
    </>
  );
}
