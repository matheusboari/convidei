import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = await params.id;
    const { confirmed, numberOfPeople, notes, confirmedMembers } = await req.json();

    // Verificar se o grupo existe
    const group = await prisma.group.findUnique({
      where: { id },
      include: { 
        guests: true,
        leader: {
          select: {
            id: true,
            name: true,
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
    
    // Confirmar para cada membro do grupo
    for (const member of group.guests) {
      // Se confirmedMembers for fornecido, usar a lista para determinar se o membro está confirmado
      const isMemberConfirmed = confirmedMembers ? confirmedMembers.includes(member.id) : confirmed;
      
      // Verificar se já existe uma confirmação para o membro
      const existingConfirmation = await prisma.confirmation.findUnique({
        where: { guestId: member.id },
      });
      
      if (existingConfirmation) {
        // Atualizar confirmação existente
        await prisma.confirmation.update({
          where: { id: existingConfirmation.id },
          data: {
            confirmed: !confirmed ? false : isMemberConfirmed,
            confirmationDate: isMemberConfirmed ? confirmDate : null,
          },
        });
      } else {
        // Criar nova confirmação
        await prisma.confirmation.create({
          data: {
            guestId: member.id,
            confirmed: !confirmed ? false : isMemberConfirmed,
            confirmationDate: isMemberConfirmed ? confirmDate : null,
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
