"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PixQrCode } from "@/components/gifts/pix-qr-code";
import { StripeGiftCheckout } from "@/components/gifts/stripe-gift-checkout";
import { Copy, CheckCheck, AlertCircle, Smartphone, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Gift {
  id: string;
  name: string;
  description: string | null;
  price_in_cents: number;
  image_url: string | null;
  is_reserved: boolean;
}

interface GiftPaymentModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  gift: Gift;
  familyId: string;
  familyName: string;
  pixKey: string | null;
  pixKeyType: string;
  pixReceiverName: string | null;
  pixCity: string | null;
  onReserved: (giftId: string, name: string) => void;
}

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export function GiftPaymentModal({
  open,
  onOpenChange,
  gift,
  familyId,
  familyName,
  pixKey,
  pixKeyType,
  pixReceiverName,
  pixCity,
  onReserved,
}: GiftPaymentModalProps) {
  const [guestName, setGuestName] = useState(familyName);
  const [pixConfirming, setPixConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nameStep, setNameStep] = useState(true); // pede nome antes de mostrar Pix

  const pixReady = pixKey && pixReceiverName && pixCity;

  async function handleCopyKey() {
    if (!pixKey) return;
    await navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePixConfirm() {
    if (!guestName.trim()) return;
    setPixConfirming(true);
    try {
      const res = await fetch(`/api/gifts/${gift.id}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family_id: familyId, reserved_by_name: guestName.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Erro ao confirmar.");
        return;
      }
      toast.success("Presente confirmado! Muito obrigado!");
      onReserved(gift.id, guestName.trim());
    } finally {
      setPixConfirming(false);
    }
  }

  function handleClose(v: boolean) {
    if (!v) {
      setNameStep(true);
      setGuestName(familyName);
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{gift.name}</DialogTitle>
          <DialogDescription className="text-[var(--gold)] font-semibold text-lg">
            {formatBRL(gift.price_in_cents)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pix" className="mt-2">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="pix" className="flex-1 gap-2">
              <Smartphone className="h-4 w-4" />
              Pix
              <span className="text-[10px] bg-[var(--gold)] text-white px-1.5 py-0.5 rounded-full ml-1">Recomendado</span>
            </TabsTrigger>
            <TabsTrigger value="cartao" className="flex-1 gap-2">
              <CreditCard className="h-4 w-4" />
              Cartão
            </TabsTrigger>
          </TabsList>

          {/* ABA PIX */}
          <TabsContent value="pix" className="space-y-4">
            {!pixReady ? (
              <div className="flex items-start gap-3 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>O Pix ainda não foi configurado pelos noivos. Utilize o cartão ou volte em breve.</span>
              </div>
            ) : (
              <>
                {nameStep ? (
                  <div className="space-y-4">
                    <div className="rounded-lg bg-[var(--gold-light)] border border-[var(--gold)]/30 p-4 text-sm text-foreground">
                      <p className="font-medium mb-1">Como funciona?</p>
                      <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                        <li>Confirme seu nome abaixo</li>
                        <li>Escaneie o QR Code ou copie a chave Pix</li>
                        <li>Realize o pagamento no seu banco</li>
                        <li>Clique em &quot;Já fiz o Pix&quot; para marcar o presente</li>
                      </ol>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pix-name">Seu nome</Label>
                      <Input
                        id="pix-name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Como você quer aparecer na lista"
                      />
                    </div>
                    <Button
                      className="w-full bg-[var(--sage)] hover:bg-[var(--sage)]/90 text-white"
                      onClick={() => setNameStep(false)}
                      disabled={!guestName.trim()}
                    >
                      Ver QR Code e Chave Pix
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-col items-center gap-4">
                      <PixQrCode
                        pixKey={pixKey!}
                        pixKeyType={pixKeyType}
                        receiverName={pixReceiverName!}
                        city={pixCity!}
                        amount={gift.price_in_cents}
                        description={gift.name}
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Escaneie com o app do seu banco.<br />
                        Valor: <strong>{formatBRL(gift.price_in_cents)}</strong>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Chave Pix ({pixKeyType})
                      </Label>
                      <div className="flex gap-2">
                        <Input value={pixKey!} readOnly className="font-mono text-sm" />
                        <Button size="icon" variant="outline" onClick={handleCopyKey}>
                          {copied ? <CheckCheck className="h-4 w-4 text-[var(--sage)]" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      Após realizar o Pix, clique no botão abaixo para marcar o presente como presenteado e avisar os demais convidados.
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setNameStep(true)} className="flex-1">
                        Voltar
                      </Button>
                      <Button
                        className="flex-1 bg-[var(--sage)] hover:bg-[var(--sage)]/90 text-white"
                        onClick={handlePixConfirm}
                        disabled={pixConfirming}
                      >
                        {pixConfirming ? "Confirmando..." : "Já fiz o Pix"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ABA CARTÃO */}
          <TabsContent value="cartao" className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                O pagamento por cartão é processado via Stripe e pode ter uma taxa de serviço. Prefira o Pix para enviar o valor integral.
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="card-name">Seu nome</Label>
              <Input
                id="card-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Como você quer aparecer na lista"
              />
            </div>

            <StripeGiftCheckout
              giftId={gift.id}
              familyId={familyId}
              guestName={guestName}
              onReserved={onReserved}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
