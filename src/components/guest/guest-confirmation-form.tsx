"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown } from "lucide-react";

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
  hasLeader?: boolean;
  isLeader?: boolean;
  leaderName?: string;
}

interface GuestConfirmationFormProps {
  guest: Guest;
  groupInfo?: GroupInfo | null;
  leadingGroups?: GroupInfo[];
}

export function GuestConfirmationForm({ guest, groupInfo, leadingGroups }: GuestConfirmationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(groupInfo?.id || null);
  const isConfirmed = guest.confirmation?.confirmed || false;
  const isGroupMember = !!guest.groupId && !!groupInfo;
  
  const handleConfirm = async (confirmed: boolean, groupId?: string) => {
    setIsSubmitting(true);
    
    // Determinar qual grupo está sendo confirmado
    const targetGroupId = groupId || (activeGroupId && activeGroupId !== guest.id ? activeGroupId : undefined);
    const targetGroup = targetGroupId 
      ? (leadingGroups?.find(g => g.id === targetGroupId) || groupInfo)
      : undefined;
    
    try {
      const endpoint = targetGroupId 
        ? `/api/confirm/group/${targetGroupId}` 
        : `/api/confirm/${guest.id}`;
        
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirmed,
          // Enviar o número total de membros + 1 para o convidado principal se for um grupo
          numberOfPeople: targetGroup ? targetGroup.members.length + 1 : undefined,
          notes: "",
        }),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao enviar confirmação");
      }
      
      if (confirmed) {
        setShowConfirmationMessage(true);
        if (targetGroup) {
          toast.success(`Presença confirmada para o grupo ${targetGroup.name}!`);
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
            {activeGroupId && activeGroupId !== guest.id 
              ? `Sua presença foi confirmada para o grupo! Todos os membros do grupo foram confirmados automaticamente.`
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
  
  // Se o convidado for parte de um grupo que tem um líder e ele não é o líder
  if (isGroupMember && groupInfo?.hasLeader && !groupInfo?.isLeader) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Crown className="h-5 w-5 text-amber-500" />
          <p className="font-medium text-blue-700">
            Você é membro do grupo {groupInfo.name}
          </p>
        </div>
        <p className="text-gray-600 mb-4">
          {isConfirmed 
            ? "Sua presença já está confirmada pelo líder do grupo!"
            : `${groupInfo.leaderName} é o líder do grupo e será responsável por confirmar a presença de todos.`}
        </p>
        {!isConfirmed && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-700">
              A confirmação de presença será gerenciada pelo líder do grupo.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
  
  // Se o convidado for líder de grupos ou parte de um grupo sem líder definido
  if ((leadingGroups?.length || (isGroupMember && groupInfo?.isLeader)) && !isConfirmed) {
    const allGroups = [...(leadingGroups || [])];
    
    // Adicionar o grupo do qual o convidado é membro e líder, se aplicável
    if (isGroupMember && groupInfo?.isLeader && !allGroups.find(g => g.id === groupInfo.id)) {
      allGroups.unshift(groupInfo);
    }
    
    if (allGroups.length > 0) {
      // Se houver apenas um grupo, mostrar diretamente o formulário de confirmação
      if (allGroups.length === 1) {
        const group = allGroups[0];
        return (
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-700">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <p className="font-medium">Você é o líder do grupo {group.name}</p>
                </div>
                <p>Ao confirmar, todos os {group.members.length + 1} membros serão confirmados automaticamente:</p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Você (líder)</li>
                  {group.members.map(member => (
                    <li key={member.id}>{member.name}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleConfirm(true, group.id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : `Confirmar presença do grupo ${group.name}`}
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => handleConfirm(false, group.id)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Não poderemos comparecer"}
              </Button>
            </div>
          </div>
        );
      }
      
      // Se houver múltiplos grupos, mostrar as abas para cada grupo
      return (
        <div className="space-y-4">
          <Tabs defaultValue={allGroups[0].id} onValueChange={setActiveGroupId}>
            <TabsList className="w-full">
              {allGroups.map(group => (
                <TabsTrigger key={group.id} value={group.id} className="flex-1">
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {allGroups.map(group => (
              <TabsContent key={group.id} value={group.id} className="mt-4">
                <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-700">
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <p className="font-medium">Você é o líder do grupo {group.name}</p>
                      </div>
                      <p>Ao confirmar, todos os {group.members.length + 1} membros serão confirmados automaticamente:</p>
                      <ul className="mt-2 list-disc pl-5 space-y-1">
                        <li>Você (líder)</li>
                        {group.members.map(member => (
                          <li key={member.id}>{member.name}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="flex flex-col space-y-3">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleConfirm(true, group.id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : `Confirmar presença do grupo ${group.name}`}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleConfirm(false, group.id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Enviando..." : "Não poderemos comparecer"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      );
    }
  }
  
  // Caso padrão para um convidado individual
  if (isConfirmed) {
    return (
      <div className="p-4 bg-green-50 rounded-lg text-center">
        <p className="font-medium text-green-700 mb-3">
          Sua presença já está confirmada!
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