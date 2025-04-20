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

    const guests = await prisma.guest.findMany({
      include: {
        group: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return new NextResponse(JSON.stringify(guests), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[GUESTS_GET]", error);
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
    const { name, email, phone, groupId, giftSize, giftQuantity } = body;

    if (!name) {
      return new NextResponse(JSON.stringify({ error: "Nome é obrigatório" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Gerar link de convite único
    const inviteLink = `${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;

    const guest = await prisma.guest.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        groupId: groupId && groupId !== "nenhum" ? groupId : null,
        giftSize: giftSize && giftSize !== "nenhum" ? giftSize : null,
        giftQuantity: giftQuantity || 1,
        inviteLink,
      },
    });

    return new NextResponse(JSON.stringify(guest), { 
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("[GUESTS_POST]", error);
    return new NextResponse(JSON.stringify({ error: "Erro interno do servidor" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
} 