import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../../auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Não autorizado" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
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
        name: "asc",
      },
    });

    return new NextResponse(JSON.stringify(groups), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[GROUPS_GET]", error);
    return new NextResponse(JSON.stringify({ error: "Erro interno do servidor" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Não autorizado" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return new NextResponse(JSON.stringify({ error: "Nome é obrigatório" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Gerar link de convite único
    const inviteLink = `${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;

    const group = await prisma.group.create({
      data: {
        name,
        description: description || null,
        inviteLink,
      },
    });

    return new NextResponse(JSON.stringify(group), { 
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[GROUPS_POST]", error);
    return new NextResponse(JSON.stringify({ error: "Erro interno do servidor" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 