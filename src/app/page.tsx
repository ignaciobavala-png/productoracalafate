import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SectionContent = Record<string, { es: string; en: string }>;

export default async function Home() {
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("slug")
    .eq("is_active", true)
    .order("created_at")
    .limit(1)
    .single();

  if (trip) redirect(`/${trip.slug}`);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-black/30">No hay viajes activos.</p>
    </div>
  );
}
