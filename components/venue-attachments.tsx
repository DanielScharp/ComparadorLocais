"use client";

import { useState, useRef } from "react";
import { useVenues } from "@/lib/venue-context";
import type { Attachment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  FileText, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Download,
  ExternalLink,
  Loader2,
  Paperclip,
} from "lucide-react";

interface VenueAttachmentsProps {
  venueId: string;
  venueName: string;
  attachments: Attachment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VenueAttachmentsDialog({
  venueId,
  venueName,
  attachments,
  open,
  onOpenChange,
}: VenueAttachmentsProps) {
  const { uploadAttachment, deleteAttachment } = useVenues();
  const [isUploading, setIsUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadAttachment(venueId, file);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteAttachment(venueId, deleteTarget.id);
    setDeleteTarget(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    return <FileText className="h-5 w-5 text-red-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const isImage = (fileType: string) => fileType.startsWith("image/");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Anexos - {venueName}
            </DialogTitle>
            <DialogDescription>
              Gerencie fotos e PDFs deste local. Tamanho maximo: 10MB por arquivo.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {/* Upload section */}
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-primary text-primary-foreground"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Adicionar Arquivo
                  </>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                PDF ou imagens (JPEG, PNG, WebP, GIF)
              </span>
            </div>

            {/* Attachments list */}
            {attachments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <Paperclip className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenhum anexo adicionado ainda.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    {/* Preview or icon */}
                    <div className="flex-shrink-0">
                      {isImage(attachment.file_type) ? (
                        <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-secondary">
                          <img
                            src={attachment.file_url}
                            alt={attachment.file_name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary">
                          {getFileIcon(attachment.file_type)}
                        </div>
                      )}
                    </div>

                    {/* File info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.file_size)} • {" "}
                        {new Date(attachment.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Abrir em nova aba"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a
                          href={attachment.file_url}
                          download={attachment.file_name}
                          aria-label="Baixar arquivo"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(attachment)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        aria-label="Excluir arquivo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir Anexo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.file_name}</strong>? 
              Essa acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
