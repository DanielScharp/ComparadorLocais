import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/gifts/[id]/reserve — reserva um presente via Pix (confirmação manual)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await req.json();
  const { family_id, reserved_by_name } = body;

  if (!reserved_by_name) {
    return NextResponse.json({ error: "nome do convidado é obrigatório" }, { status: 400 });
  }

  // Verifica se já está reservado
  const { data: gift } = await supabase.from("gifts").select("is_reserved").eq("id", id).single();
  if (gift?.is_reserved) {
    return NextResponse.json({ error: "Este presente já foi reservado." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("gifts")
    .update({
      is_reserved: true,
      reserved_by_family_id: family_id || null,
      reserved_by_name,
      reserved_at: new Date().toISOString(),
      payment_method: "pix",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/gifts/[id]/reserve — desfaz reserva (admin)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("gifts")
    .update({
      is_reserved: false,
      reserved_by_family_id: null,
      reserved_by_name: null,
      reserved_at: null,
      payment_method: null,
      stripe_session_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
