import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ManifestoSection } from "@/components/ManifestoSection";
import { ProgramSection } from "@/components/ProgramSection";
import { PricingSection } from "@/components/PricingSection";
import { OnboardingPage } from "@/components/OnboardingPage";
import { Footer } from "@/components/Footer";
import { InvitationModal } from "@/components/InvitationModal";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection videoSrc="https://videos.pexels.com/video-files/30772480/13162589_1920_1080_60fps.mp4" />
        <ManifestoSection />
        <ProgramSection />
        <PricingSection />
        <OnboardingPage />
      </main>
      <Footer />
      <InvitationModal />
    </>
  );
}
