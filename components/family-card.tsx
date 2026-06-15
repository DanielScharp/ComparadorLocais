"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useGuests } from "@/lib/guest-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import {
  Users,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  Check,
  X,
  Clock,
  Link2,
  Gift,
} from "lucide-react";
import { FamilyFormDialog } from "./family-form-dialog";
import { GuestFormDialog } from "./guest-form-dialog";
import type { Family, Guest } from "@/lib/types";

interface FamilyCardProps {
  family: Family;
}

export function FamilyCard({ family }: FamilyCardProps) {
  const { deleteFamily, deleteGuest, updateGuest } = useGuests();
  const [editFamilyOpen, setEditFamilyOpen] = useState(false);
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteGuestId, setDeleteGuestId] = useState<string | null>(null);

  const guests = family.guests || [];
  const guestCount = guests.length;
  const confirmedCount = guests.filter((g) => g.confirmed === true).length;
  const canAddMore = guestCount < family.max_guests;

  function handleCopyLink() {
    const url = `${window.location.origin}/convite/${family.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copiado! Envie para a família.");
    });
  }

  async function handleDeleteFamily() {
    await deleteFamily(family.id);
    setDeleteConfirmOpen(false);
  }

  async function handleDeleteGuest() {
    if (deleteGuestId) {
      await deleteGuest(deleteGuestId);
      setDeleteGuestId(null);
    }
  }

  async function handleToggleConfirmation(guest: Guest, confirmed: boolean | null) {
    await updateGuest(guest.id, {
      name: guest.name,
      is_main_guest: guest.is_main_guest,
      confirmed,
      notes: guest.notes || undefined,
    });
  }

  function getStatusIcon(confirmed: boolean | null) {
    if (confirmed === true) {
      return <Check className="h-4 w-4 text-emerald-600" />;
    }
    if (confirmed === false) {
      return <X className="h-4 w-4 text-red-600" />;
    }
    return <Clock className="h-4 w-4 text-amber-600" />;
  }

  function getStatusBadge(confirmed: boolean | null) {
    if (confirmed === true) {
      return <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">Confirmado</Badge>;
    }
    if (confirmed === false) {
      return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">Recusado</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">Pendente</Badge>;
  }

  return (
    <>
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg text-foreground">{family.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    family.side === "noivo"
                      ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400"
                      : "border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-700 dark:bg-pink-950 dark:text-pink-400"
                  }
                >
                  {family.side === "noivo" ? "Noivo" : "Noiva"}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {guestCount}/{family.max_guests}
                </span>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link2 className="mr-2 h-4 w-4" />
                  Copiar link do convite
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`/presentes/${family.id}`} target="_blank" rel="noreferrer">
                    <Gift className="mr-2 h-4 w-4" />
                    Ver lista de presentes
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setAddGuestOpen(true)}
                  disabled={!canAddMore}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Convidado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditFamilyOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Família
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir Família
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {guests.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Nenhum convidado adicionado
            </p>
          ) : (
            <ul className="space-y-2">
              {guests.map((guest) => (
                <li
                  key={guest.id}
                  className="flex items-center justify-between rounded-lg bg-secondary/50 p-2"
                >
                  <div className="flex items-center gap-2">
                    {guest.is_main_guest && (
                      <Crown className="h-4 w-4 text-amber-500" title="Convidado Principal" />
                    )}
                    <span className="text-sm text-foreground">{guest.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(guest.confirmed)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleToggleConfirmation(guest, true)}
                        >
                          <Check className="mr-2 h-4 w-4 text-emerald-600" />
                          Marcar Confirmado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleConfirmation(guest, false)}
                        >
                          <X className="mr-2 h-4 w-4 text-red-600" />
                          Marcar Recusado
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleConfirmation(guest, null)}
                        >
                          <Clock className="mr-2 h-4 w-4 text-amber-600" />
                          Marcar Pendente
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setEditGuest(guest)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteGuestId(guest.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {canAddMore && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setAddGuestOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Convidado ({guestCount}/{family.max_guests})
            </Button>
          )}

          {family.notes && (
            <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
              {family.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <FamilyFormDialog
        open={editFamilyOpen}
        onOpenChange={setEditFamilyOpen}
        editFamily={family}
      />

      <GuestFormDialog
        open={addGuestOpen || !!editGuest}
        onOpenChange={(open) => {
          if (!open) {
            setAddGuestOpen(false);
            setEditGuest(null);
          }
        }}
        familyId={family.id}
        editGuest={editGuest}
      />

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir Família</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a família <strong>{family.name}</strong>?
              Todos os convidados desta família também serão excluídos.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFamily}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteGuestId} onOpenChange={() => setDeleteGuestId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir Convidado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este convidado?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGuest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
