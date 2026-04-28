"use client";

import { useState, useMemo, useTransition } from "react";
import { useVenues } from "@/lib/venue-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Upload,
  FileJson,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface ImportJsonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ValidationResult {
  valid: boolean;
  data: Array<{ name: string; price: number; capacity: number; benefits: string[] }> | null;
  errors: string[];
  warnings: string[];
}

export function ImportJsonDialog({ open, onOpenChange }: ImportJsonDialogProps) {
  const { importVenues, benefits } = useVenues();
  const [json, setJson] = useState("");
  const [isPending, startTransition] = useTransition();
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importDone, setImportDone] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  // Build the example JSON dynamically from the real benefits in the DB
  const exampleJson = useMemo(() => {
    const labelToBenefit = (label: string) =>
      benefits.find((b) => b.label.toLowerCase() === label.toLowerCase())?.id ?? null;

    // Pick first 3 benefits for example 1, last 3 for example 2
    const b = benefits.slice(0, 3).map((b) => b.id);
    const c = benefits.slice(-3).map((b) => b.id);

    const example = [
      {
        name: "Espaco Jardim das Flores",
        price: 28000,
        capacity: 200,
        benefits: b,
      },
      {
        name: "Quinta dos Sonhos",
        price: 45000,
        capacity: 350,
        benefits: c,
      },
    ];

    return JSON.stringify(example, null, 2);
  }, [benefits]);

  // Validate the typed JSON against the schema
  const validation = useMemo((): ValidationResult => {
    if (!json.trim()) return { valid: false, data: null, errors: [], warnings: [] };

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return {
        valid: false,
        data: null,
        errors: ["JSON invalido. Verifique a sintaxe (virgulas, aspas, chaves)."],
        warnings: [],
      };
    }

    if (!Array.isArray(parsed)) {
      return {
        valid: false,
        data: null,
        errors: ["O JSON deve ser um array [ ] contendo os locais."],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const validItems: Array<{ name: string; price: number; capacity: number; benefits: string[] }> = [];
    const benefitIds = new Set(benefits.map((b) => b.id));

    parsed.forEach((item: unknown, i: number) => {
      const idx = `Item ${i + 1}`;
      if (typeof item !== "object" || item === null) {
        errors.push(`${idx}: deve ser um objeto { }.`);
        return;
      }

      const obj = item as Record<string, unknown>;

      if (!obj.name || typeof obj.name !== "string" || !obj.name.trim()) {
        errors.push(`${idx}: campo "name" e obrigatorio e deve ser texto.`);
      }

      const price = Number(obj.price);
      if (obj.price == null || isNaN(price) || price < 0) {
        errors.push(`${idx}: campo "price" e obrigatorio e deve ser um numero >= 0.`);
      }

      const capacity = Number(obj.capacity);
      if (obj.capacity == null || isNaN(capacity) || capacity <= 0 || !Number.isInteger(capacity)) {
        errors.push(`${idx}: campo "capacity" e obrigatorio, inteiro e maior que 0.`);
      }

      if (obj.benefits != null && !Array.isArray(obj.benefits)) {
        errors.push(`${idx}: campo "benefits" deve ser um array de IDs de beneficios.`);
      } else if (Array.isArray(obj.benefits)) {
        const unknownIds = (obj.benefits as unknown[])
          .filter((id): id is string => typeof id === "string")
          .filter((id) => !benefitIds.has(id));
        if (unknownIds.length > 0) {
          warnings.push(
            `${idx}: ${unknownIds.length} ID(s) de beneficio nao reconhecido(s) serao ignorados: ${unknownIds.slice(0, 3).join(", ")}${unknownIds.length > 3 ? "..." : ""}`
          );
        }
      }

      if (
        typeof obj.name === "string" &&
        obj.name.trim() &&
        !isNaN(price) && price >= 0 &&
        !isNaN(capacity) && capacity > 0
      ) {
        const safebenefits = Array.isArray(obj.benefits)
          ? (obj.benefits as unknown[])
              .filter((id): id is string => typeof id === "string" && benefitIds.has(id))
          : [];
        validItems.push({
          name: obj.name.trim(),
          price: Math.round(price),
          capacity: Math.round(capacity),
          benefits: safebenefits,
        });
      }
    });

    return {
      valid: errors.length === 0 && validItems.length > 0,
      data: validItems.length > 0 ? validItems : null,
      errors,
      warnings,
    };
  }, [json, benefits]);

  const handleCopyExample = () => {
    navigator.clipboard.writeText(exampleJson);
    toast.success("Exemplo copiado para a area de transferencia");
  };

  const handleImport = () => {
    if (!validation.valid || !validation.data) return;
    setImportErrors([]);
    setImportDone(false);

    startTransition(async () => {
      const result = await importVenues(validation.data!);
      setImportedCount(result.imported);
      setImportErrors(result.errors);
      setImportDone(true);

      if (result.errors.length === 0) {
        setJson("");
        setTimeout(() => {
          onOpenChange(false);
          setImportDone(false);
        }, 1500);
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
            Importar Locais via JSON
          </DialogTitle>
          <DialogDescription>
            Cole um array JSON com os locais que deseja importar. Use o exemplo abaixo como referencia.
          </DialogDescription>
        </DialogHeader>

        {/* Example section */}
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Formato esperado (exemplo)
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
          <pre className="overflow-x-auto rounded-md bg-card p-3 text-xs leading-relaxed text-foreground shadow-sm border border-border">
            {exampleJson}
          </pre>

          {/* Field descriptions */}
          <div className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {[
              { field: "name", desc: "Nome do local (texto obrigatorio)" },
              { field: "price", desc: "Valor em reais, numero inteiro" },
              { field: "capacity", desc: "Capacidade de pessoas, inteiro > 0" },
              { field: "benefits", desc: "Array com IDs de beneficios (veja abaixo)" },
            ].map(({ field, desc }) => (
              <div key={field} className="flex items-start gap-2 text-xs text-muted-foreground">
                <code className="shrink-0 rounded bg-gold-light px-1.5 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                  {field}
                </code>
                <span className="leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Available benefit IDs */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            IDs de beneficios disponiveis
          </p>
          <div className="flex flex-wrap gap-1.5">
            {benefits.map((b) => (
              <div
                key={b.id}
                className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1"
              >
                <code className="font-mono text-[10px] text-muted-foreground">{b.id}</code>
                <span className="text-xs font-medium text-foreground">{b.label}</span>
              </div>
            ))}
            {benefits.length === 0 && (
              <span className="text-xs text-muted-foreground italic">
                Nenhum beneficio cadastrado ainda.
              </span>
            )}
          </div>
        </div>

        {/* Input area */}
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
            placeholder={'[\n  {\n    "name": "Nome do Local",\n    "price": 30000,\n    "capacity": 250,\n    "benefits": []\n  }\n]'}
            className="min-h-44 font-mono text-xs"
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
                <div key={i} className="flex items-start gap-2 rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {w}
                </div>
              ))}
              {validation.valid && validation.data && (
                <div className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-2 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  {validation.data.length} local(is) valido(s) e pronto(s) para importar
                </div>
              )}
            </div>
          )}
        </div>

        {/* Import result */}
        {importDone && (
          <div className="space-y-1.5">
            {importedCount > 0 && (
              <div className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-2 text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {importedCount} local(is) importado(s) com sucesso!
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
              ? `Importar ${validation.data.length} local(is)`
              : "Importar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
