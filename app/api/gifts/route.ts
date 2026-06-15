import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/gifts — lista todos os presentes
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gifts")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/gifts — cria um presente
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();
  const { name, description, price_in_cents, image_url, sort_order } = body;

  if (!name || !price_in_cents) {
    return NextResponse.json({ error: "nome e valor são obrigatórios" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("gifts")
    .insert({ name, description: description || null, price_in_cents, image_url: image_url || null, sort_order: sort_order ?? 0 })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
