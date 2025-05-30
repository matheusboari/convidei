import prisma from '@/lib/prisma';

/**
 * Converte um nome em slug, removendo acentos e caracteres especiais
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim();
}

/**
 * Gera um slug único para um convidado
 */
export async function generateUniqueGuestSlug(name: string): Promise<string> {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // Verifica se o slug já existe
  while (await prisma.guest.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Gera um slug único para um grupo
 */
export async function generateUniqueGroupSlug(name: string): Promise<string> {
  const baseSlug = createSlug(name);
  let slug = baseSlug;
  let counter = 1;

  // Verifica se o slug já existe
  while (await prisma.group.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Busca um convidado por slug ou inviteLink
 */
export async function findGuestBySlugOrInviteLink(identifier: string) {
  // Primeiro tenta buscar por slug
  let guest = await prisma.guest.findUnique({
    where: { slug: identifier },
    include: {
      confirmation: true,
      group: true,
      leadingGroups: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Se não encontrar por slug, tenta por inviteLink (para compatibilidade)
  if (!guest) {
    guest = await prisma.guest.findUnique({
      where: { inviteLink: identifier },
      include: {
        confirmation: true,
        group: true,
        leadingGroups: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  return guest;
}

/**
 * Busca um grupo por slug ou inviteLink
 */
export async function findGroupBySlugOrInviteLink(identifier: string) {
  // Primeiro tenta buscar por slug
  let group = await prisma.group.findUnique({
    where: { slug: identifier },
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

  // Se não encontrar por slug, tenta por inviteLink (para compatibilidade)
  if (!group) {
    group = await prisma.group.findUnique({
      where: { inviteLink: identifier },
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
  }

  return group;
}

/**
 * Gera URL de confirmação para um convidado, preferindo slug
 */
export function getGuestConfirmationUrl(guest: { slug: string | null; inviteLink: string }) {
  const identifier = guest.slug || guest.inviteLink;
  return `/confirmar/${identifier}`;
}

/**
 * Gera URL de confirmação para um grupo através do líder, preferindo slug
 */
export function getGroupConfirmationUrl(leader: { slug: string | null; inviteLink: string }) {
  const identifier = leader.slug || leader.inviteLink;
  return `/confirmar/${identifier}`;
}

/**
 * Gera URL completa de confirmação para WhatsApp, preferindo slug
 */
export function getGuestWhatsAppUrl(guest: { slug: string | null; inviteLink: string; name: string; phone?: string | null }) {
  const identifier = guest.slug || guest.inviteLink;
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirmar/${identifier}`;
  
  const message = `Olá ${guest.name}! Você foi convidado(a) para o chá de fraldas da Antonella! Para confirmar sua presença, acesse: ${confirmationUrl}`;
  
  if (guest.phone) {
    return `https://wa.me/${guest.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  }
  
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
} 
