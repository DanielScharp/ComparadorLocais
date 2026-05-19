"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import useSWR, { mutate as globalMutate } from "swr";
import type { Venue, Benefit, SortMode, Attachment } from "@/lib/types";
import { toast } from "sonner";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  // Ensure we always return an array for venues and benefits
  return Array.isArray(data) ? data : [];
};

interface VenueContextType {
  venues: Venue[];
  addVenue: (venue: Omit<Venue, "id" | "attachments">) => Promise<void>;
  updateVenue: (id: string, venue: Omit<Venue, "id" | "attachments">) => Promise<void>;
  deleteVenue: (id: string) => Promise<void>;
  toggleVenueHidden: (id: string) => Promise<void>;
  importVenues: (venues: Omit<Venue, "id" | "attachments">[]) => Promise<{ imported: number; errors: string[] }>;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  maxPriceFilter: number | null;
  setMaxPriceFilter: (price: number | null) => void;
  benefitFilters: string[];
  setBenefitFilters: (benefits: string[]) => void;
  showHiddenVenues: boolean;
  setShowHiddenVenues: (show: boolean) => void;
  filteredVenues: Venue[];
  bestVenueId: string | null;
  benefits: Benefit[];
  addBenefit: (benefit: Omit<Benefit, "id">) => Promise<void>;
  updateBenefit: (id: string, benefit: Omit<Benefit, "id">) => Promise<void>;
  deleteBenefit: (id: string) => Promise<void>;
  uploadAttachment: (venueId: string, file: File) => Promise<Attachment | null>;
  deleteAttachment: (venueId: string, attachmentId: string) => Promise<void>;
  isLoadingVenues: boolean;
  isLoadingBenefits: boolean;
}

const VenueContext = createContext<VenueContextType | null>(null);

export function VenueProvider({ children }: { children: ReactNode }) {
  const {
    data: venues = [],
    isLoading: isLoadingVenues,
  } = useSWR<Venue[]>("/api/venues", fetcher);

  const {
    data: benefits = [],
    isLoading: isLoadingBenefits,
  } = useSWR<Benefit[]>("/api/benefits", fetcher);

  const [sortMode, setSortMode] = useState<SortMode>("none");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [benefitFilters, setBenefitFilters] = useState<string[]>([]);
  const [showHiddenVenues, setShowHiddenVenues] = useState(false);

  // ── Venues CRUD ──

  const addVenue = useCallback(async (venue: Omit<Venue, "id" | "attachments">) => {
    const res = await fetch("/api/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(venue),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Erro ao adicionar local");
      return;
    }
    toast.success("Local adicionado com sucesso");
    globalMutate("/api/venues");
  }, []);

  const toggleVenueHidden = useCallback(async (id: string) => {
    const res = await fetch(`/api/venues/${id}/toggle-hidden`, {
      method: "PATCH",
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Erro ao alterar visibilidade");
      return;
    }
    globalMutate("/api/venues");
  }, []);

  const updateVenue = useCallback(
    async (id: string, venue: Omit<Venue, "id" | "attachments">) => {
      const res = await fetch(`/api/venues/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venue),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Erro ao atualizar local");
        return;
      }
      toast.success("Local atualizado com sucesso");
      globalMutate("/api/venues");
    },
    []
  );

  const importVenues = useCallback(async (venuesToImport: Omit<Venue, "id" | "attachments">[]) => {
    const errors: string[] = [];
    let imported = 0;

    for (const venue of venuesToImport) {
      const res = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(venue),
      });
      if (!res.ok) {
        const err = await res.json();
        errors.push(`"${venue.name}": ${err.error || "Erro desconhecido"}`);
      } else {
        imported++;
      }
    }

    if (imported > 0) {
      toast.success(`${imported} local(is) importado(s) com sucesso`);
      globalMutate("/api/venues");
    }
    if (errors.length > 0) {
      toast.error(`${errors.length} local(is) com erro na importacao`);
    }

    return { imported, errors };
  }, []);

  const deleteVenue = useCallback(async (id: string) => {
    const res = await fetch(`/api/venues/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Erro ao excluir local");
      return;
    }
    toast.success("Local excluido com sucesso");
    globalMutate("/api/venues");
  }, []);

  // ── Benefits CRUD ──

  const addBenefit = useCallback(async (benefit: Omit<Benefit, "id">) => {
    try {
      const res = await fetch("/api/benefits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(benefit),
      });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { error: "Erro ao adicionar beneficio" };
        toast.error(err.error || "Erro ao adicionar beneficio");
        return;
      }
      toast.success("Beneficio adicionado com sucesso");
      globalMutate("/api/benefits");
    } catch (error) {
      toast.error("Erro ao adicionar beneficio");
    }
  }, []);

  const updateBenefit = useCallback(
    async (id: string, benefit: Omit<Benefit, "id">) => {
      try {
        const res = await fetch(`/api/benefits/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(benefit),
        });
        if (!res.ok) {
          const text = await res.text();
          const err = text ? JSON.parse(text) : { error: "Erro ao atualizar beneficio" };
          toast.error(err.error || "Erro ao atualizar beneficio");
          return;
        }
        toast.success("Beneficio atualizado com sucesso");
        globalMutate("/api/benefits");
      } catch (error) {
        toast.error("Erro ao atualizar beneficio");
      }
    },
    []
  );

  const deleteBenefit = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/benefits/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const text = await res.text();
          const err = text ? JSON.parse(text) : { error: "Erro ao excluir beneficio" };
          toast.error(err.error || "Erro ao excluir beneficio");
          return;
        }
        toast.success("Beneficio excluido com sucesso");
        // Remove from active filters
        setBenefitFilters((prev) => prev.filter((bid) => bid !== id));
        globalMutate("/api/benefits");
        globalMutate("/api/venues");
      } catch (error) {
        toast.error("Erro ao excluir beneficio");
      }
    },
    []
  );

  const uploadAttachment = useCallback(async (venueId: string, file: File): Promise<Attachment | null> => {
    try {
      // First upload to blob storage
      const formData = new FormData();
      formData.append("file", file);
      formData.append("venueId", venueId);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const text = await uploadRes.text();
        const err = text ? JSON.parse(text) : { error: "Erro no upload do arquivo" };
        toast.error(err.error || "Erro no upload do arquivo");
        return null;
      }

      const uploadData = await uploadRes.json();

    // Then save attachment reference to database
    const attachRes = await fetch(`/api/venues/${venueId}/attachments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: uploadData.fileName,
        url: uploadData.url,
        type: uploadData.fileType,
        size: uploadData.fileSize,
      }),
    });

      if (!attachRes.ok) {
        const text = await attachRes.text();
        const err = text ? JSON.parse(text) : { error: "Erro ao salvar anexo" };
        toast.error(err.error || "Erro ao salvar anexo");
        return null;
      }

      const attachment = await attachRes.json();
      toast.success("Arquivo anexado com sucesso");
      globalMutate("/api/venues");
      return attachment;
    } catch (error) {
      toast.error("Erro ao processar arquivo");
      return null;
    }
  }, []);

  const deleteAttachment = useCallback(async (venueId: string, attachmentId: string) => {
    const res = await fetch(`/api/venues/${venueId}/attachments?attachmentId=${attachmentId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Erro ao excluir anexo");
      return;
    }

    toast.success("Anexo excluido com sucesso");
    globalMutate("/api/venues");
  }, []);

  // ── Derived data ──

  const filteredVenues = venues
    .filter((v) => {
      // Filter hidden venues unless showHiddenVenues is true
      if (!showHiddenVenues && v.hidden) return false;
      if (maxPriceFilter !== null && v.price > maxPriceFilter) return false;
      if (benefitFilters.length > 0) {
        return benefitFilters.every((b) => v.benefits.includes(b));
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortMode) {
        case "best-cost-benefit":
          return b.benefits.length - a.benefits.length || a.price - b.price;
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const bestVenueId =
    filteredVenues.length > 0
      ? [...filteredVenues].sort(
          (a, b) =>
            b.benefits.length / b.price - a.benefits.length / a.price
        )[0].id
      : null;

  return (
    <VenueContext.Provider
      value={{
        venues,
        addVenue,
        updateVenue,
        deleteVenue,
        toggleVenueHidden,
        importVenues,
        sortMode,
        setSortMode,
        maxPriceFilter,
        setMaxPriceFilter,
        benefitFilters,
        setBenefitFilters,
        showHiddenVenues,
        setShowHiddenVenues,
        filteredVenues,
        bestVenueId,
        benefits,
        addBenefit,
        updateBenefit,
        deleteBenefit,
        uploadAttachment,
        deleteAttachment,
        isLoadingVenues,
        isLoadingBenefits,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
}

export function useVenues() {
  const context = useContext(VenueContext);
  if (!context) throw new Error("useVenues must be used within VenueProvider");
  return context;
}
