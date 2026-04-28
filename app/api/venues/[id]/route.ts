import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const { name, price, capacity, benefits, hidden } = body;
  if (!name || price == null || capacity == null) {
    return NextResponse.json(
      { error: "name, price e capacity sao obrigatorios" },
      { status: 400 }
    );
  }

  // Update venue
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .update({ name, price, capacity, hidden: hidden ?? false })
    .eq("id", id)
    .select()
    .single();

  if (venueError) {
    return NextResponse.json({ error: venueError.message }, { status: 500 });
  }

  // Replace venue_benefits: delete old then insert new
  const { error: deleteError } = await supabase
    .from("venue_benefits")
    .delete()
    .eq("venue_id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (benefits && benefits.length > 0) {
    const rows = benefits.map((bid: string) => ({
      venue_id: id,
      benefit_id: bid,
    }));

    const { error: vbError } = await supabase
      .from("venue_benefits")
      .insert(rows);

    if (vbError) {
      return NextResponse.json({ error: vbError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ...venue, benefits: benefits || [] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // venue_benefits rows are deleted via ON DELETE CASCADE
  const { error } = await supabase.from("venues").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
