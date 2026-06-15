"use client";

import { useState, useMemo } from "react";
import { useGuests } from "@/lib/guest-context";
import { GuestStats } from "@/components/guest-stats";
import { FamilyCard } from "@/components/family-card";
import { FamilyFormDialog } from "@/components/family-form-dialog";
import { ImportGuestsJsonDialog } from "@/components/import-guests-json-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Search, Users, FileJson } from "lucide-react";
import type { GuestSide } from "@/lib/types";

export function GuestList() {
  const {
    families,
    isLoading,
    sideFilter,
    setSideFilter,
    searchQuery,
    setSearchQuery,
  } = useGuests();
  const [addFamilyOpen, setAddFamilyOpen] = useState(false);
  const [importJsonOpen, setImportJsonOpen] = useState(false);

  const filteredFamilies = useMemo(() => {
    let result = families;

    // Filter by side
    if (sideFilter !== "all") {
      result = result.filter((f) => f.side === sideFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((f) => {
        // Check family name
        if (f.name.toLowerCase().includes(query)) return true;
        // Check guest names
        if (f.guests?.some((g) => g.name.toLowerCase().includes(query))) return true;
        return false;
      });
    }

    return result;
  }, [families, sideFilter, searchQuery]);

  const noivosCount = families.filter((f) => f.side === "noivo").length;
  const noivasCount = families.filter((f) => f.side === "noiva").length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando convidados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <GuestStats />

      {/* Actions bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
            Lista de Famílias
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredFamilies.length} de {families.length} famílias
            {filteredFamilies.length !== families.length && " (filtradas)"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setImportJsonOpen(true)}
            variant="outline"
          >
            <FileJson className="mr-1.5 h-4 w-4" />
            Importar JSON
          </Button>
          <Button
            onClick={() => setAddFamilyOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nova Família
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs
          value={sideFilter}
          onValueChange={(v) => setSideFilter(v as GuestSide | "all")}
        >
          <TabsList>
            <TabsTrigger value="all">
              <Users className="mr-1.5 h-4 w-4" />
              Todos ({families.length})
            </TabsTrigger>
            <TabsTrigger value="noivo" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950 dark:data-[state=active]:text-blue-400">
              Noivo ({noivosCount})
            </TabsTrigger>
            <TabsTrigger value="noiva" className="data-[state=active]:bg-pink-100 data-[state=active]:text-pink-700 dark:data-[state=active]:bg-pink-950 dark:data-[state=active]:text-pink-400">
              Noiva ({noivasCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Family cards */}
      {filteredFamilies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-12">
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            Nenhuma família encontrada
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || sideFilter !== "all"
              ? "Tente ajustar os filtros de busca."
              : "Adicione a primeira família para começar."}
          </p>
          {!searchQuery && sideFilter === "all" && (
            <Button className="mt-4" onClick={() => setAddFamilyOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Adicionar Família
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredFamilies.map((family) => (
            <FamilyCard key={family.id} family={family} />
          ))}
        </div>
      )}

      <FamilyFormDialog open={addFamilyOpen} onOpenChange={setAddFamilyOpen} />
      <ImportGuestsJsonDialog open={importJsonOpen} onOpenChange={setImportJsonOpen} />
    </div>
  );
}
