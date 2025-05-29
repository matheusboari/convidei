import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '../../../../../../../../auth';

interface Params {
  id: string;
  guestId: string;
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id, guestId } = params;

    // Verificar se o convidado existe e pertence ao grupo
    const guest = await prisma.guest.findFirst({
      where: { 
        id: guestId,
        groupId: id,
      },
    });

    if (!guest) {
      return new NextResponse(JSON.stringify({ error: 'Convidado não encontrado neste grupo' }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Atualizar o convidado para remover do grupo
    await prisma.guest.update({
      where: { id: guestId },
      data: { groupId: null },
    });

    // Redirecionar de volta para a página de membros do grupo
    return new NextResponse(null, {
      status: 303,
      headers: {
        'Location': `/dashboard/grupos/${id}/membros`,
      },
    });
  } catch (error) {
    console.error('[GROUP_MEMBER_REMOVE_POST]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
