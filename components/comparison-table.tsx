"use client";

import { useVenues } from "@/lib/venue-context";
import {
  CheckCircle2,
  XCircle,
  Award,
  DollarSign,
  Users,
} from "lucide-react";

export function ComparisonTable() {
  const { filteredVenues, bestVenueId, benefits } = useVenues();

  if (filteredVenues.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary">
            <th className="sticky left-0 z-10 bg-secondary px-4 py-3 text-left font-semibold text-foreground">
              Local
            </th>
            {filteredVenues.map((v) => (
              <th
                key={v.id}
                className={`min-w-[160px] px-4 py-3 text-center font-semibold text-foreground ${
                  v.id === bestVenueId ? "bg-gold-light" : ""
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  {v.id === bestVenueId && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-card">
                      <Award className="h-2.5 w-2.5" />
                      Melhor
                    </span>
                  )}
                  <span className="text-balance">{v.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price row */}
          <tr className="border-b border-border">
            <td className="sticky left-0 z-10 bg-card px-4 py-3 font-medium text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-sage" />
                Valor
              </span>
            </td>
            {filteredVenues.map((v) => (
              <td
                key={v.id}
                className={`px-4 py-3 text-center font-medium text-foreground ${
                  v.id === bestVenueId ? "bg-gold-light/50" : ""
                }`}
              >
                R$ {v.price.toLocaleString("pt-BR")}
              </td>
            ))}
          </tr>

          {/* Capacity row */}
          <tr className="border-b border-border">
            <td className="sticky left-0 z-10 bg-card px-4 py-3 font-medium text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-sage" />
                Capacidade
              </span>
            </td>
            {filteredVenues.map((v) => (
              <td
                key={v.id}
                className={`px-4 py-3 text-center text-foreground ${
                  v.id === bestVenueId ? "bg-gold-light/50" : ""
                }`}
              >
                {v.capacity}
              </td>
            ))}
          </tr>

          {/* Price per person */}
          <tr className="border-b border-border">
            <td className="sticky left-0 z-10 bg-card px-4 py-3 font-medium text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-sage" />
                Preco / Pessoa
              </span>
            </td>
            {filteredVenues.map((v) => {
              const pp = v.capacity > 0 ? v.price / v.capacity : 0;
              return (
                <td
                  key={v.id}
                  className={`px-4 py-3 text-center text-foreground ${
                    v.id === bestVenueId ? "bg-gold-light/50" : ""
                  }`}
                >
                  R$ {pp.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </td>
              );
            })}
          </tr>

          {/* Price per benefit */}
          <tr className="border-b border-border">
            <td className="sticky left-0 z-10 bg-card px-4 py-3 font-medium text-foreground">
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-sage" />
                Preco / Beneficio
              </span>
            </td>
            {filteredVenues.map((v) => {
              const pb = v.benefits.length > 0 ? v.price / v.benefits.length : 0;
              return (
                <td
                  key={v.id}
                  className={`px-4 py-3 text-center text-foreground ${
                    v.id === bestVenueId ? "bg-gold-light/50" : ""
                  }`}
                >
                  R$ {pb.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                </td>
              );
            })}
          </tr>

          {/* Benefit check rows */}
          {benefits.map((benefit, i) => (
            <tr
              key={benefit.id}
              className={
                i < benefits.length - 1 ? "border-b border-border" : ""
              }
            >
              <td className="sticky left-0 z-10 bg-card px-4 py-3 font-medium text-foreground">
                {benefit.label}
              </td>
              {filteredVenues.map((v) => {
                const included = v.benefits.includes(benefit.id);
                return (
                  <td
                    key={v.id}
                    className={`px-4 py-3 text-center ${
                      v.id === bestVenueId ? "bg-gold-light/50" : ""
                    }`}
                  >
                    {included ? (
                      <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="mx-auto h-5 w-5 text-muted-foreground/40" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* Total benefits row */}
          <tr className="border-t-2 border-border bg-secondary">
            <td className="sticky left-0 z-10 bg-secondary px-4 py-3 font-semibold text-foreground">
              Total de Beneficios
            </td>
            {filteredVenues.map((v) => (
              <td
                key={v.id}
                className={`px-4 py-3 text-center font-semibold text-foreground ${
                  v.id === bestVenueId ? "bg-gold-light" : ""
                }`}
              >
                {v.benefits.length} / {benefits.length}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
