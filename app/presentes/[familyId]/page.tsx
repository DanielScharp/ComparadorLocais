import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { GiftsClient } from "@/components/gifts/gifts-client";

export default async function PresentesPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;
  const supabase = await createClient();

  const [{ data: family }, { data: gifts }, { data: settingsRows }] = await Promise.all([
    supabase.from("families").select("id, name, side").eq("id", familyId).single(),
    supabase.from("gifts").select("*").order("sort_order").order("created_at"),
    supabase.from("settings").select("key, value"),
  ]);

  if (!family) notFound();

  const settings: Record<string, string | null> = {};
  for (const row of settingsRows ?? []) {
    settings[row.key] = row.value;
  }

  return (
    <GiftsClient
      family={family}
      initialGifts={gifts ?? []}
      pixKey={settings.pix_key ?? null}
      pixKeyType={settings.pix_key_type ?? "cpf"}
      pixReceiverName={settings.pix_receiver_name ?? null}
      pixCity={settings.pix_city ?? null}
    />
  );
}
