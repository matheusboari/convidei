import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '../../../../../auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, groupId, giftSize, giftQuantity, isChild } = body;

    if (!name) {
      return new NextResponse(JSON.stringify({ error: 'Nome é obrigatório' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const guest = await prisma.guest.update({
      where: {
        id,
      },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        groupId: groupId && groupId !== 'nenhum' ? groupId : null,
        giftSize: giftSize && giftSize !== 'nenhum' ? giftSize : null,
        giftQuantity: giftQuantity || 1,
        isChild: isChild || false,
      },
    });

    return new NextResponse(JSON.stringify(guest), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[GUEST_PATCH]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = await params;

    // Excluir confirmação relacionada se existir
    await prisma.confirmation.deleteMany({
      where: {
        guestId: id,
      },
    });

    await prisma.guest.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[GUEST_DELETE]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
