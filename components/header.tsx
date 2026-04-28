"use client";

import { Heart } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Wedding Venue Comparator
            </h1>
            <p className="text-sm text-muted-foreground">
              Encontre o local perfeito para o seu grande dia
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
