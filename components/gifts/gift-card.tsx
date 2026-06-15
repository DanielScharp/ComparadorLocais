"use client";

import { CheckCircle2, Gift, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GiftProps {
  id: string;
  name: string;
  description: string | null;
  price_in_cents: number;
  image_url: string | null;
  is_reserved: boolean;
  reserved_by_name: string | null;
}

interface GiftCardProps {
  gift: GiftProps;
  onSelect: () => void;
}

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function GiftCard({ gift, onSelect }: GiftCardProps) {
  const reserved = gift.is_reserved;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-200",
        reserved
          ? "border-border opacity-75"
          : "border-border hover:border-[var(--gold)] hover:shadow-md cursor-pointer group"
      )}
    >
      {/* Badge de reservado */}
      {reserved && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-foreground/90 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
          <Lock className="h-3 w-3" />
          Presenteado
        </div>
      )}

      {/* Imagem */}
      <div className="relative h-44 bg-muted flex items-center justify-center overflow-hidden">
        {gift.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gift.image_url}
            alt={gift.name}
            className={cn("w-full h-full object-cover transition-transform duration-300", !reserved && "group-hover:scale-105")}
          />
        ) : (
          <Gift className="h-10 w-10 text-muted-foreground/40" />
        )}
        {reserved && (
          <div className="absolute inset-0 bg-background/40 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-[var(--sage)] opacity-70" />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="flex-1">
          <h3 className={cn("font-medium text-base leading-snug", reserved && "line-through text-muted-foreground")}>
            {gift.name}
          </h3>
          {gift.description && (
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed line-clamp-2">
              {gift.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className={cn("font-semibold text-lg", reserved ? "text-muted-foreground" : "text-[var(--gold)]")}>
            {formatBRL(gift.price_in_cents)}
          </span>

          {reserved ? (
            <span className="text-xs text-muted-foreground">
              por {gift.reserved_by_name ?? "alguém"}
            </span>
          ) : (
            <Button
              size="sm"
              onClick={onSelect}
              className="bg-[var(--sage)] text-primary-foreground hover:bg-[var(--sage)]/90 text-xs"
            >
              Presentear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
