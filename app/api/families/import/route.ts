import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface GuestInput {
  name: string;
  is_main_guest?: boolean;
  notes?: string;
}

interface FamilyInput {
  name: string;
  side: "noivo" | "noiva";
  max_guests?: number;
  notes?: string;
  guests: GuestInput[];
}

export async function POST(request: Request) {
  const supabase = await createClient();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!Array.isArray(body)) {
    return NextResponse.json(
      { error: "O corpo deve ser um array de famílias" },
      { status: 400 }
    );
  }

  const families = body as FamilyInput[];
  const imported: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < families.length; i++) {
    const item = families[i];
    const idx = `Família ${i + 1} ("${item.name ?? "?"}")`;

    if (!item.name || typeof item.name !== "string" || !item.name.trim()) {
      errors.push(`${idx}: campo "name" é obrigatório.`);
      continue;
    }

    if (item.side !== "noivo" && item.side !== "noiva") {
      errors.push(`${idx}: campo "side" deve ser "noivo" ou "noiva".`);
      continue;
    }

    if (!Array.isArray(item.guests) || item.guests.length === 0) {
      errors.push(`${idx}: campo "guests" deve ser um array com pelo menos 1 convidado.`);
      continue;
    }

    const guestNames = item.guests.map((g) => g?.name?.trim()).filter(Boolean);
    if (guestNames.length === 0) {
      errors.push(`${idx}: nenhum convidado válido encontrado.`);
      continue;
    }

    // Create family
    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({
        name: item.name.trim(),
        side: item.side,
        max_guests: item.max_guests ?? item.guests.length,
        notes: item.notes?.trim() || null,
      })
      .select()
      .single();

    if (familyError) {
      errors.push(`${idx}: erro ao criar família — ${familyError.message}`);
      continue;
    }

    // Create guests
    const guestsToInsert = item.guests
      .filter((g) => g?.name?.trim())
      .map((g, gIdx) => ({
        family_id: family.id,
        name: g.name.trim(),
        is_main_guest: g.is_main_guest ?? gIdx === 0,
        confirmed: null,
        notes: g.notes?.trim() || null,
      }));

    const { error: guestError } = await supabase
      .from("guests")
      .insert(guestsToInsert);

    if (guestError) {
      // Rollback family
      await supabase.from("families").delete().eq("id", family.id);
      errors.push(`${idx}: erro ao criar convidados — ${guestError.message}`);
      continue;
    }

    imported.push(family.id);
  }

  return NextResponse.json(
    { imported: imported.length, errors },
    { status: errors.length > 0 && imported.length === 0 ? 400 : 201 }
  );
}
