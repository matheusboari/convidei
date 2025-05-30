import { notFound } from 'next/navigation';
import { GuestConfirmationForm } from '@/components/guest/guest-confirmation-form';
import prisma from '@/lib/prisma';
import { findGuestBySlugOrInviteLink } from '@/lib/slug';

interface ConfirmPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  try {
    const { id } = await params;
    
    // Buscar o convidado pelo slug ou link de convite
    const guest = await findGuestBySlugOrInviteLink(id);

    if (!guest) {
      notFound();
    }

    // Se for um grupo, incluir informações do grupo
    let groupInfo = null;
    
    // Verificar se o convidado é membro de um grupo
    if (guest.group) {
      // Buscar o líder do grupo
      const group = await prisma.group.findUnique({
        where: {
          id: guest.group.id,
        },
        include: {
          leader: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      // Verificar se o convidado é o líder do grupo
      const isLeader = group?.leaderId === guest.id;
      
      // Se não for o líder e o grupo tiver um líder, não permitir gerenciar o grupo
      if (!isLeader && group?.leaderId) {
        groupInfo = {
          id: guest.group.id,
          name: guest.group.name,
          members: [],
          hasLeader: true,
          isLeader: false,
          leaderName: group.leader?.name || 'Líder',
        };
      } else {
        // Buscar outros membros do grupo
        const groupGuests = await prisma.guest.findMany({
          where: {
            groupId: guest.group.id,
            id: {
              not: guest.id,
            },
          },
          select: {
            id: true,
            name: true,
          },
        });

        groupInfo = {
          id: guest.group.id,
          name: guest.group.name,
          members: groupGuests,
          hasLeader: !!group?.leaderId,
          isLeader: isLeader,
          leaderName: group?.leader?.name,
        };
      }
    }
    
    // Verificar se o convidado é líder de outro grupo
    const leadingGroups = [];
    if (guest.leadingGroups && guest.leadingGroups.length > 0) {
      for (const group of guest.leadingGroups) {
        const members = await prisma.guest.findMany({
          where: {
            groupId: group.id,
            id: {
              not: guest.id,
            },
          },
          select: {
            id: true,
            name: true,
          },
        });
        
        leadingGroups.push({
          id: group.id,
          name: group.name,
          members: members,
        });
      }
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="py-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-purple-800 mb-2">
                Olá, {guest.name}!
              </h1>
              <p className="text-gray-600">
                {guest.confirmation?.confirmed 
                  ? 'Sua presença está confirmada para o chá de fraldas da Antonella! 🎉'
                  : 'Você foi convidado(a) para o chá de fraldas da Antonella'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-purple-100 rounded-lg p-4 text-center">
                <h2 className="font-semibold text-purple-800 mb-2">Detalhes do Evento</h2>
                <p className="text-gray-700">Data: <span className="font-medium">19 de julho de 2025</span></p>
                <p className="text-gray-700">Horário: <span className="font-medium">15:00</span></p>
                <p className="text-gray-700">Local: <span className="font-medium">Villa di Helena</span></p>
                <p className="text-gray-700">Av. Amaleto Marino, 250 - Res. Santa Izabel</p>
              </div>

              <GuestConfirmationForm 
                guest={guest} 
                groupInfo={groupInfo}
                leadingGroups={leadingGroups.length > 0 ? leadingGroups : undefined}
              />

              {guest.giftSize && (
                <div className="mt-8 bg-blue-50 rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-blue-700 mb-2">Seu presente sugerido</h3>
                  <p className="text-gray-700">
                    Fralda tamanho <span className="font-medium">{guest.giftSize}</span> + mimo
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Marcas sugeridas:</p>
                  <div className="flex justify-center gap-2 mt-1">
                    <span className="inline-block bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600 text-sm">Huggies</span>
                    <span className="inline-block bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600 text-sm">Pampers</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Erro ao buscar informações do convidado:', error);
    notFound();
  }
}
