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

  const [{ data: contentRows }, { data: assets }, { data: programItems }] = await Promise.all([
    supabase
      .from("site_content")
      .select("section, key, value_es, value_en")
      .eq("trip_id", trip.id),
    supabase.from("site_assets").select("key, url").eq("trip_id", trip.id),
    supabase
      .from("program_items")
      .select("id, day_number, day_label_es, day_label_en, day_subtitle_es, day_subtitle_en, day_photo_url, title_es, title_en, description_es, description_en, sort_order")
      .eq("trip_id", trip.id)
      .order("day_number")
      .order("sort_order"),
  ]);

  const contentMap: Record<string, SectionContent> = {};
  for (const row of contentRows ?? []) {
    contentMap[row.section] ??= {};
    contentMap[row.section][row.key] = { es: row.value_es, en: row.value_en };
  }

  const heroMediaUrl =
    assets?.find((a) => a.key === "hero_video")?.url || undefined;
  const manifestoPhotoUrl =
    assets?.find((a) => a.key === "manifesto_photo")?.url || undefined;

  const gallerySlots = Array.from({ length: 8 }, (_, i) => {
    const asset = (assets ?? []).find((a) => a.key === `gallery_${i + 1}`);
    return asset?.url ?? "";
  });

  const footerLang = "es";
  const companyName = contentMap.footer?.company_name?.[footerLang];
  const contactEmail = contentMap.footer?.company_email?.[footerLang];

  return (
    <>
      <Navbar companyName={companyName} />
      <main>
        <HeroSection mediaSrc={heroMediaUrl} content={contentMap.hero} />
        <MarqueeSection slots={gallerySlots} />
        <ManifestoSection photoSrc={manifestoPhotoUrl} content={contentMap.manifesto} />
        <ProgramSection content={contentMap.program} items={programItems ?? []} />
        <PricingSection content={contentMap.pricing} />
        <OnboardingPage
          tripSlug={slug}
          initialCode={code}
          paymentContent={contentMap.payment ?? {}}
          footerContent={contentMap.footer ?? {}}
        />
      </main>
      <Footer content={contentMap.footer} />
      <InvitationModal tripSlug={slug} initialCode={code} contactEmail={contactEmail} />
    </>
  );
}
