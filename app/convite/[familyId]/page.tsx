"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Playfair_Display, Lato } from "next/font/google";
import { Check, X, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Family, Guest } from "@/lib/types";

const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"] });
const lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700"] });

type GuestResponse = { guestId: string; confirmed: boolean | null };

export default function InvitationPage() {
  const { familyId } = useParams<{ familyId: string }>();
  const [family, setFamily] = useState<Family | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [responses, setResponses] = useState<Record<string, boolean | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchFamily = useCallback(async () => {
    try {
      const res = await fetch(`/api/rsvp/${familyId}`);
      if (!res.ok) { setNotFound(true); return; }
      const data: Family = await res.json();
      setFamily(data);
      // Pre-populate responses from existing confirmed values
      const initial: Record<string, boolean | null> = {};
      (data.guests || []).forEach((g) => { initial[g.id] = g.confirmed; });
      setResponses(initial);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [familyId]);

  useEffect(() => { fetchFamily(); }, [fetchFamily]);

  async function handleSubmit() {
    if (!family) return;
    setSubmitting(true);
    try {
      const payload = Object.entries(responses)
        .filter(([, v]) => v !== null)
        .map(([guestId, confirmed]) => ({ guestId, confirmed: confirmed as boolean }));

      const res = await fetch(`/api/rsvp/${familyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: payload }),
      });
      if (res.ok) setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  function setGuestResponse(guestId: string, confirmed: boolean) {
    setResponses((prev) => ({
      ...prev,
      [guestId]: prev[guestId] === confirmed ? null : confirmed,
    }));
  }

  const allAnswered =
    family?.guests?.length > 0 &&
    family.guests.every((g) => responses[g.id] !== null && responses[g.id] !== undefined);

  if (loading) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center bg-[#faf8f4]", lato.className)}>
        <Loader2 className="h-8 w-8 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  if (notFound || !family) {
    return (
      <div className={cn("flex min-h-screen flex-col items-center justify-center bg-[#faf8f4] px-6", lato.className)}>
        <p className="text-lg text-[#8B7355]">Convite não encontrado.</p>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-[#faf8f4]", lato.className)}>
      {/* Decorative top border */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#B8975A] to-transparent" />

      <div className="mx-auto max-w-lg px-6 py-16">

        {/* Top ornament */}
        <div className="mb-10 flex flex-col items-center gap-3">
          <OrnamentTop />
          <p className={cn("text-xs tracking-[0.35em] text-[#8B7355] uppercase", lato.className)}>
            Convite de Casamento
          </p>
        </div>

        {/* Main heading */}
        <div className="mb-2 text-center">
          <p className={cn("mb-1 text-sm tracking-[0.2em] text-[#8B7355] uppercase", lato.className)}>
            Com grande alegria, convidamos
          </p>
          <h1 className={cn("text-4xl font-bold italic leading-tight text-[#3D2B1F]", playfair.className)}>
            Família {family.name}
          </h1>
        </div>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-[#C9A96E]/40" />
          <Heart className="h-4 w-4 fill-[#B8975A] text-[#B8975A]" />
          <div className="h-px flex-1 bg-[#C9A96E]/40" />
        </div>

        {/* Invitation text */}
        <div className="mb-10 text-center">
          <p className="leading-relaxed text-[#5C4033]/80">
            Será uma honra ter a presença de vocês em nosso dia especial.
            <br />
            Por favor, confirme sua presença abaixo.
          </p>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-[#C9A96E]/30 bg-white/70 px-8 py-12 shadow-sm backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4A7C59]/10">
              <Check className="h-8 w-8 text-[#4A7C59]" />
            </div>
            <div className="text-center">
              <h2 className={cn("mb-2 text-2xl font-semibold text-[#3D2B1F]", playfair.className)}>
                Resposta Enviada!
              </h2>
              <p className="text-sm leading-relaxed text-[#5C4033]/70">
                Obrigado por responder ao nosso convite.{" "}
                {Object.values(responses).some((v) => v === true)
                  ? "Mal podemos esperar para celebrar com vocês!"
                  : "Sentiremos muito a sua falta."}
              </p>
            </div>
            <OrnamentSmall />
          </div>
        ) : (
          /* RSVP form */
          <div className="rounded-2xl border border-[#C9A96E]/30 bg-white/70 px-6 py-8 shadow-sm backdrop-blur-sm">
            <h2 className={cn("mb-1 text-center text-xl font-semibold text-[#3D2B1F]", playfair.className)}>
              Confirme sua presença
            </h2>
            <p className="mb-6 text-center text-xs text-[#8B7355]">
              Selecione a resposta de cada convidado
            </p>

            <div className="space-y-3">
              {(family.guests || []).map((guest) => (
                <GuestRsvpRow
                  key={guest.id}
                  guest={guest}
                  response={responses[guest.id] ?? null}
                  onConfirm={(v) => setGuestResponse(guest.id, v)}
                />
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || submitting}
                className={cn(
                  "w-full rounded-xl py-3.5 text-sm font-semibold tracking-widest uppercase transition-all",
                  allAnswered && !submitting
                    ? "bg-[#B8975A] text-white shadow-md hover:bg-[#9E7E45] active:scale-[0.98]"
                    : "cursor-not-allowed bg-[#E8DDD0] text-[#B8A898]"
                )}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Confirmar"
                )}
              </button>
              {!allAnswered && (
                <p className="mt-2 text-center text-xs text-[#8B7355]/70">
                  Responda todos os convidados para continuar
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom ornament */}
        <div className="mt-14 flex flex-col items-center gap-4">
          <OrnamentBottom />
          <p className={cn("text-center text-xs tracking-[0.2em] text-[#8B7355]/60 uppercase", lato.className)}>
            Com amor
          </p>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#B8975A] to-transparent" />
    </div>
  );
}

function GuestRsvpRow({
  guest,
  response,
  onConfirm,
}: {
  guest: Guest;
  response: boolean | null;
  onConfirm: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E8DDD0] bg-[#FDFAF6] px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#3D2B1F]">{guest.name}</p>
        {guest.is_main_guest && (
          <p className="text-xs text-[#B8975A]">Convidado principal</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => onConfirm(true)}
          aria-label="Confirmar presença"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
            response === true
              ? "border-[#4A7C59] bg-[#4A7C59] text-white shadow-sm"
              : "border-[#C9A96E]/40 bg-white text-[#9E9E9E] hover:border-[#4A7C59] hover:text-[#4A7C59]"
          )}
        >
          <Check className="h-4 w-4" />
        </button>
        <button
          onClick={() => onConfirm(false)}
          aria-label="Recusar convite"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
            response === false
              ? "border-[#C0392B] bg-[#C0392B] text-white shadow-sm"
              : "border-[#C9A96E]/40 bg-white text-[#9E9E9E] hover:border-[#C0392B] hover:text-[#C0392B]"
          )}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function OrnamentTop() {
  return (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none" aria-hidden="true">
      <path d="M60 2 C60 2, 40 20, 2 20" stroke="#C9A96E" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M60 2 C60 2, 80 20, 118 20" stroke="#C9A96E" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <circle cx="60" cy="2" r="2" fill="#C9A96E" opacity="0.8" />
      <circle cx="2" cy="20" r="1.5" fill="#C9A96E" opacity="0.5" />
      <circle cx="118" cy="20" r="1.5" fill="#C9A96E" opacity="0.5" />
      <path d="M40 20 Q50 30 60 20 Q70 30 80 20" stroke="#C9A96E" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M55 8 Q60 14 65 8" stroke="#C9A96E" strokeWidth="0.8" fill="none" opacity="0.6" />
    </svg>
  );
}

function OrnamentBottom() {
  return (
    <svg width="160" height="30" viewBox="0 0 160 30" fill="none" aria-hidden="true">
      <path d="M0 15 H60" stroke="#C9A96E" strokeWidth="0.8" opacity="0.4" />
      <path d="M100 15 H160" stroke="#C9A96E" strokeWidth="0.8" opacity="0.4" />
      <path d="M60 15 Q70 5 80 15 Q90 25 100 15" stroke="#C9A96E" strokeWidth="1" fill="none" opacity="0.7" />
      <circle cx="80" cy="15" r="2" fill="#C9A96E" opacity="0.6" />
      <circle cx="0" cy="15" r="1.5" fill="#C9A96E" opacity="0.3" />
      <circle cx="160" cy="15" r="1.5" fill="#C9A96E" opacity="0.3" />
    </svg>
  );
}

function OrnamentSmall() {
  return (
    <svg width="80" height="16" viewBox="0 0 80 16" fill="none" aria-hidden="true">
      <path d="M0 8 H30" stroke="#C9A96E" strokeWidth="0.8" opacity="0.4" />
      <path d="M50 8 H80" stroke="#C9A96E" strokeWidth="0.8" opacity="0.4" />
      <circle cx="40" cy="8" r="2.5" fill="#C9A96E" opacity="0.5" />
      <circle cx="32" cy="8" r="1.5" fill="#C9A96E" opacity="0.3" />
      <circle cx="48" cy="8" r="1.5" fill="#C9A96E" opacity="0.3" />
    </svg>
  );
}
