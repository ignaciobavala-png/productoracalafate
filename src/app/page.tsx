import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ManifestoSection } from "@/components/ManifestoSection";
import { ProgramSection } from "@/components/ProgramSection";
import { PricingSection } from "@/components/PricingSection";
import { OnboardingPage } from "@/components/OnboardingPage";
import { Footer } from "@/components/Footer";
import { InvitationModal } from "@/components/InvitationModal";

export type SectionContent = Record<string, { es: string; en: string }>;

export default async function Home() {
  const supabase = await createClient();

  const [{ data: contentRows }, { data: assets }] = await Promise.all([
    supabase.from("site_content").select("section, key, value_es, value_en"),
    supabase.from("site_assets").select("key, url"),
  ]);

  const contentMap: Record<string, SectionContent> = {};
  for (const row of contentRows ?? []) {
    contentMap[row.section] ??= {};
    contentMap[row.section][row.key] = { es: row.value_es, en: row.value_en };
  }

  const heroVideoUrl =
    assets?.find((a) => a.key === "hero_video")?.url ??
    "https://videos.pexels.com/video-files/30772480/13162589_1920_1080_60fps.mp4";

  return (
    <>
      <Navbar />
      <main>
        <HeroSection videoSrc={heroVideoUrl} content={contentMap.hero} />
        <ManifestoSection content={contentMap.manifesto} />
        <ProgramSection content={contentMap.program} />
        <PricingSection content={contentMap.pricing} />
        <OnboardingPage />
      </main>
      <Footer content={contentMap.footer} />
      <InvitationModal />
    </>
  );
}
