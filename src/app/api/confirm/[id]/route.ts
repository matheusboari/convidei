import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { confirmed, numberOfPeople, notes } = await req.json();

    // Verificar se o convidado existe
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: { 
        confirmation: true,
        group: true, 
      },
    });

    if (!guest) {
      return new NextResponse(JSON.stringify({ error: 'Convidado não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verificar se o convidado pertence a um grupo
    const isGroupMember = guest.groupId !== null;
    
    // Data atual para registro da confirmação
    const confirmDate = confirmed ? new Date() : null;
    
    // Se o convidado pertence a um grupo e está confirmando, confirmar para todos do grupo
    if (isGroupMember && confirmed && guest.group) {
      // Buscar todos os membros do grupo
      const groupMembers = await prisma.guest.findMany({
        where: { 
          groupId: guest.groupId, 
        },
        include: {
          confirmation: true,
        },
      });
      
      // Confirmar para cada membro do grupo
      for (const member of groupMembers) {
        if (member.confirmation) {
          // Atualizar confirmação existente
          await prisma.confirmation.update({
            where: { id: member.confirmation.id },
            data: {
              confirmed,
              confirmationDate: confirmDate,
              // Manter as notas apenas para o membro que confirmou
              notes: member.id === id ? notes || null : member.confirmation.notes,
            },
          });
        } else {
          // Criar nova confirmação
          await prisma.confirmation.create({
            data: {
              guestId: member.id,
              confirmed,
              confirmationDate: confirmDate,
              // Adicionar notas apenas para o membro que confirmou
              notes: member.id === id ? notes || null : null,
            },
          });
        }
      }
      
      // Também atualizar a confirmação do grupo
      if (guest.group) {
        const groupConfirmation = await prisma.confirmation.findFirst({
          where: { groupId: guest.group.id },
        });
        
        if (groupConfirmation) {
          await prisma.confirmation.update({
            where: { id: groupConfirmation.id },
            data: {
              confirmed,
              numberOfPeople: numberOfPeople || null,
              confirmationDate: confirmDate,
              notes: notes || null,
            },
          });
        } else {
          await prisma.confirmation.create({
            data: {
              groupId: guest.group.id,
              confirmed,
              numberOfPeople: numberOfPeople || null,
              confirmationDate: confirmDate,
              notes: notes || null,
            },
          });
        }
      }
      
      // Revalidar cache após confirmação
      revalidatePath('/dashboard/confirmacoes');
      
      return new NextResponse(JSON.stringify({ success: true, groupConfirmation: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Caso contrário, confirmar apenas para o convidado individual
      let confirmation;

      // Se já existir uma confirmação, atualizar
      if (guest.confirmation) {
        confirmation = await prisma.confirmation.update({
          where: { id: guest.confirmation.id },
          data: {
            confirmed,
            numberOfPeople: numberOfPeople || null,
            notes: notes || null,
            confirmationDate: confirmDate,
          },
        });
      } else {
        // Se não, criar uma nova
        confirmation = await prisma.confirmation.create({
          data: {
            guestId: guest.id,
            confirmed,
            numberOfPeople: numberOfPeople || null,
            notes: notes || null,
            confirmationDate: confirmDate,
          },
        });
      }

      // Revalidar cache após confirmação
      revalidatePath('/dashboard/confirmacoes');

      return new NextResponse(JSON.stringify({ success: true, confirmation }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('[CONFIRMATION_POST]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
