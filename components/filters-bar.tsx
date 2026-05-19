"use client";

import { useVenues } from "@/lib/venue-context";
import type { SortMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ArrowUp,
  ArrowDown,
  Award,
  SlidersHorizontal,
  X,
  EyeOff,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function FiltersBar() {
  const {
    venues,
    sortMode,
    setSortMode,
    maxPriceFilter,
    setMaxPriceFilter,
    benefitFilters,
    setBenefitFilters,
    showHiddenVenues,
    setShowHiddenVenues,
    benefits,
  } = useVenues();

  const hiddenCount = venues.filter((v) => v.hidden).length;
  
  // Ensure benefits is always an array
  const safeBenefits = Array.isArray(benefits) ? benefits : [];

  const maxPrice = venues.length > 0 ? Math.max(...venues.map((v) => v.price)) : 100000;
  const sliderMax = Math.ceil(maxPrice / 1000) * 1000 + 10000;

  const toggleBenefitFilter = (id: string) => {
    setBenefitFilters(
      benefitFilters.includes(id)
        ? benefitFilters.filter((b) => b !== id)
        : [...benefitFilters, id]
    );
  };

  const clearFilters = () => {
    setMaxPriceFilter(null);
    setBenefitFilters([]);
    setSortMode("none");
  };

  const hasFilters =
    maxPriceFilter !== null || benefitFilters.length > 0 || sortMode !== "none";

  const sortOptions: { mode: SortMode; label: string; icon: React.ReactNode }[] =
    [
      {
        mode: "best-cost-benefit",
        label: "Custo-Beneficio",
        icon: <Award className="h-4 w-4" />,
      },
      {
        mode: "price-asc",
        label: "Menor Preco",
        icon: <ArrowUp className="h-4 w-4" />,
      },
      {
        mode: "price-desc",
        label: "Maior Preco",
        icon: <ArrowDown className="h-4 w-4" />,
      },
    ];

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <SlidersHorizontal className="h-5 w-5 text-sage" />
        <h3 className="font-semibold text-foreground">Filtros e Ordenacao</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 h-3 w-3" />
            Limpar
          </Button>
        )}
      </div>

      {/* Sort buttons */}
      <div className="mb-5">
        <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Ordenar por
        </Label>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((opt) => (
            <Button
              key={opt.mode}
              size="sm"
              variant={sortMode === opt.mode ? "default" : "outline"}
              onClick={() =>
                setSortMode(sortMode === opt.mode ? "none" : opt.mode)
              }
              className={
                sortMode === opt.mode
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-foreground"
              }
            >
              {opt.icon}
              <span className="ml-1">{opt.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Price filter */}
      <div className="mb-5">
        <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Valor Maximo
        </Label>
        <div className="flex items-center gap-4">
          <Slider
            min={0}
            max={sliderMax}
            step={1000}
            value={[maxPriceFilter ?? sliderMax]}
            onValueChange={(val) =>
              setMaxPriceFilter(val[0] >= sliderMax ? null : val[0])
            }
            className="flex-1"
          />
          <span className="min-w-[100px] text-right text-sm font-medium text-foreground">
            {maxPriceFilter !== null
              ? `R$ ${maxPriceFilter.toLocaleString("pt-BR")}`
              : "Sem limite"}
          </span>
        </div>
      </div>

      {/* Benefit filters */}
      <div className="mb-5">
        <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Beneficios Obrigatorios
        </Label>
        {safeBenefits.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum beneficio cadastrado.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {safeBenefits.map((b) => {
              const active = benefitFilters.includes(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => toggleBenefitFilter(b.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Show hidden venues toggle */}
      {hiddenCount > 0 && (
        <div>
          <Label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Visibilidade
          </Label>
          <div className="flex items-center gap-3">
            <Switch
              id="show-hidden"
              checked={showHiddenVenues}
              onCheckedChange={setShowHiddenVenues}
            />
            <label
              htmlFor="show-hidden"
              className="flex items-center gap-2 text-sm text-foreground cursor-pointer"
            >
              <EyeOff className="h-4 w-4 text-muted-foreground" />
              Mostrar locais ocultos ({hiddenCount})
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
