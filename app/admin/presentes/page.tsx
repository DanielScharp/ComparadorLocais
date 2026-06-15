"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Gift,
  RotateCcw,
  Settings,
  Save,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface GiftItem {
  id: string;
  name: string;
  description: string | null;
  price_in_cents: number;
  image_url: string | null;
  sort_order: number;
  is_reserved: boolean;
  reserved_by_name: string | null;
  payment_method: string | null;
}

interface PixSettings {
  pix_key: string;
  pix_key_type: string;
  pix_receiver_name: string;
  pix_city: string;
}

function formatBRL(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

export default function AdminPresentesPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pixSettings, setPixSettings] = useState<PixSettings>({
    pix_key: "",
    pix_key_type: "cpf",
    pix_receiver_name: "",
    pix_city: "",
  });
  const [savingPix, setSavingPix] = useState(false);

  // Form de presente
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    sort_order: "0",
  });

  const fetchGifts = useCallback(async () => {
    const res = await fetch("/api/gifts");
    const data = await res.json();
    setGifts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  const fetchPixSettings = useCallback(async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setPixSettings({
      pix_key: data.pix_key ?? "",
      pix_key_type: data.pix_key_type ?? "cpf",
      pix_receiver_name: data.pix_receiver_name ?? "",
      pix_city: data.pix_city ?? "",
    });
  }, []);

  useEffect(() => {
    fetchGifts();
    fetchPixSettings();
  }, [fetchGifts, fetchPixSettings]);

  function openAdd() {
    setEditingGift(null);
    setForm({ name: "", description: "", price: "", image_url: "", sort_order: "0" });
    setGiftDialogOpen(true);
  }

  function openEdit(gift: GiftItem) {
    setEditingGift(gift);
    setForm({
      name: gift.name,
      description: gift.description ?? "",
      price: (gift.price_in_cents / 100).toFixed(2).replace(".", ","),
      image_url: gift.image_url ?? "",
      sort_order: String(gift.sort_order),
    });
    setGiftDialogOpen(true);
  }

  function openDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  async function handleSaveGift() {
    const priceCents = Math.round(parseFloat(form.price.replace(",", ".")) * 100);
    if (!form.name.trim() || isNaN(priceCents) || priceCents <= 0) {
      toast.error("Preencha o nome e um valor válido.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price_in_cents: priceCents,
        image_url: form.image_url.trim() || null,
        sort_order: parseInt(form.sort_order) || 0,
      };

      if (editingGift) {
        const res = await fetch(`/api/gifts/${editingGift.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erro ao atualizar");
        toast.success("Presente atualizado!");
      } else {
        const res = await fetch("/api/gifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Erro ao criar");
        toast.success("Presente adicionado!");
      }
      await fetchGifts();
      setGiftDialogOpen(false);
    } catch {
      toast.error("Erro ao salvar o presente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    try {
      const res = await fetch(`/api/gifts/${deletingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar");
      toast.success("Presente removido.");
      setGifts((prev) => prev.filter((g) => g.id !== deletingId));
    } catch {
      toast.error("Erro ao remover o presente.");
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  }

  async function handleUnreserve(giftId: string) {
    try {
      const res = await fetch(`/api/gifts/${giftId}/reserve`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro");
      toast.success("Reserva desfeita.");
      await fetchGifts();
    } catch {
      toast.error("Erro ao desfazer reserva.");
    }
  }

  async function handleSavePix() {
    setSavingPix(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pix_key: pixSettings.pix_key || null,
          pix_key_type: pixSettings.pix_key_type,
          pix_receiver_name: pixSettings.pix_receiver_name || null,
          pix_city: pixSettings.pix_city || null,
        }),
      });
      if (!res.ok) throw new Error("Erro");
      toast.success("Configurações Pix salvas!");
    } catch {
      toast.error("Erro ao salvar configurações Pix.");
    } finally {
      setSavingPix(false);
    }
  }

  const reserved = gifts.filter((g) => g.is_reserved);
  const available = gifts.filter((g) => !g.is_reserved);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 lg:px-8 space-y-10">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl text-foreground">Lista de Presentes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {available.length} disponíveis · {reserved.length} presenteados
            </p>
          </div>
          <Button
            onClick={openAdd}
            className="bg-[var(--sage)] hover:bg-[var(--sage)]/90 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Presente
          </Button>
        </div>

        {/* Configurações Pix */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4 text-[var(--gold)]" />
            <h2 className="font-semibold text-base">Configurações do Pix</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Tipo de chave</Label>
              <Select
                value={pixSettings.pix_key_type}
                onValueChange={(v) => setPixSettings((p) => ({ ...p, pix_key_type: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpf">CPF</SelectItem>
                  <SelectItem value="cnpj">CNPJ</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="telefone">Telefone</SelectItem>
                  <SelectItem value="aleatoria">Chave Aleatória</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Chave Pix</Label>
              <Input
                placeholder="Ex: 000.000.000-00"
                value={pixSettings.pix_key}
                onChange={(e) => setPixSettings((p) => ({ ...p, pix_key: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Nome do recebedor</Label>
              <Input
                placeholder="Nome que aparece no Pix"
                value={pixSettings.pix_receiver_name}
                onChange={(e) => setPixSettings((p) => ({ ...p, pix_receiver_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Cidade</Label>
              <Input
                placeholder="Ex: São Paulo"
                value={pixSettings.pix_city}
                onChange={(e) => setPixSettings((p) => ({ ...p, pix_city: e.target.value }))}
              />
            </div>
          </div>
          <Button
            onClick={handleSavePix}
            disabled={savingPix}
            variant="outline"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {savingPix ? "Salvando..." : "Salvar Configurações Pix"}
          </Button>
        </section>

        {/* Lista de presentes */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando presentes...</div>
        ) : gifts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Gift className="mx-auto h-10 w-10 mb-3 opacity-30" />
            <p>Nenhum presente cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gifts.map((gift) => (
              <div
                key={gift.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                {/* Thumb */}
                <div className="h-14 w-14 shrink-0 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {gift.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={gift.image_url} alt={gift.name} className="h-full w-full object-cover" />
                  ) : (
                    <Gift className="h-6 w-6 text-muted-foreground/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{gift.name}</span>
                    {gift.is_reserved && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-foreground/10 text-foreground px-2 py-0.5 rounded-full shrink-0">
                        <Lock className="h-2.5 w-2.5" />
                        Presenteado por {gift.reserved_by_name}
                        {gift.payment_method && ` · ${gift.payment_method}`}
                      </span>
                    )}
                  </div>
                  {gift.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{gift.description}</p>
                  )}
                  <span className="text-[var(--gold)] font-semibold text-sm">{formatBRL(gift.price_in_cents)}</span>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 shrink-0">
                  {gift.is_reserved && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Desfazer reserva"
                      onClick={() => handleUnreserve(gift.id)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {!gift.is_reserved && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Editar"
                      onClick={() => openEdit(gift)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    title="Excluir"
                    onClick={() => openDelete(gift.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Dialog de criar/editar presente */}
      <Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGift ? "Editar Presente" : "Novo Presente"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Nome do presente *</Label>
              <Input
                placeholder="Ex: Jogo de panelas"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Detalhes sobre o presente..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Valor (R$) *</Label>
                <Input
                  placeholder="0,00"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/[^0-9.,]/g, "") }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Ordem</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>URL da imagem</Label>
              <Input
                placeholder="https://..."
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGiftDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveGift}
              disabled={saving}
              className="bg-[var(--sage)] hover:bg-[var(--sage)]/90 text-white"
            >
              {saving ? "Salvando..." : editingGift ? "Salvar Alterações" : "Adicionar Presente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmar exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir presente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O presente será removido permanentemente da lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
