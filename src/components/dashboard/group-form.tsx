"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface GroupFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
  };
  isEditing?: boolean;
}

export function GroupForm({ initialData, isEditing = false }: GroupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/groups${isEditing ? `/${initialData?.id}` : ""}`, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar grupo");
      }

      toast.success(
        isEditing ? "Grupo atualizado com sucesso!" : "Grupo adicionado com sucesso!"
      );
      router.push("/dashboard/grupos");
      router.refresh();
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o grupo");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Grupo *</Label>
          <Input
            id="name"
            name="name"
            placeholder="Nome da família ou grupo"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Informações adicionais sobre o grupo"
            value={formData.description}
            onChange={handleChange}
            className="min-h-[100px]"
          />
        </div>
      </div>

      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
        {isLoading
          ? "Salvando..."
          : isEditing
          ? "Atualizar Grupo"
          : "Adicionar Grupo"}
      </Button>
    </form>
  );
} 