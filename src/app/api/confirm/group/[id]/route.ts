import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { confirmed, numberOfPeople, notes, confirmedMembers } = await req.json();

    // Verificar se o grupo existe
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        guests: {
          include: {
            confirmation: true,
          },
        },
      },
    });

    if (!group) {
      return new NextResponse(JSON.stringify({ error: 'Grupo não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Data atual para registro da confirmação
    const confirmDate = confirmed ? new Date() : null;

    // Atualizar confirmações dos membros do grupo
    for (const guest of group.guests) {
      if (guest.confirmation) {
        await prisma.confirmation.update({
          where: { id: guest.confirmation.id },
          data: {
            confirmed,
            confirmationDate: confirmDate,
            notes: notes || null,
          },
        });
      } else {
        await prisma.confirmation.create({
          data: {
            guestId: guest.id,
            confirmed,
            confirmationDate: confirmDate,
            notes: notes || null,
          },
        });
      }
    }
    
    // Também atualizar a confirmação do grupo
    const groupConfirmation = await prisma.confirmation.findUnique({
      where: { groupId: group.id },
    });
    
    if (groupConfirmation) {
      await prisma.confirmation.update({
        where: { id: groupConfirmation.id },
        data: {
          confirmed,
          numberOfPeople: numberOfPeople || group.guests.length,
          confirmationDate: confirmDate,
          notes: notes || null,
        },
      });
    } else {
      await prisma.confirmation.create({
        data: {
          groupId: group.id,
          confirmed,
          numberOfPeople: numberOfPeople || group.guests.length,
          confirmationDate: confirmDate,
          notes: notes || null,
        },
      });
    }

    // Revalidar cache após confirmação
    revalidatePath('/dashboard/confirmacoes');
    
    return new NextResponse(JSON.stringify({ success: true, groupConfirmation: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[GROUP_CONFIRMATION_POST]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
