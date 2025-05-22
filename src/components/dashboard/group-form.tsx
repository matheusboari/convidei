"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Guest {
  id: string;
  name: string;
}

interface GroupFormProps {
  initialData?: {
    id?: string;
    name: string;
    description: string;
    leaderId?: string;
  };
  isEditing?: boolean;
}

export function GroupForm({ initialData, isEditing = false }: GroupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    leaderId: initialData?.leaderId || "",
  });

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        // Se estiver editando, buscar apenas os membros do grupo atual
        const endpoint = isEditing 
          ? `/api/groups/${initialData?.id}/members`
          : "/api/guests";
        
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setGuests(data);
        }
      } catch (error) {
        console.error("Erro ao buscar convidados:", error);
        toast.error("Erro ao carregar a lista de convidados");
      }
    };

    fetchGuests();
  }, [isEditing, initialData?.id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
       { name: string; value: string }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
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

        <div className="space-y-2">
          <Label htmlFor="leaderId">Líder do Grupo</Label>
          <Select
            value={formData.leaderId}
            onValueChange={(value) => handleChange({ name: "leaderId", value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um líder para o grupo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum líder selecionado</SelectItem>
              {guests.map((guest) => (
                <SelectItem key={guest.id} value={guest.id}>
                  {guest.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            O líder do grupo receberá o link para confirmação de todos os membros.
          </p>
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