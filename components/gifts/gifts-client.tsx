"use client";

import { useState } from "react";
import { GiftCard } from "@/components/gifts/gift-card";
import { GiftPaymentModal } from "@/components/gifts/gift-payment-modal";
import { PixLivreModal } from "@/components/gifts/pix-livre-modal";
import { Gift, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Gift {
  id: string;
  name: string;
  description: string | null;
  price_in_cents: number;
  image_url: string | null;
  is_reserved: boolean;
  reserved_by_name: string | null;
  sort_order: number;
}

interface Family {
  id: string;
  name: string;
  side: string;
}

interface GiftsClientProps {
  family: Family;
  initialGifts: Gift[];
  pixKey: string | null;
  pixKeyType: string;
  pixReceiverName: string | null;
  pixCity: string | null;
}

export function GiftsClient({
  family,
  initialGifts,
  pixKey,
  pixKeyType,
  pixReceiverName,
  pixCity,
}: GiftsClientProps) {
  const [gifts, setGifts] = useState<Gift[]>(initialGifts);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [pixLivreOpen, setPixLivreOpen] = useState(false);

  function handleSelectGift(gift: Gift) {
    setSelectedGift(gift);
    setPaymentModalOpen(true);
  }

  function handleReserved(giftId: string, reservedByName: string) {
    setGifts((prev) =>
      prev.map((g) =>
        g.id === giftId ? { ...g, is_reserved: true, reserved_by_name: reservedByName } : g
      )
    );
    setPaymentModalOpen(false);
    setSelectedGift(null);
  }

  const availableGifts = gifts.filter((g) => !g.is_reserved);
  const reservedGifts = gifts.filter((g) => g.is_reserved);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-[oklch(0.97_0.012_75)] border-b border-border">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-px w-12 bg-[var(--gold)]" />
            <span className="text-[var(--gold)] text-sm font-medium tracking-widest uppercase">Lista de Presentes</span>
            <div className="h-px w-12 bg-[var(--gold)]" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3 text-balance">
            {family.name}
          </h1>
          <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
            Sua presença já é o nosso maior presente. Se quiser nos presentear, escolha um item abaixo — cada um foi escolhido com carinho.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-10 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">{availableGifts.length}</span> disponíveis
          </span>
          <div className="h-4 w-px bg-border" />
          <span>
            <span className="font-semibold text-foreground">{reservedGifts.length}</span> já presenteados
          </span>
        </div>

        {gifts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Gift className="mx-auto h-12 w-12 mb-4 opacity-30" />
            <p>A lista de presentes ainda não foi preenchida.</p>
          </div>
        ) : (
          <>
            {/* Grade de presentes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
              {gifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onSelect={() => !gift.is_reserved && handleSelectGift(gift)}
                />
              ))}
            </div>
          </>
        )}

        {/* Pix Livre */}
        <div className="border border-dashed border-[var(--gold)] rounded-xl p-8 text-center bg-[oklch(0.99_0.008_75)]">
          <Heart className="mx-auto h-8 w-8 text-[var(--gold)] mb-3" />
          <h3 className="font-serif text-xl text-foreground mb-2">Presente no valor que preferir</h3>
          <p className="text-muted-foreground text-sm mb-5 max-w-sm mx-auto">
            Não encontrou algo no valor que pretendia dar? Faça um Pix no valor que quiser — qualquer contribuição é recebida com muito amor.
          </p>
          <Button
            variant="outline"
            className="border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold-light)]"
            onClick={() => setPixLivreOpen(true)}
            disabled={!pixKey}
          >
            {pixKey ? "Fazer Pix no valor que preferir" : "Pix não configurado ainda"}
          </Button>
        </div>
      </div>

      {/* Modais */}
      {selectedGift && (
        <GiftPaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          gift={selectedGift}
          familyId={family.id}
          familyName={family.name}
          pixKey={pixKey}
          pixKeyType={pixKeyType}
          pixReceiverName={pixReceiverName}
          pixCity={pixCity}
          onReserved={handleReserved}
        />
      )}

      <PixLivreModal
        open={pixLivreOpen}
        onOpenChange={setPixLivreOpen}
        pixKey={pixKey}
        pixKeyType={pixKeyType}
        pixReceiverName={pixReceiverName}
        pixCity={pixCity}
        familyName={family.name}
      />
    </div>
  );
}
