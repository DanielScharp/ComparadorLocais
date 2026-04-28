"use client";

import { useState } from "react";
import { VenueProvider, useVenues } from "@/lib/venue-context";
import { Header } from "@/components/header";
import { DashboardSummary } from "@/components/dashboard-summary";
import { FiltersBar } from "@/components/filters-bar";
import { VenueCard } from "@/components/venue-card";
import { ComparisonTable } from "@/components/comparison-table";
import { VenueFormDialog } from "@/components/venue-form-dialog";
import { BenefitsManager } from "@/components/benefits-manager";
import { ImportJsonDialog } from "@/components/import-json-dialog";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Table2, Settings2, FileJson } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

function VenueApp() {
  const { filteredVenues, bestVenueId, venues, isLoadingVenues, isLoadingBenefits } = useVenues();
  const [formOpen, setFormOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [view, setView] = useState<"cards" | "table">("cards");

  const isLoading = isLoadingVenues || isLoadingBenefits;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Dashboard */}
        <section className="mb-8">
          <DashboardSummary />
        </section>

        {/* Actions bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground text-balance">
              Comparacao de Locais
            </h2>
            <p className="text-sm text-muted-foreground">
              {filteredVenues.length} de {venues.length} locais
              {filteredVenues.length !== venues.length && " (filtrados)"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as "cards" | "table")}
            >
              <TabsList>
                <TabsTrigger value="cards">
                  <LayoutGrid className="mr-1.5 h-4 w-4" />
                  Cards
                </TabsTrigger>
                <TabsTrigger value="table">
                  <Table2 className="mr-1.5 h-4 w-4" />
                  Tabela
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              onClick={() => setBenefitsOpen(true)}
              className="text-foreground"
            >
              <Settings2 className="mr-1.5 h-4 w-4" />
              Beneficios
            </Button>
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
              className="text-foreground"
            >
              <FileJson className="mr-1.5 h-4 w-4" />
              Importar JSON
            </Button>
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Novo Local
            </Button>
          </div>
        </div>

        {/* Filters */}
        <section className="mb-6">
          <FiltersBar />
        </section>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="mt-4 text-muted-foreground">Carregando dados...</p>
          </div>
        ) : filteredVenues.length === 0 ? (
          <EmptyState onAddVenue={() => setFormOpen(true)} />
        ) : view === "cards" ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                isBest={venue.id === bestVenueId}
              />
            ))}
          </section>
        ) : (
          <section>
            <ComparisonTable />
          </section>
        )}
      </main>

      <VenueFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <BenefitsManager open={benefitsOpen} onOpenChange={setBenefitsOpen} />
      <ImportJsonDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

export default function VenuePage() {
  return (
    <VenueProvider>
      <VenueApp />
    </VenueProvider>
  );
}
