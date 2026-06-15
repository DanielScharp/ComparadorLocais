import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  // Em desenvolvimento, sem webhook secret, processa diretamente
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    return NextResponse.json({ error: "Webhook inválido" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { gift_id, family_id, reserved_by_name } = session.metadata || {};

    if (!gift_id) {
      return NextResponse.json({ received: true });
    }

    const supabase = await createClient();
    await supabase
      .from("gifts")
      .update({
        is_reserved: true,
        reserved_by_family_id: family_id || null,
        reserved_by_name: reserved_by_name || "Convidado",
        reserved_at: new Date().toISOString(),
        payment_method: "stripe",
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gift_id);
  }

  return NextResponse.json({ received: true });
}
