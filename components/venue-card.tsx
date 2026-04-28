"use client";

import { useState } from "react";
import { useVenues } from "@/lib/venue-context";
import type { Venue } from "@/lib/types";
import { getIcon } from "@/lib/icon-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  Edit3,
  Trash2,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Paperclip,
} from "lucide-react";
import { VenueFormDialog } from "./venue-form-dialog";
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
import { VenueAttachmentsDialog } from "./venue-attachments";

interface VenueCardProps {
  venue: Venue;
  isBest: boolean;
}

export function VenueCard({ venue, isBest }: VenueCardProps) {
  const { deleteVenue, toggleVenueHidden, benefits } = useVenues();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  const pricePerPerson = venue.capacity > 0 ? venue.price / venue.capacity : 0;
  const pricePerBenefit =
    venue.benefits.length > 0 ? venue.price / venue.benefits.length : 0;

  const handleDelete = async () => {
    await deleteVenue(venue.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <div
        className={`relative flex flex-col rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
          isBest
            ? "border-gold ring-2 ring-gold/20"
            : "border-border"
        } ${venue.hidden ? "opacity-60" : ""}`}
      >
        {/* Best choice badge */}
        {isBest && !venue.hidden && (
          <div className="absolute -top-3 left-4 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-card">
              <Award className="h-3 w-3" />
              Melhor Escolha
            </span>
          </div>
        )}

        {/* Hidden badge */}
        {venue.hidden && (
          <div className="absolute -top-3 left-4 z-10">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <EyeOff className="h-3 w-3" />
              Oculto
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-foreground">
              {venue.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                R$ {venue.price.toLocaleString("pt-BR")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {venue.capacity} convidados
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleVenueHidden(venue.id)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              aria-label={venue.hidden ? `Exibir ${venue.name}` : `Ocultar ${venue.name}`}
              title={venue.hidden ? "Exibir local" : "Ocultar local"}
            >
              {venue.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAttachmentsOpen(true)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              aria-label={`Anexos de ${venue.name}`}
              title="Anexos"
            >
              <Paperclip className="h-4 w-4" />
              {venue.attachments.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {venue.attachments.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              aria-label={`Editar ${venue.name}`}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              aria-label={`Excluir ${venue.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Benefits grid */}
        <div className="flex-1 px-5 pb-3">
          <div className="flex flex-wrap gap-1.5">
            {benefits.map((benefit) => {
              const included = venue.benefits.includes(benefit.id);
              return (
                <Badge
                  key={benefit.id}
                  variant={included ? "default" : "secondary"}
                  className={`text-xs ${
                    included
                      ? "border-transparent bg-success text-success-foreground"
                      : "border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  {included ? (
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                  ) : (
                    <XCircle className="mr-1 h-3 w-3" />
                  )}
                  {benefit.label}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Footer with calculations */}
        <div className="border-t border-border px-5 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Preco / Pessoa
              </p>
              <p className="text-sm font-semibold text-foreground">
                R$ {pricePerPerson.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Preco / Beneficio
              </p>
              <p className="text-sm font-semibold text-foreground">
                R$ {pricePerBenefit.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <VenueFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editingVenue={venue}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir Local</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{venue.name}</strong>? Essa
              acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <VenueAttachmentsDialog
        venueId={venue.id}
        venueName={venue.name}
        attachments={venue.attachments}
        open={attachmentsOpen}
        onOpenChange={setAttachmentsOpen}
      />
    </>
  );
}
