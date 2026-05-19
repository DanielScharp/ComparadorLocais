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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Guest } from "@/lib/types";

interface GuestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  familyId: string;
  editGuest?: Guest | null;
}

export function GuestFormDialog({
  open,
  onOpenChange,
  familyId,
  editGuest,
}: GuestFormDialogProps) {
  const { addGuest, updateGuest } = useGuests();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [isMainGuest, setIsMainGuest] = useState(false);
  const [confirmed, setConfirmed] = useState<"pending" | "yes" | "no">("pending");
  const [notes, setNotes] = useState("");

  const isEditing = !!editGuest;

  useEffect(() => {
    if (editGuest) {
      setName(editGuest.name);
      setIsMainGuest(editGuest.is_main_guest);
      setConfirmed(
        editGuest.confirmed === true
          ? "yes"
          : editGuest.confirmed === false
          ? "no"
          : "pending"
      );
      setNotes(editGuest.notes || "");
    } else {
      resetForm();
    }
  }, [editGuest, open]);

  function resetForm() {
    setName("");
    setIsMainGuest(false);
    setConfirmed("pending");
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const confirmedValue =
        confirmed === "yes" ? true : confirmed === "no" ? false : null;

      if (isEditing && editGuest) {
        await updateGuest(editGuest.id, {
          name: name.trim(),
          is_main_guest: isMainGuest,
          confirmed: confirmedValue,
          notes: notes.trim() || undefined,
        });
      } else {
        await addGuest(familyId, {
          name: name.trim(),
          is_main_guest: isMainGuest,
          notes: notes.trim() || undefined,
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
            {isEditing ? "Editar Convidado" : "Adicionar Convidado"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite as informações do convidado."
              : "Adicione um novo membro à família."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">Nome</Label>
            <Input
              id="guestName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Maria Silva"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="mainGuest"
              checked={isMainGuest}
              onCheckedChange={(checked) => setIsMainGuest(checked === true)}
            />
            <Label htmlFor="mainGuest" className="cursor-pointer">
              Convidado Principal (quem recebe o convite)
            </Label>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="confirmed">Status de Confirmação</Label>
              <Select
                value={confirmed}
                onValueChange={(v) => setConfirmed(v as "pending" | "yes" | "no")}
              >
                <SelectTrigger id="confirmed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="yes">Confirmado</SelectItem>
                  <SelectItem value="no">Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="guestNotes">Observações (opcional)</Label>
            <Textarea
              id="guestNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anotações sobre o convidado..."
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
