import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: attachments, error } = await supabase
    .from("venue_attachments")
    .select("*")
    .eq("venue_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(attachments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

  const { name, url, type, size } = body;

  if (!name || !url || !type) {
    return NextResponse.json(
      { error: "name, url e type são obrigatórios" },
      { status: 400 }
    );
  }

  const { data: attachment, error } = await supabase
    .from("venue_attachments")
    .insert({
      venue_id: id,
      name,
      url,
      type,
      size: size || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(attachment, { status: 201 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const attachmentId = searchParams.get("attachmentId");

  if (!attachmentId) {
    return NextResponse.json(
      { error: "attachmentId é obrigatório" },
      { status: 400 }
    );
  }

  // Get attachment to delete from blob storage
  const { data: attachment, error: fetchError } = await supabase
    .from("venue_attachments")
    .select("url")
    .eq("id", attachmentId)
    .eq("venue_id", id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  // Delete from blob storage
  if (attachment?.url) {
    try {
      await del(attachment.url);
    } catch (e) {
      console.error("Failed to delete from blob storage:", e);
    }
  }

  // Delete from database
  const { error } = await supabase
    .from("venue_attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("venue_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
