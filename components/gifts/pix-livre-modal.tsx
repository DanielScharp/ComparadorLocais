"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PixQrCode } from "@/components/gifts/pix-qr-code";
import { Copy, CheckCheck } from "lucide-react";

interface PixLivreModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pixKey: string | null;
  pixKeyType: string;
  pixReceiverName: string | null;
  pixCity: string | null;
  familyName: string;
}

function formatBRL(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

export function PixLivreModal({
  open,
  onOpenChange,
  pixKey,
  pixKeyType,
  pixReceiverName,
  pixCity,
  familyName,
}: PixLivreModalProps) {
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const amountCents = Math.round(parseFloat(amount.replace(",", ".")) * 100) || undefined;
  const pixReady = pixKey && pixReceiverName && pixCity;

  async function handleCopy() {
    if (!pixKey) return;
    await navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Presente no valor que preferir</DialogTitle>
          <DialogDescription>
            Faça um Pix no valor que desejar. Toda contribuição é recebida com muito amor.
          </DialogDescription>
        </DialogHeader>

        {pixReady && (
          <div className="space-y-5 mt-2">
            {/* Campo de valor opcional */}
            <div className="space-y-2">
              <Label htmlFor="pix-livre-amount">Valor (opcional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                <Input
                  id="pix-livre-amount"
                  className="pl-9"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^0-9.,]/g, "");
                    setAmount(v);
                  }}
                />
              </div>
              {amountCents && (
                <p className="text-xs text-muted-foreground">
                  QR Code gerado para <strong>{formatBRL(amountCents / 100)}</strong>
                </p>
              )}
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-3">
              <PixQrCode
                pixKey={pixKey}
                pixKeyType={pixKeyType}
                receiverName={pixReceiverName}
                city={pixCity}
                amount={amountCents}
                description={`Presente ${familyName}`}
              />
              <p className="text-xs text-muted-foreground text-center">
                Escaneie com o app do seu banco
              </p>
            </div>

            {/* Chave copiável */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Chave Pix ({pixKeyType})
              </Label>
              <div className="flex gap-2">
                <Input value={pixKey} readOnly className="font-mono text-sm" />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {copied ? <CheckCheck className="h-4 w-4 text-[var(--sage)]" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
