import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: families, error } = await supabase
    .from("families")
    .select(`
      *,
      guests (*)
    `)
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(families);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { name, side, max_guests, notes, main_guest_name } = body;

  if (!name || !side) {
    return NextResponse.json(
      { error: "Nome e lado são obrigatórios" },
      { status: 400 }
    );
  }

  if (side !== "noivo" && side !== "noiva") {
    return NextResponse.json(
      { error: "Lado deve ser 'noivo' ou 'noiva'" },
      { status: 400 }
    );
  }

  // Create family
  const { data: family, error: familyError } = await supabase
    .from("families")
    .insert({
      name,
      side,
      max_guests: max_guests || 1,
      notes: notes || null,
    })
    .select()
    .single();

  if (familyError) {
    return NextResponse.json({ error: familyError.message }, { status: 500 });
  }

  // Create main guest if provided
  if (main_guest_name) {
    const { error: guestError } = await supabase.from("guests").insert({
      family_id: family.id,
      name: main_guest_name,
      is_main_guest: true,
    });

    if (guestError) {
      // Rollback family creation
      await supabase.from("families").delete().eq("id", family.id);
      return NextResponse.json({ error: guestError.message }, { status: 500 });
    }
  }

  // Fetch family with guests
  const { data: fullFamily, error: fetchError } = await supabase
    .from("families")
    .select(`
      *,
      guests (*)
    `)
    .eq("id", family.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  return NextResponse.json(fullFamily, { status: 201 });
}
