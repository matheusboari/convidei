'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Guest {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
}

interface GroupMembersFormProps {
  groupId: string;
  availableGuests: Guest[];
}

export function GroupMembersForm({ groupId, availableGuests }: GroupMembersFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');

  const handleAddMember = async () => {
    if (!selectedGuestId) {
      toast.error('Selecione um convidado para adicionar ao grupo');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guestId: selectedGuestId,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao adicionar membro ao grupo');
      }

      toast.success('Membro adicionado ao grupo com sucesso!');
      setSelectedGuestId('');
      router.refresh();
    } catch (error) {
      toast.error('Ocorreu um erro ao adicionar o membro ao grupo');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="guestId">Selecione um Convidado</Label>
        <div className="flex gap-3">
          <Select
            value={selectedGuestId}
            onValueChange={setSelectedGuestId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um convidado" />
            </SelectTrigger>
            <SelectContent>
              {availableGuests.map((guest) => (
                <SelectItem key={guest.id} value={guest.id}>
                  {guest.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleAddMember} 
            disabled={isLoading || !selectedGuestId}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </div>
    </div>
  );
} 
