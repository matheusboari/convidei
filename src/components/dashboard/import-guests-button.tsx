"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export function ImportGuestsButton() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Verificar se é um arquivo CSV
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Por favor, selecione um arquivo CSV válido");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/guests/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao importar convidados");
      }

      // Fechar o modal e atualizar a lista
      setOpen(false);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao importar convidados");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="bg-white hover:bg-gray-50"
      >
        <Upload className="mr-2 h-4 w-4" />
        Importar CSV
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Convidados</DialogTitle>
            <DialogDescription>
              Faça upload de um arquivo CSV com a lista de convidados.
              O arquivo deve conter as seguintes colunas: nome, email, telefone, grupo, tamanho_fralda, quantidade_fralda, crianca, lider_grupo.
              <div className="mt-2">
                <a 
                  href="/exemplo_importacao.csv" 
                  download 
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  Baixar arquivo de exemplo
                </a>
              </div>
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Clique para selecionar ou arraste o arquivo CSV
                </span>
                <span className="text-xs text-gray-400">
                  Tamanho máximo: 5MB
                </span>
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 