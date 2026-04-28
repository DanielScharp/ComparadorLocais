"use client";

import { useState, useTransition } from "react";
import { useVenues } from "@/lib/venue-context";
import type { Venue } from "@/lib/types";
import { getIcon } from "@/lib/icon-map";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface VenueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingVenue?: Venue | null;
}

export function VenueFormDialog({
  open,
  onOpenChange,
  editingVenue,
}: VenueFormDialogProps) {
  const { addVenue, updateVenue, benefits } = useVenues();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(editingVenue?.name ?? "");
  const [price, setPrice] = useState(editingVenue?.price?.toString() ?? "");
  const [capacity, setCapacity] = useState(
    editingVenue?.capacity?.toString() ?? ""
  );
  const [selectedBenefits, setSelectedBenefits] = useState<string[]>(
    editingVenue?.benefits ?? []
  );

  const resetForm = () => {
    if (!editingVenue) {
      setName("");
      setPrice("");
      setCapacity("");
      setSelectedBenefits([]);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && editingVenue) {
      setName(editingVenue.name);
      setPrice(editingVenue.price.toString());
      setCapacity(editingVenue.capacity.toString());
      setSelectedBenefits(editingVenue.benefits);
    }
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const toggleBenefit = (id: string) => {
    setSelectedBenefits((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const venueData = {
      name: name.trim(),
      price: Number(price),
      capacity: Number(capacity),
      benefits: selectedBenefits,
    };

    startTransition(async () => {
      if (editingVenue) {
        await updateVenue(editingVenue.id, venueData);
      } else {
        await addVenue(venueData);
      }
      resetForm();
      onOpenChange(false);
    });
  };

  const isValid = name.trim() && Number(price) > 0 && Number(capacity) > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {editingVenue ? "Editar Local" : "Novo Local"}
          </DialogTitle>
          <DialogDescription>
            {editingVenue
              ? "Atualize as informacoes do local de casamento."
              : "Preencha os dados do novo local de casamento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="venue-name" className="text-foreground">Nome do Local</Label>
            <Input
              id="venue-name"
              placeholder="Ex: Villa Toscana"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="venue-price" className="text-foreground">Valor (R$)</Label>
              <Input
                id="venue-price"
                type="number"
                min={0}
                placeholder="Ex: 45000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="venue-capacity" className="text-foreground">Capacidade</Label>
              <Input
                id="venue-capacity"
                type="number"
                min={1}
                placeholder="Ex: 200"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label className="text-foreground">Beneficios Inclusos</Label>
            {benefits.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-dashed border-border px-4 py-6 text-center">
                Nenhum beneficio cadastrado. Acesse "Gerenciar Beneficios" para criar.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {benefits.map((benefit) => {
                  const Icon = getIcon(benefit.icon);
                  const checked = selectedBenefits.includes(benefit.id);
                  return (
                    <label
                      key={benefit.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                        checked
                          ? "border-primary bg-sage-light"
                          : "border-border bg-card hover:bg-secondary"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleBenefit(benefit.id)}
                      />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{benefit.label}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Salvando..." : editingVenue ? "Salvar Alteracoes" : "Adicionar Local"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
