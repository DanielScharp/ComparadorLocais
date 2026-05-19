export interface Benefit {
  id: string;
  label: string;
  icon: string;
}

export const DEFAULT_BENEFITS: Benefit[] = [
  { id: "buffet", label: "Buffet", icon: "UtensilsCrossed" },
  { id: "openBar", label: "Open Bar", icon: "Wine" },
  { id: "decoration", label: "Decoracao", icon: "Flower2" },
  { id: "dj", label: "Som/DJ", icon: "Music" },
  { id: "suite", label: "Suite", icon: "BedDouble" },
  { id: "parking", label: "Estacionamento", icon: "Car" },
  { id: "generator", label: "Gerador", icon: "Zap" },
  { id: "airConditioning", label: "Ar Condicionado", icon: "Snowflake" },
];

export const AVAILABLE_ICONS = [
  "UtensilsCrossed",
  "Wine",
  "Flower2",
  "Music",
  "BedDouble",
  "Car",
  "Zap",
  "Snowflake",
  "Camera",
  "Cake",
  "Shirt",
  "Sparkles",
  "Star",
  "Gift",
  "Wifi",
  "Tv",
  "Lamp",
  "TreePine",
  "Palmtree",
  "Umbrella",
  "Church",
  "PartyPopper",
  "HandPlatter",
  "Package",
] as const;

export interface Attachment {
  id: string;
  venue_id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  created_at: string;
}

export interface Venue {
  id: string;
  name: string;
  price: number;
  capacity: number;
  benefits: string[];
  hidden: boolean;
  attachments: Attachment[];
}

export type SortMode = "none" | "best-cost-benefit" | "price-asc" | "price-desc";

export type GuestSide = "noivo" | "noiva";

export interface Guest {
  id: string;
  family_id: string;
  name: string;
  is_main_guest: boolean;
  confirmed: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  side: GuestSide;
  max_guests: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  guests: Guest[];
}
