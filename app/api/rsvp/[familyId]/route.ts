import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  const { familyId } = await params;
  const supabase = await createClient();

  const { data: family, error } = await supabase
    .from("families")
    .select(`*, guests (*)`)
    .eq("id", familyId)
    .single();

  if (error || !family) {
    return NextResponse.json(
      { error: "Família não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json(family);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ familyId: string }> }
) {
  const { familyId } = await params;
  const supabase = await createClient();
  const body = await request.json();

  // body: { responses: [{ guestId: string, confirmed: boolean }] }
  const { responses } = body as {
    responses: { guestId: string; confirmed: boolean }[];
  };

  if (!Array.isArray(responses) || responses.length === 0) {
    return NextResponse.json(
      { error: "Respostas inválidas" },
      { status: 400 }
    );
  }

  // Verify all guests belong to this family
  const guestIds = responses.map((r) => r.guestId);
  const { data: guests, error: verifyError } = await supabase
    .from("guests")
    .select("id")
    .eq("family_id", familyId)
    .in("id", guestIds);

  if (verifyError) {
    return NextResponse.json({ error: verifyError.message }, { status: 500 });
  }

  if (!guests || guests.length !== guestIds.length) {
    return NextResponse.json(
      { error: "Alguns convidados não pertencem a esta família" },
      { status: 403 }
    );
  }

  // Update each guest
  const updates = responses.map(({ guestId, confirmed }) =>
    supabase
      .from("guests")
      .update({ confirmed, updated_at: new Date().toISOString() })
      .eq("id", guestId)
      .eq("family_id", familyId)
  );

  const results = await Promise.all(updates);
  const firstError = results.find((r) => r.error);
  if (firstError?.error) {
    return NextResponse.json({ error: firstError.error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
