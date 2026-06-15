import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// POST /api/gifts/[id]/confirm — confirma o pagamento Stripe e reserva o presente
// Usado como fallback ao webhook: verifica o status da sessão direto no Stripe.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await req.json();
  const { session_id } = body;

  if (!session_id) {
    return NextResponse.json({ error: "session_id é obrigatório." }, { status: 400 });
  }

  // Recupera a sessão direto do Stripe para validar o pagamento
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch {
    return NextResponse.json({ error: "Sessão de pagamento inválida." }, { status: 400 });
  }

  // Só reserva se o pagamento foi efetivamente concluído
  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Pagamento ainda não confirmado.", paid: false },
      { status: 402 },
    );
  }

  // Verifica se o presente existe e ainda não foi reservado por outra sessão
  const { data: gift } = await supabase.from("gifts").select("*").eq("id", id).single();
  if (!gift) {
    return NextResponse.json({ error: "Presente não encontrado." }, { status: 404 });
  }

  // Idempotência: se já está reservado por esta mesma sessão, retorna sucesso
  if (gift.is_reserved && gift.stripe_session_id === session_id) {
    return NextResponse.json({ success: true, gift });
  }

  const { gift_id, family_id, reserved_by_name } = session.metadata || {};

  const { data: updated, error } = await supabase
    .from("gifts")
    .update({
      is_reserved: true,
      reserved_by_family_id: family_id || null,
      reserved_by_name: reserved_by_name || "Convidado",
      reserved_at: new Date().toISOString(),
      payment_method: "stripe",
      stripe_session_id: session_id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gift_id || id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Erro ao reservar o presente." }, { status: 500 });
  }

  return NextResponse.json({ success: true, gift: updated });
}
