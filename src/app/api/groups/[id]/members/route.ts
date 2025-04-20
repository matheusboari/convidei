import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "../../../../../../auth";

interface Params {
  id: string;
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: "Não autorizado" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { id } = params;
    const { guestId } = await req.json();

    if (!guestId) {
      return new NextResponse(JSON.stringify({ error: "ID do convidado é obrigatório" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verificar se o grupo existe
    const group = await prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return new NextResponse(JSON.stringify({ error: "Grupo não encontrado" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verificar se o convidado existe
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
    });

    if (!guest) {
      return new NextResponse(JSON.stringify({ error: "Convidado não encontrado" }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Atualizar o convidado para adicionar ao grupo
    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        groupId: id,
      },
    });

    return new NextResponse(JSON.stringify(updatedGuest), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[GROUP_MEMBERS_POST]", error);
    return new NextResponse(JSON.stringify({ error: "Erro interno do servidor" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 