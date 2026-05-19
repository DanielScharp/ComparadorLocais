"use client";

import { GuestProvider } from "@/lib/guest-context";
import { Header } from "@/components/header";
import { GuestList } from "@/components/guest-list";

export default function ConvidadosPage() {
  return (
    <GuestProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <GuestList />
        </main>
      </div>
    </GuestProvider>
  );
}
