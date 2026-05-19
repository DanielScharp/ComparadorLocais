"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import useSWR, { mutate as globalMutate } from "swr";
import { toast } from "sonner";
import type { Family, Guest, GuestSide } from "./types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

interface GuestContextType {
  families: Family[];
  isLoading: boolean;
  error: Error | undefined;
  sideFilter: GuestSide | "all";
  setSideFilter: (side: GuestSide | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Stats
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  noivosGuests: number;
  noivasGuests: number;
  
  // Family actions
  addFamily: (family: {
    name: string;
    side: GuestSide;
    max_guests: number;
    notes?: string;
    main_guest_name?: string;
  }) => Promise<void>;
  updateFamily: (id: string, family: {
    name: string;
    side: GuestSide;
    max_guests: number;
    notes?: string;
  }) => Promise<void>;
  deleteFamily: (id: string) => Promise<void>;
  
  // Guest actions
  addGuest: (familyId: string, guest: {
    name: string;
    is_main_guest?: boolean;
    notes?: string;
  }) => Promise<void>;
  updateGuest: (id: string, guest: {
    name: string;
    is_main_guest?: boolean;
    confirmed?: boolean | null;
    notes?: string;
  }) => Promise<void>;
  deleteGuest: (id: string) => Promise<void>;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const { data: families = [], isLoading, error } = useSWR<Family[]>(
    "/api/families",
    fetcher
  );

  const [sideFilter, setSideFilter] = useState<GuestSide | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate stats
  const allGuests = families.flatMap((f) => f.guests || []);
  const totalGuests = allGuests.length;
  const confirmedGuests = allGuests.filter((g) => g.confirmed === true).length;
  const declinedGuests = allGuests.filter((g) => g.confirmed === false).length;
  const pendingGuests = allGuests.filter((g) => g.confirmed === null).length;
  
  const noivosGuests = families
    .filter((f) => f.side === "noivo")
    .flatMap((f) => f.guests || []).length;
  const noivasGuests = families
    .filter((f) => f.side === "noiva")
    .flatMap((f) => f.guests || []).length;

  // Family actions
  const addFamily = useCallback(async (family: {
    name: string;
    side: GuestSide;
    max_guests: number;
    notes?: string;
    main_guest_name?: string;
  }) => {
    try {
      const res = await fetch("/api/families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(family),
      });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { error: "Erro ao adicionar família" };
        toast.error(err.error || "Erro ao adicionar família");
        return;
      }
      toast.success("Família adicionada com sucesso");
      globalMutate("/api/families");
    } catch (error) {
      toast.error("Erro ao adicionar família");
    }
  }, []);

  const updateFamily = useCallback(async (id: string, family: {
    name: string;
    side: GuestSide;
    max_guests: number;
    notes?: string;
  }) => {
    try {
      const res = await fetch(`/api/families/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(family),
      });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { error: "Erro ao atualizar família" };
        toast.error(err.error || "Erro ao atualizar família");
        return;
      }
      toast.success("Família atualizada com sucesso");
      globalMutate("/api/families");
    } catch (error) {
      toast.error("Erro ao atualizar família");
    }
  }, []);

  const deleteFamily = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/families/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { error: "Erro ao excluir família" };
        toast.error(err.error || "Erro ao excluir família");
        return;
      }
      toast.success("Família excluída com sucesso");
      globalMutate("/api/families");
    } catch (error) {
      toast.error("Erro ao excluir família");
    }
  }, []);

  // Guest actions
  const addGuest = useCallback(async (familyId: string, guest: {
    name: string;
    is_main_guest?: boolean;
    notes?: string;
  }) => {
    try {
      const res = await fetch(`/api/families/${familyId}/guests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guest),
      });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { error: "Erro ao adicionar convidado" };
        toast.error(err.error || "Erro ao adicionar convidado");
        return;
      }
      toast.success("Convidado adicionado com sucesso");
      globalMutate("/api/families");
    } catch (error) {
      toast.error("Erro ao adicionar convidado");
    }
  }, []);

  const updateGuest = useCallback(async (id: string, guest: {
    name: string;
    is_main_guest?: boolean;
    confirmed?: boolean | null;
    notes?: string;
  }) => {
    try {
      const res = await fetch(`/api/guests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guest),
      });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { error: "Erro ao atualizar convidado" };
        toast.error(err.error || "Erro ao atualizar convidado");
        return;
      }
      toast.success("Convidado atualizado com sucesso");
      globalMutate("/api/families");
    } catch (error) {
      toast.error("Erro ao atualizar convidado");
    }
  }, []);

  const deleteGuest = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/guests/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : { error: "Erro ao excluir convidado" };
        toast.error(err.error || "Erro ao excluir convidado");
        return;
      }
      toast.success("Convidado excluído com sucesso");
      globalMutate("/api/families");
    } catch (error) {
      toast.error("Erro ao excluir convidado");
    }
  }, []);

  return (
    <GuestContext.Provider
      value={{
        families,
        isLoading,
        error,
        sideFilter,
        setSideFilter,
        searchQuery,
        setSearchQuery,
        totalGuests,
        confirmedGuests,
        pendingGuests,
        declinedGuests,
        noivosGuests,
        noivasGuests,
        addFamily,
        updateFamily,
        deleteFamily,
        addGuest,
        updateGuest,
        deleteGuest,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
}

export function useGuests() {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error("useGuests must be used within a GuestProvider");
  }
  return context;
}
