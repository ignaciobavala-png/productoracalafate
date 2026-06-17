import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ManifestoSection } from "@/components/ManifestoSection";
import { ProgramSection } from "@/components/ProgramSection";
import { PricingSection } from "@/components/PricingSection";
import { OnboardingPage } from "@/components/OnboardingPage";
import { Footer } from "@/components/Footer";
import { MarqueeSection } from "@/components/MarqueeSection";
import { InvitationModal } from "@/components/InvitationModal";
import type { SectionContent } from "../page";

export default async function TripPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { slug } = await params;
  const { code } = await searchParams;
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, name, slug")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!trip) notFound();

  const [{ data: contentRows }, { data: assets }] = await Promise.all([
    supabase
      .from("site_content")
      .select("section, key, value_es, value_en")
      .eq("trip_id", trip.id),
    supabase.from("site_assets").select("key, url").eq("trip_id", trip.id),
  ]);

  const contentMap: Record<string, SectionContent> = {};
  for (const row of contentRows ?? []) {
    contentMap[row.section] ??= {};
    contentMap[row.section][row.key] = { es: row.value_es, en: row.value_en };
  }

  const heroVideoUrl =
    assets?.find((a) => a.key === "hero_video")?.url || undefined;
  const manifestoPhotoUrl =
    assets?.find((a) => a.key === "manifesto_photo")?.url || undefined;

  const gallerySlots = Array.from({ length: 8 }, (_, i) => {
    const asset = (assets ?? []).find((a) => a.key === `gallery_${i + 1}`);
    return asset?.url ?? "";
  });

  return (
    <>
      <Navbar />
      <main>
        <HeroSection videoSrc={heroVideoUrl} content={contentMap.hero} />
        <MarqueeSection slots={gallerySlots} />
        <ManifestoSection photoSrc={manifestoPhotoUrl} content={contentMap.manifesto} />
        <ProgramSection content={contentMap.program} />
        <PricingSection content={contentMap.pricing} />
        <OnboardingPage tripSlug={slug} initialCode={code} />
      </main>
      <Footer content={contentMap.footer} />
      <InvitationModal tripSlug={slug} initialCode={code} />
    </>
  );
}
