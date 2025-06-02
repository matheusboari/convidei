import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = await params;

    // Primeiro, excluir a confirmação relacionada, se existir
    await prisma.confirmation.deleteMany({
      where: {
        groupId: id,
      },
    });
    
    // Atualizar os convidados para remover a associação com o grupo
    await prisma.guest.updateMany({
      where: {
        groupId: id,
      },
      data: {
        groupId: null,
      },
    });

    // Finalmente, excluir o grupo
    await prisma.group.delete({
      where: { id },
    });

    // Redirecionar de volta para a lista de grupos
    return new NextResponse(null, {
      status: 303,
      headers: {
        'Location': '/dashboard/grupos',
      },
    });
  } catch (error) {
    console.error('[GROUP_DELETE_POST]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
