import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { generateUniqueGroupSlug } from '@/lib/slug';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const groups = await prisma.group.findMany({
      include: {
        _count: {
          select: {
            guests: true,
          },
        },
        confirmation: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return new NextResponse(JSON.stringify(groups), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[GROUPS_GET]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { name, description, leaderId } = body;

    if (!name) {
      return new NextResponse(JSON.stringify({ error: 'Nome é obrigatório' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Gerar slug único e link de convite único
    const slug = await generateUniqueGroupSlug(name);
    const inviteLink = `${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;

    // Converter "none" para null no leaderId
    const effectiveLeaderId = leaderId === 'none' ? null : leaderId || null;

    const group = await prisma.group.create({
      data: {
        name,
        slug,
        description: description || null,
        inviteLink,
        leaderId: effectiveLeaderId,
      },
    });

    return new NextResponse(JSON.stringify(group), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[GROUPS_POST]', error);
    return new NextResponse(JSON.stringify({ error: 'Erro interno do servidor' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
