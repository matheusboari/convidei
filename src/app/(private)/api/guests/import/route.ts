import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { parse } from 'csv-parse/sync';
import crypto from 'crypto';
import { generateUniqueGuestSlug, generateUniqueGroupSlug } from '@/lib/slug';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session) {
      return new NextResponse(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse(JSON.stringify({ error: 'Nenhum arquivo enviado' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Ler o conteúdo do arquivo
    const fileContent = await file.text();
    
    // Parsear o CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    // Validar estrutura do CSV
    const requiredColumns = ['nome', 'email', 'telefone', 'grupo', 'tamanho_fralda', 'quantidade_fralda', 'crianca', 'lider_grupo'];
    const fileColumns = Object.keys(records[0] || {});
    
    const missingColumns = requiredColumns.filter(col => !fileColumns.includes(col));
    if (missingColumns.length > 0) {
      return new NextResponse(JSON.stringify({ 
        error: `Colunas obrigatórias ausentes: ${missingColumns.join(', ')}`, 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Processar registros
    const guests = [];
    const errors = [];
    const groups = new Map(); // Nome do grupo -> { id, leaderId }
    const pendingLeaders = new Map(); // Nome do grupo -> Guest ID (para atualizar depois)

    // Validar líderes antes de processar
    const leadersPerGroup = new Map(); // Nome do grupo -> quantidade de líderes
    for (const record of records) {
      if (record.grupo?.trim() && record.lider_grupo?.toLowerCase() === 'sim') {
        const groupName = record.grupo.trim();
        leadersPerGroup.set(groupName, (leadersPerGroup.get(groupName) || 0) + 1);
      }
    }

    // Verificar se algum grupo tem mais de um líder
    const groupsWithMultipleLeaders = Array.from(leadersPerGroup.entries())
      .filter(([_, count]) => count > 1)
      .map(([groupName]) => groupName);

    if (groupsWithMultipleLeaders.length > 0) {
      return new NextResponse(JSON.stringify({ 
        error: `Os seguintes grupos têm mais de um líder definido: ${groupsWithMultipleLeaders.join(', ')}. Cada grupo deve ter apenas um líder.`, 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Primeiro passo: criar todos os convidados e manter registro dos líderes
    for (const [index, record] of records.entries()) {
      try {
        // Validar nome (obrigatório)
        if (!record.nome?.trim()) {
          throw new Error('Nome é obrigatório');
        }

        // Processar grupo se especificado
        let groupId = null;
        if (record.grupo?.trim()) {
          const groupName = record.grupo.trim();
          
          // Verificar se o grupo já existe no banco ou foi criado nesta importação
          if (!groups.has(groupName)) {
            const existingGroup = await prisma.group.findFirst({
              where: { name: groupName },
            });

            if (existingGroup) {
              groups.set(groupName, { 
                id: existingGroup.id, 
                leaderId: existingGroup.leaderId, 
              });
              groupId = existingGroup.id;
            } else {
              const groupSlug = await generateUniqueGroupSlug(groupName);
              const groupInviteLink = `group-${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}`;
              const newGroup = await prisma.group.create({
                data: { 
                  name: groupName,
                  slug: groupSlug,
                  inviteLink: groupInviteLink,
                },
              });
              groups.set(groupName, { 
                id: newGroup.id, 
                leaderId: null, 
              });
              groupId = newGroup.id;
            }
          } else {
            groupId = groups.get(groupName).id;
          }
        }

        // Gerar slug único e link de convite único
        const guestSlug = await generateUniqueGuestSlug(record.nome.trim());
        const inviteLink = crypto.randomUUID();

        // Criar convidado
        const guest = await prisma.guest.create({
          data: {
            name: record.nome.trim(),
            slug: guestSlug,
            email: record.email?.trim() || null,
            phone: record.telefone?.trim() || null,
            groupId,
            giftSize: record.tamanho_fralda?.trim() || null,
            giftQuantity: record.quantidade_fralda ? parseInt(record.quantidade_fralda) : null,
            isChild: record.crianca?.toLowerCase() === 'sim',
            inviteLink,
          },
        });

        guests.push(guest);

        // Se for líder do grupo, registrar para atualização posterior
        if (record.grupo?.trim() && record.lider_grupo?.toLowerCase() === 'sim') {
          const groupName = record.grupo.trim();
          pendingLeaders.set(groupName, guest.id);
        }
      } catch (error) {
        errors.push({
          linha: index + 2,
          nome: record.nome,
          erro: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    // Segundo passo: atualizar os grupos com seus líderes
    for (const [groupName, guestId] of pendingLeaders.entries()) {
      const groupInfo = groups.get(groupName);
      if (groupInfo && !groupInfo.leaderId) {
        await prisma.group.update({
          where: { id: groupInfo.id },
          data: { leaderId: guestId },
        });
      }
    }

    // Retornar resultado
    return new NextResponse(JSON.stringify({
      success: true,
      convidadosImportados: guests.length,
      gruposAtualizados: pendingLeaders.size,
      erros: errors,
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[GUESTS_IMPORT]', error);
    return new NextResponse(JSON.stringify({ 
      error: 'Erro ao processar arquivo CSV', 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 
