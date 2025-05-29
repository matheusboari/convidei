import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '../../../../../auth';

interface Params {
  id: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    
    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        guests: true,
        confirmation: true,
      },
    });

    if (!group) {
      return new NextResponse(JSON.stringify({ error: 'Grupo não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new NextResponse(JSON.stringify(group), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[GROUP_GET]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;
    const body = await req.json();
    const { name, description, leaderId } = body;

    if (!name) {
      return new NextResponse(JSON.stringify({ error: 'Nome é obrigatório' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Converter "none" para null no leaderId
    const effectiveLeaderId = leaderId === 'none' ? null : leaderId || null;

    const group = await prisma.group.update({
      where: { id },
      data: {
        name,
        description: description || null,
        leaderId: effectiveLeaderId,
      },
    });

    return new NextResponse(JSON.stringify(group), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[GROUP_PATCH]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { id } = params;

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

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[GROUP_DELETE]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
