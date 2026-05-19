import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: familyId } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const { name, is_main_guest, notes } = body;

  if (!name) {
    return NextResponse.json(
      { error: "Nome do convidado é obrigatório" },
      { status: 400 }
    );
  }

  // Check max guests limit
  const { data: family, error: familyError } = await supabase
    .from("families")
    .select("max_guests")
    .eq("id", familyId)
    .single();

  if (familyError) {
    return NextResponse.json({ error: familyError.message }, { status: 500 });
  }

  const { count, error: countError } = await supabase
    .from("guests")
    .select("*", { count: "exact", head: true })
    .eq("family_id", familyId);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (count !== null && count >= family.max_guests) {
    return NextResponse.json(
      { error: `Limite de ${family.max_guests} convidados atingido para esta família` },
      { status: 400 }
    );
  }

  const { data: guest, error } = await supabase
    .from("guests")
    .insert({
      family_id: familyId,
      name,
      is_main_guest: is_main_guest || false,
      confirmed: null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(guest, { status: 201 });
}
