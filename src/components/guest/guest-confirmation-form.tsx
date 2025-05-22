"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [isAbsent, setIsAbsent] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(groupInfo?.id || null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>(() => {
    // Inicializar com todos os membros selecionados
    const allMembers = new Set<string>();
    
    // Adicionar o líder (guest)
    allMembers.add(guest.id);
    
    // Adicionar membros do grupo atual
    if (groupInfo?.isLeader) {
      groupInfo.members.forEach(member => allMembers.add(member.id));
    }
    
    // Adicionar membros dos outros grupos que o convidado lidera
    leadingGroups?.forEach(group => {
      group.members.forEach(member => allMembers.add(member.id));
    });
    
    return Array.from(allMembers);
  });
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
          // Incluir a lista de membros confirmados se for um grupo
          confirmedMembers: targetGroup ? selectedMembers : undefined,
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
        setIsAbsent(true);
        if (targetGroup) {
          toast.success(`Ausência registrada para o grupo ${targetGroup.name}.`);
        } else {
          toast.success("Ausência registrada com sucesso!");
        }
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao processar sua confirmação");
      console.error("Erro:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  if (showConfirmationMessage) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            {activeGroupId && activeGroupId !== guest.id 
              ? `Sua presença foi confirmada para o grupo! Os membros selecionados foram confirmados.`
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
  
  if (isAbsent) {
    return (
      <div className="space-y-4">
        <Alert className="bg-orange-50 border-orange-200">
          <AlertDescription className="text-orange-700">
            <p className="font-medium mb-2">Ausência registrada</p>
            <p>Sentiremos sua falta! Obrigado por nos informar.</p>
          </AlertDescription>
        </Alert>
        <Button 
          className="w-full bg-green-600 hover:bg-green-700"
          onClick={() => handleConfirm(true)}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Enviando..." : "Mudei de ideia, vou comparecer"}
        </Button>
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
            {isAbsent ? (
              <>
                <Alert className="bg-orange-50 border-orange-200">
                  <AlertDescription className="text-orange-700">
                    <p className="font-medium mb-2">Ausência registrada para o grupo {group.name}</p>
                    <p>Sentiremos sua falta! Obrigado por nos informar.</p>
                  </AlertDescription>
                </Alert>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleConfirm(true, group.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Mudei de ideia, vamos comparecer"}
                </Button>
              </>
            ) : (
              <>
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Crown className="h-4 w-4 text-amber-500" />
                      <p className="font-medium">Você é o líder do grupo {group.name}</p>
                    </div>
                    <p>Selecione quais membros do grupo confirmarão presença:</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="leader"
                          checked={selectedMembers.includes(guest.id)}
                          onCheckedChange={() => handleMemberSelection(guest.id)}
                        />
                        <label htmlFor="leader" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Você (líder)
                        </label>
                      </div>
                      {group.members.map(member => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={member.id}
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={() => handleMemberSelection(member.id)}
                          />
                          <label htmlFor={member.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {member.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col space-y-3">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleConfirm(true, group.id)}
                    disabled={isSubmitting || selectedMembers.length === 0}
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
              </>
            )}
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
                  {isAbsent ? (
                    <>
                      <Alert className="bg-orange-50 border-orange-200">
                        <AlertDescription className="text-orange-700">
                          <p className="font-medium mb-2">Ausência registrada para o grupo {group.name}</p>
                          <p>Sentiremos sua falta! Obrigado por nos informar.</p>
                        </AlertDescription>
                      </Alert>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleConfirm(true, group.id)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Enviando..." : "Mudei de ideia, vamos comparecer"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-blue-700">
                          <div className="flex items-center gap-2 mb-1">
                            <Crown className="h-4 w-4 text-amber-500" />
                            <p className="font-medium">Você é o líder do grupo {group.name}</p>
                          </div>
                          <p>Selecione quais membros do grupo confirmarão presença:</p>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`leader-${group.id}`}
                                checked={selectedMembers.includes(guest.id)}
                                onCheckedChange={() => handleMemberSelection(guest.id)}
                              />
                              <label htmlFor={`leader-${group.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Você (líder)
                              </label>
                            </div>
                            {group.members.map(member => (
                              <div key={member.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${member.id}-${group.id}`}
                                  checked={selectedMembers.includes(member.id)}
                                  onCheckedChange={() => handleMemberSelection(member.id)}
                                />
                                <label htmlFor={`${member.id}-${group.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  {member.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                      
                      <div className="flex flex-col space-y-3">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleConfirm(true, group.id)}
                          disabled={isSubmitting || selectedMembers.length === 0}
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
                    </>
                  )}
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