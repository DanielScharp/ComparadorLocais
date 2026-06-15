"use client";

import { useState, useMemo, useTransition } from "react";
import { useGuests } from "@/lib/guest-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Upload,
  FileJson,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface ImportGuestsJsonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FamilyInput {
  name: string;
  side: "noivo" | "noiva";
  max_guests?: number;
  notes?: string;
  guests: Array<{ name: string; is_main_guest?: boolean; notes?: string }>;
}

interface ValidationResult {
  valid: boolean;
  data: FamilyInput[] | null;
  errors: string[];
  warnings: string[];
}

const EXAMPLE_JSON = JSON.stringify(
  [
    {
      name: "Família Silva",
      side: "noivo",
      guests: [
        { name: "Carlos Silva", is_main_guest: true },
        { name: "Ana Silva" },
      ],
    },
    {
      name: "Família Oliveira",
      side: "noiva",
      notes: "Alergia a frutos do mar",
      guests: [
        { name: "Maria Oliveira", is_main_guest: true },
        { name: "Pedro Oliveira" },
        { name: "Joana Oliveira" },
      ],
    },
  ],
  null,
  2
);

function validateJson(json: string): ValidationResult {
  if (!json.trim()) return { valid: false, data: null, errors: [], warnings: [] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      valid: false,
      data: null,
      errors: ['JSON inválido. Verifique a sintaxe (vírgulas, aspas, chaves).'],
      warnings: [],
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      valid: false,
      data: null,
      errors: ["O JSON deve ser um array [ ] contendo as famílias."],
      warnings: [],
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const validItems: FamilyInput[] = [];

  (parsed as unknown[]).forEach((item, i) => {
    const idx = `Item ${i + 1}`;

    if (typeof item !== "object" || item === null) {
      errors.push(`${idx}: deve ser um objeto { }.`);
      return;
    }

    const obj = item as Record<string, unknown>;

    if (!obj.name || typeof obj.name !== "string" || !obj.name.trim()) {
      errors.push(`${idx}: campo "name" é obrigatório e deve ser texto.`);
    }

    if (obj.side !== "noivo" && obj.side !== "noiva") {
      errors.push(`${idx}: campo "side" deve ser "noivo" ou "noiva".`);
    }

    if (!Array.isArray(obj.guests) || obj.guests.length === 0) {
      errors.push(`${idx}: campo "guests" deve ser um array com pelo menos 1 convidado.`);
    } else {
      const invalidGuests = (obj.guests as unknown[]).filter(
        (g) => typeof g !== "object" || g === null || !((g as Record<string, unknown>).name)
      );
      if (invalidGuests.length > 0) {
        errors.push(`${idx}: ${invalidGuests.length} convidado(s) sem campo "name".`);
      }
    }

    if (obj.max_guests != null && (isNaN(Number(obj.max_guests)) || Number(obj.max_guests) <= 0)) {
      warnings.push(`${idx}: campo "max_guests" inválido — será calculado automaticamente.`);
    }

    const isNameOk = typeof obj.name === "string" && obj.name.trim();
    const isSideOk = obj.side === "noivo" || obj.side === "noiva";
    const guests = Array.isArray(obj.guests)
      ? (obj.guests as unknown[])
          .filter((g): g is Record<string, unknown> => typeof g === "object" && g !== null)
          .filter((g) => typeof g.name === "string" && (g.name as string).trim())
          .map((g, gIdx) => ({
            name: (g.name as string).trim(),
            is_main_guest: typeof g.is_main_guest === "boolean" ? g.is_main_guest : gIdx === 0,
            notes: typeof g.notes === "string" ? g.notes.trim() || undefined : undefined,
          }))
      : [];

    if (isNameOk && isSideOk && guests.length > 0) {
      validItems.push({
        name: (obj.name as string).trim(),
        side: obj.side as "noivo" | "noiva",
        max_guests: obj.max_guests ? Number(obj.max_guests) : guests.length,
        notes: typeof obj.notes === "string" ? obj.notes.trim() || undefined : undefined,
        guests,
      });
    }
  });

  return {
    valid: errors.length === 0 && validItems.length > 0,
    data: validItems.length > 0 ? validItems : null,
    errors,
    warnings,
  };
}

export function ImportGuestsJsonDialog({ open, onOpenChange }: ImportGuestsJsonDialogProps) {
  const { importFamilies } = useGuests();
  const [json, setJson] = useState("");
  const [isPending, startTransition] = useTransition();
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importDone, setImportDone] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const validation = useMemo(() => validateJson(json), [json]);

  const totalGuests = useMemo(
    () => validation.data?.reduce((acc, f) => acc + f.guests.length, 0) ?? 0,
    [validation.data]
  );

  const handleCopyExample = () => {
    navigator.clipboard.writeText(EXAMPLE_JSON);
    toast.success("Exemplo copiado para a área de transferência");
  };

  const handleImport = () => {
    if (!validation.valid || !validation.data) return;
    setImportErrors([]);
    setImportDone(false);

    startTransition(async () => {
      const result = await importFamilies(validation.data!);
      setImportedCount(result.imported);
      setImportErrors(result.errors);
      setImportDone(true);

      if (result.errors.length === 0) {
        toast.success(
          `${result.imported} família(s) importada(s) com sucesso!`
        );
        setJson("");
        setTimeout(() => {
          onOpenChange(false);
          setImportDone(false);
        }, 1200);
      }
    });
  };

  const handleClose = (val: boolean) => {
    if (!isPending) {
      setJson("");
      setImportErrors([]);
      setImportDone(false);
      onOpenChange(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileJson className="h-5 w-5 text-primary" />
            Importar Famílias via JSON
          </DialogTitle>
          <DialogDescription>
            Cole um array JSON com as famílias e seus convidados. Use o exemplo abaixo como referência.
          </DialogDescription>
        </DialogHeader>

        {/* Example */}
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Formato esperado
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyExample}
              className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar exemplo
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-md border border-border bg-card p-3 text-xs leading-relaxed text-foreground shadow-sm">
            {EXAMPLE_JSON}
          </pre>

          {/* Field descriptions */}
          <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {[
              { field: "name", desc: 'Nome da família (obrigatório)' },
              { field: "side", desc: '"noivo" ou "noiva" (obrigatório)' },
              { field: "guests", desc: "Array de convidados (obrigatório, mín. 1)" },
              { field: "notes", desc: "Observações da família (opcional)" },
              { field: "guests[].name", desc: "Nome do convidado (obrigatório)" },
              { field: "guests[].is_main_guest", desc: "true/false — padrão: primeiro = true" },
            ].map(({ field, desc }) => (
              <div key={field} className="flex items-start gap-2 text-xs text-muted-foreground">
                <code className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                  {field}
                </code>
                <span className="leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Cole seu JSON aqui
          </label>
          <Textarea
            value={json}
            onChange={(e) => {
              setJson(e.target.value);
              setImportDone(false);
              setImportErrors([]);
            }}
            placeholder={'[\n  {\n    "name": "Família Exemplo",\n    "side": "noivo",\n    "guests": [\n      { "name": "João Silva" }\n    ]\n  }\n]'}
            className="min-h-48 font-mono text-xs"
            disabled={isPending}
          />

          {/* Validation feedback */}
          {json.trim() && (
            <div className="space-y-1.5">
              {validation.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {err}
                </div>
              ))}
              {validation.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {w}
                </div>
              ))}
              {validation.valid && validation.data && (
                <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  {validation.data.length} família(s) válida(s) com {totalGuests} convidado(s) pronto(s) para importar
                </div>
              )}
            </div>
          )}
        </div>

        {/* Import result */}
        {importDone && (
          <div className="space-y-1.5">
            {importedCount > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-xs text-green-700 dark:bg-green-950/30 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {importedCount} família(s) importada(s) com sucesso!
              </div>
            )}
            {importErrors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {err}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isPending}
            className="text-foreground"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleImport}
            disabled={!validation.valid || isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Upload className="mr-1.5 h-4 w-4" />
            {isPending
              ? "Importando..."
              : validation.data
              ? `Importar ${validation.data.length} família(s)`
              : "Importar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
