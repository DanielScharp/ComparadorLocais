import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/settings — retorna todas as configurações como objeto key→value
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result: Record<string, string | null> = {};
  for (const row of data ?? []) {
    result[row.key] = row.value;
  }
  return NextResponse.json(result);
}

// POST /api/settings — salva/atualiza configurações (body: { key: value, ... })
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const upserts = Object.entries(body).map(([key, value]) => ({
    key,
    value: value as string | null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("settings")
    .upsert(upserts, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
