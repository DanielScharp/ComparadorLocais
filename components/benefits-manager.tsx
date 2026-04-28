"use client";

import { useState, useTransition } from "react";
import { useVenues } from "@/lib/venue-context";
import { AVAILABLE_ICONS } from "@/lib/types";
import { getIcon, iconMap } from "@/lib/icon-map";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit3, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

interface BenefitsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BenefitsManager({ open, onOpenChange }: BenefitsManagerProps) {
  const { benefits, addBenefit, updateBenefit, deleteBenefit, venues } = useVenues();

  const [formMode, setFormMode] = useState<"idle" | "add" | "edit">("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Sparkles");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setFormMode("idle");
    setEditingId(null);
    setLabel("");
    setSelectedIcon("Sparkles");
  };

  const handleStartAdd = () => {
    resetForm();
    setFormMode("add");
  };

  const handleStartEdit = (id: string) => {
    const benefit = benefits.find((b) => b.id === id);
    if (!benefit) return;
    setFormMode("edit");
    setEditingId(id);
    setLabel(benefit.label);
    setSelectedIcon(benefit.icon);
  };

  const handleSave = () => {
    const trimmed = label.trim();
    if (!trimmed) return;

    startTransition(async () => {
      if (formMode === "add") {
        await addBenefit({ label: trimmed, icon: selectedIcon });
      } else if (formMode === "edit" && editingId) {
        await updateBenefit(editingId, { label: trimmed, icon: selectedIcon });
      }
      resetForm();
    });
  };

  const handleDelete = (id: string) => {
    const benefit = benefits.find((b) => b.id === id);
    startTransition(async () => {
      await deleteBenefit(id);
      setDeleteConfirm(null);
      if (editingId === id) resetForm();
    });
  };

  const getUsageCount = (benefitId: string) => {
    return venues.filter((v) => v.benefits.includes(benefitId)).length;
  };

  const benefitToDelete = benefits.find((b) => b.id === deleteConfirm);

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) resetForm(); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Gerenciar Beneficios</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova tipos de beneficios. Alteracoes afetam todos os locais.
            </DialogDescription>
          </DialogHeader>

          {/* Existing benefits list */}
          <div className="flex flex-col gap-2">
            {benefits.map((benefit) => {
              const Icon = getIcon(benefit.icon);
              const usage = getUsageCount(benefit.id);
              return (
                <div
                  key={benefit.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    editingId === benefit.id
                      ? "border-primary bg-sage-light"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{benefit.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Usado em {usage} {usage === 1 ? "local" : "locais"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(benefit.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      aria-label={`Editar ${benefit.label}`}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(benefit.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      aria-label={`Excluir ${benefit.label}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {benefits.length === 0 && (
              <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum beneficio cadastrado. Adicione um abaixo.
                </p>
              </div>
            )}
          </div>

          {/* Add / Edit form */}
          {formMode !== "idle" ? (
            <div className="rounded-lg border border-border bg-secondary p-4">
              <p className="mb-3 text-sm font-medium text-foreground">
                {formMode === "add" ? "Novo Beneficio" : "Editar Beneficio"}
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="benefit-label" className="text-foreground text-xs">
                    Nome
                  </Label>
                  <Input
                    id="benefit-label"
                    placeholder="Ex: Valet, Cerimonialista..."
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-card text-foreground placeholder:text-muted-foreground"
                    onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-foreground text-xs">Icone</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_ICONS.map((iconName) => {
                      const Ic = iconMap[iconName];
                      if (!Ic) return null;
                      const isSelected = selectedIcon === iconName;
                      return (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setSelectedIcon(iconName)}
                          className={`relative flex h-9 w-9 items-center justify-center rounded-md border transition-colors ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          aria-label={iconName}
                        >
                          <Ic className="h-4 w-4" />
                          {isSelected && (
                            <Check className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary text-primary-foreground" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                    className="text-foreground"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSave}
                    disabled={!label.trim() || isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isPending ? "Salvando..." : formMode === "add" ? "Adicionar" : "Salvar"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleStartAdd}
              className="w-full text-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Beneficio
            </Button>
          )}

          <DialogFooter>
            <Button
              type="button"
              onClick={() => { onOpenChange(false); resetForm(); }}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Concluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(v) => { if (!v) setDeleteConfirm(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir Beneficio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{benefitToDelete?.label}</strong>?
              {benefitToDelete && getUsageCount(benefitToDelete.id) > 0 && (
                <span className="mt-1 block text-destructive">
                  Este beneficio sera removido de {getUsageCount(benefitToDelete.id)}{" "}
                  {getUsageCount(benefitToDelete.id) === 1 ? "local" : "locais"}.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
