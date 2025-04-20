"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  groupId?: string | null;
  confirmation?: {
    id: string;
    confirmed: boolean;
    numberOfPeople?: number | null;
    notes?: string | null;
  } | null;
}

interface GroupInfo {
  id: string;
  name: string;
  members: {
    id: string;
    name: string;
  }[];
}

interface GuestConfirmationFormProps {
  guest: Guest;
  groupInfo?: GroupInfo | null;
}

export function GuestConfirmationForm({ guest, groupInfo }: GuestConfirmationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const isConfirmed = guest.confirmation?.confirmed || false;
  const isGroupMember = !!guest.groupId && !!groupInfo;
  
  const handleConfirm = async (confirmed: boolean) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/confirm/${guest.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmed,
          // Enviar o número total de membros + 1 para o convidado principal
          numberOfPeople: groupInfo ? groupInfo.members.length + 1 : undefined,
          notes: "",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao enviar confirmação");
      }
      
      if (confirmed) {
        setShowConfirmationMessage(true);
        if (groupInfo) {
          toast.success(`Presença confirmada para o grupo ${groupInfo.name}!`);
        } else {
          toast.success("Presença confirmada com sucesso!");
        }
      } else {
        toast.success("Ausência registrada com sucesso!");
        // Se recusou, recarregar a página para mostrar o status atualizado
        window.location.reload();
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao processar sua confirmação");
      console.error("Erro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (showConfirmationMessage) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            {groupInfo 
              ? `Sua presença foi confirmada para o grupo ${groupInfo.name}! Todos os membros do grupo foram confirmados automaticamente.`
              : 'Sua presença foi confirmada com sucesso!'
            }
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.reload()}
        >
          Atualizar página
        </Button>
      </div>
    );
  }
  
  if (isConfirmed) {
    return (
      <div className="p-4 bg-green-50 rounded-lg text-center">
        <p className="font-medium text-green-700 mb-3">
          {groupInfo 
            ? `Sua presença já está confirmada para o grupo ${groupInfo.name}!`
            : 'Sua presença já está confirmada!'
          }
        </p>
        <Button 
          variant="outline"
          className="w-full border-red-300 text-red-600 hover:bg-red-50"
          disabled={isSubmitting}
          onClick={() => handleConfirm(false)}
        >
          {isSubmitting ? "Enviando..." : "Cancelar minha presença"}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {groupInfo && (
        <Alert className="bg-blue-50 border-blue-200 mb-4">
          <AlertDescription className="text-blue-700">
            <p className="font-medium mb-1">Confirmação para o grupo {groupInfo.name}</p>
            <p>Ao confirmar sua presença, todos os membros do grupo ({groupInfo.members.length + 1} pessoas) serão confirmados automaticamente.</p>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex flex-col space-y-3">
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => handleConfirm(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Confirmar presença"}
        </Button>
        
        <Button 
          variant="outline"
          className="w-full border-red-300 text-red-600 hover:bg-red-50"
          onClick={() => handleConfirm(false)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Não poderei comparecer"}
        </Button>
      </div>
    </div>
  );
} 