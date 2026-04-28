"use client";

import { useVenues } from "@/lib/venue-context";
import {
  DollarSign,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";

export function DashboardSummary() {
  const { filteredVenues, bestVenueId, benefits } = useVenues();

  const totalVenues = filteredVenues.length;
  const avgPrice =
    totalVenues > 0
      ? filteredVenues.reduce((sum, v) => sum + v.price, 0) / totalVenues
      : 0;
  const totalCapacity = filteredVenues.reduce((sum, v) => sum + v.capacity, 0);
  const bestVenue = filteredVenues.find((v) => v.id === bestVenueId);

  const stats = [
    {
      label: "Locais Cadastrados",
      value: totalVenues.toString(),
      icon: TrendingUp,
      description: "na comparacao",
    },
    {
      label: "Preco Medio",
      value: `R$ ${avgPrice.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      description: "entre os locais",
    },
    {
      label: "Capacidade Total",
      value: `${totalCapacity.toLocaleString("pt-BR")}`,
      icon: Users,
      description: "convidados",
    },
    {
      label: "Melhor Escolha",
      value: bestVenue?.name ?? "-",
      icon: Award,
      description: bestVenue
        ? `${bestVenue.benefits.length} de ${benefits.length} beneficios`
        : "adicione locais",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage-light">
            <stat.icon className="h-5 w-5 text-sage" />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="truncate text-lg font-semibold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
