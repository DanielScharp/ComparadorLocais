import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: venues, error: venuesError } = await supabase
    .from("venues")
    .select("*, venue_benefits(benefit_id), venue_attachments(*)")
    .order("created_at", { ascending: true });

  if (venuesError) {
    return NextResponse.json({ error: venuesError.message }, { status: 500 });
  }

  // Transform to match the app's Venue interface
  const transformed = venues.map((v) => ({
    id: v.id,
    name: v.name,
    price: v.price,
    capacity: v.capacity,
    hidden: v.hidden || false,
    benefits: v.venue_benefits.map(
      (vb: { benefit_id: string }) => vb.benefit_id
    ),
    attachments: v.venue_attachments || [],
  }));

  return NextResponse.json(transformed);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { name, price, capacity, benefits, hidden } = body;
  if (!name || price == null || capacity == null) {
    return NextResponse.json(
      { error: "name, price e capacity sao obrigatorios" },
      { status: 400 }
    );
  }

  // Insert venue
  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .insert({ name, price, capacity, hidden: hidden || false })
    .select()
    .single();

  if (venueError) {
    return NextResponse.json({ error: venueError.message }, { status: 500 });
  }

  // Insert venue_benefits
  if (benefits && benefits.length > 0) {
    const rows = benefits.map((bid: string) => ({
      venue_id: venue.id,
      benefit_id: bid,
    }));

    const { error: vbError } = await supabase
      .from("venue_benefits")
      .insert(rows);

    if (vbError) {
      return NextResponse.json({ error: vbError.message }, { status: 500 });
    }
  }

  return NextResponse.json(
    { ...venue, benefits: benefits || [], attachments: [] },
    { status: 201 }
  );
}
