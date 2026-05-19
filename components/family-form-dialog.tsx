"use client";

import { useState, useEffect } from "react";
import { useGuests } from "@/lib/guest-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Family, GuestSide } from "@/lib/types";

interface FamilyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editFamily?: Family | null;
}

export function FamilyFormDialog({
  open,
  onOpenChange,
  editFamily,
}: FamilyFormDialogProps) {
  const { addFamily, updateFamily } = useGuests();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [side, setSide] = useState<GuestSide>("noivo");
  const [maxGuests, setMaxGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [mainGuestName, setMainGuestName] = useState("");

  const isEditing = !!editFamily;

  useEffect(() => {
    if (editFamily) {
      setName(editFamily.name);
      setSide(editFamily.side);
      setMaxGuests(editFamily.max_guests);
      setNotes(editFamily.notes || "");
    } else {
      resetForm();
    }
  }, [editFamily, open]);

  function resetForm() {
    setName("");
    setSide("noivo");
    setMaxGuests(1);
    setNotes("");
    setMainGuestName("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (isEditing && editFamily) {
        await updateFamily(editFamily.id, {
          name: name.trim(),
          side,
          max_guests: maxGuests,
          notes: notes.trim() || undefined,
        });
      } else {
        await addFamily({
          name: name.trim(),
          side,
          max_guests: maxGuests,
          notes: notes.trim() || undefined,
          main_guest_name: mainGuestName.trim() || undefined,
        });
      }
      onOpenChange(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "Editar Família" : "Adicionar Família"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite as informações da família."
              : "Adicione uma nova família à lista de convidados."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Família</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Família Silva"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="side">Lado</Label>
            <Select value={side} onValueChange={(v) => setSide(v as GuestSide)}>
              <SelectTrigger id="side">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="noivo">Noivo</SelectItem>
                <SelectItem value="noiva">Noiva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxGuests">Máximo de Convidados</Label>
            <Input
              id="maxGuests"
              type="number"
              min={1}
              max={20}
              value={maxGuests}
              onChange={(e) => setMaxGuests(parseInt(e.target.value) || 1)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Quantas pessoas podem vir nesta família
            </p>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="mainGuest">Convidado Principal (opcional)</Label>
              <Input
                id="mainGuest"
                value={mainGuestName}
                onChange={(e) => setMainGuestName(e.target.value)}
                placeholder="Ex: Roberto Silva"
              />
              <p className="text-xs text-muted-foreground">
                A pessoa principal que receberá o convite
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações sobre a família..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Salvando..." : isEditing ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
