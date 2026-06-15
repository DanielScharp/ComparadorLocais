import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// POST /api/gifts/[id]/checkout — cria sessão Stripe Embedded Checkout
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await req.json();
  const { family_id, reserved_by_name } = body;

  // Busca o presente no banco
  const { data: gift, error: giftError } = await supabase
    .from("gifts")
    .select("*")
    .eq("id", id)
    .single();

  if (giftError || !gift) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }
  if (gift.is_reserved) {
    return NextResponse.json({ error: "Este presente já foi reservado." }, { status: 409 });
  }

  const headersList = req.headers;
  const origin = headersList.get("origin") || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    currency: "brl",
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: gift.name,
            description: gift.description || undefined,
          },
          unit_amount: gift.price_in_cents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      gift_id: id,
      family_id: family_id || "",
      reserved_by_name: reserved_by_name || "",
    },
  });

  return NextResponse.json({ clientSecret: session.client_secret, sessionId: session.id });
}
