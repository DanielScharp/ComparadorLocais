"use client";

import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddVenue: () => void;
}

export function EmptyState({ onAddVenue }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage-light">
        <Heart className="h-8 w-8 text-sage" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Nenhum local encontrado
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Adicione locais de casamento para comecar a comparar precos, beneficios
        e encontrar a melhor opcao.
      </p>
      <Button
        onClick={onAddVenue}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Primeiro Local
      </Button>
    </div>
  );
}
