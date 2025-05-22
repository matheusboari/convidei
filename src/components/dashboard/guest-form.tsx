"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

interface GuestFormProps {
  initialData?: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    groupId?: string;
    giftSize?: string;
    giftQuantity?: number;
    isChild?: boolean;
  };
  groups?: {
    id: string;
    name: string;
  }[];
  isEditing?: boolean;
}

export function GuestForm({ initialData, groups = [], isEditing = false }: GuestFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    groupId: initialData?.groupId || "",
    giftSize: initialData?.giftSize || "",
    giftQuantity: initialData?.giftQuantity?.toString() || "1",
    isChild: initialData?.isChild || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string | boolean }
  ) => {
    const { name, value } = "target" in e ? e.target : e;
    
    if (name === "giftSize" && value === "nenhum") {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        giftQuantity: "" 
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/guests${isEditing ? `/${initialData?.id}` : ""}`, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          giftQuantity: formData.giftQuantity && formData.giftSize !== "nenhum" 
            ? parseInt(formData.giftQuantity) 
            : null,
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar convidado");
      }

      toast.success(
        isEditing ? "Convidado atualizado com sucesso!" : "Convidado adicionado com sucesso!"
      );
      router.push("/dashboard/convidados");
      router.refresh();
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o convidado");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const giftSizes = ["P", "M", "G", "GG", "XG"];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Convidado *</Label>
          <Input
            id="name"
            name="name"
            placeholder="Nome completo"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="email@exemplo.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="(00) 00000-0000"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isChild" 
            checked={formData.isChild}
            onCheckedChange={(checked) => 
              handleChange({ name: "isChild", value: checked === true })
            }
          />
          <Label 
            htmlFor="isChild" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Este convidado é uma criança
          </Label>
        </div>

        {groups.length > 0 && (
          <div className="space-y-2">
            <Label htmlFor="groupId">Grupo (opcional)</Label>
            <Select
              value={formData.groupId}
              onValueChange={(value) => handleChange({ name: "groupId", value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Nenhum</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="giftSize">Tamanho da Fralda (opcional)</Label>
          <Select
            value={formData.giftSize}
            onValueChange={(value) => handleChange({ name: "giftSize", value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tamanho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Não definido</SelectItem>
              {giftSizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.giftSize && formData.giftSize !== "nenhum" && (
          <div className="space-y-2">
            <Label htmlFor="giftQuantity">Quantidade de Fraldas (opcional)</Label>
            <Input
              id="giftQuantity"
              name="giftQuantity"
              type="number"
              min="1"
              placeholder="1"
              value={formData.giftQuantity}
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
        {isLoading
          ? "Salvando..."
          : isEditing
          ? "Atualizar Convidado"
          : "Adicionar Convidado"}
      </Button>
    </form>
  );
} 