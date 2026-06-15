"use client";

import { useState, useCallback, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeGiftCheckoutProps {
  giftId: string;
  familyId: string;
  guestName: string;
  onReserved: (giftId: string, name: string) => void;
}

export function StripeGiftCheckout({ giftId, familyId, guestName, onReserved }: StripeGiftCheckoutProps) {
  const [checkoutStarted, setCheckoutStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch(`/api/gifts/${giftId}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ family_id: familyId, reserved_by_name: guestName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Erro ao iniciar pagamento");
    setSessionId(data.sessionId);
    sessionIdRef.current = data.sessionId;
    return data.clientSecret;
  }, [giftId, familyId, guestName]);

  async function handleStart() {
    if (!guestName.trim()) {
      toast.error("Por favor, informe seu nome antes de continuar.");
      return;
    }
    setLoading(true);
    try {
      setCheckoutStarted(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    // Confirma o pagamento server-side e persiste a reserva no banco
    // (não depende do webhook, que pode não estar configurado no preview).
    try {
      const res = await fetch(`/api/gifts/${giftId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionIdRef.current }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Não foi possível confirmar o pagamento.");
      }
      toast.success("Pagamento realizado! Presente marcado como presenteado.");
      onReserved(giftId, guestName);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Pagamento recebido, mas houve um erro ao registrar. Avise os noivos.",
      );
    }
  }

  if (!checkoutStarted) {
    return (
      <Button
        className="w-full"
        onClick={handleStart}
        disabled={loading || !guestName.trim()}
      >
        {loading ? "Aguarde..." : "Pagar com Cartão"}
      </Button>
    );
  }

  return (
    <div className="min-h-[300px]">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret, onComplete: handleComplete }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
