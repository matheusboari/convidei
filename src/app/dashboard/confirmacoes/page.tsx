import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { X, Calendar, Users, Crown } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React from 'react';
import { ContactButton } from '@/components/dashboard/contact-button';
import { getGuestConfirmationUrl } from '@/lib/slug';

export default async function ConfirmationsPage() {
  // Buscar todos os convidados e suas confirmações
  const confirmations = await prisma.confirmation.findMany({
    include: {
      guest: {
        include: {
          group: true,
        },
      },
      group: {
        include: {
          guests: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              inviteLink: true,
              slug: true,
            },
          },
          leader: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    orderBy: [
      { confirmed: 'desc' },
      { confirmationDate: 'desc' },
    ],
  });

  // Também buscar convidados sem confirmação
  const guestsWithoutConfirmation = await prisma.guest.findMany({
    where: {
      confirmation: null,
    },
    include: {
      group: {
        include: {
          leader: {
            select: {
              id: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Contador de confirmações
  const totalConfirmed = confirmations.filter(c => c.confirmed).length;
  const totalPending = guestsWithoutConfirmation.length + confirmations.filter(c => !c.confirmed).length;

  // Formatar data relativa
  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">
          Confirmações
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Confirmados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalConfirmed}</div>
            <p className="text-sm text-gray-500">pessoas confirmaram presença</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{totalPending}</div>
            <p className="text-sm text-gray-500">pessoas ainda não confirmaram</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Taxa de Confirmação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round((totalConfirmed / (totalConfirmed + totalPending)) * 100)}%
            </div>
            <div className="mt-2 bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${(totalConfirmed / (totalConfirmed + totalPending)) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Convidados Confirmados</CardTitle>
          <CardDescription>
            Lista de pessoas que confirmaram presença no evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmations.filter(c => c.confirmed).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-2 text-lg font-medium text-gray-500">
                Nenhuma confirmação recebida ainda
              </p>
              <p className="text-gray-400">
                As confirmações aparecerão aqui quando seus convidados responderem
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo/Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Pessoas</TableHead>
                    <TableHead>Confirmação</TableHead>
                    <TableHead>Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Primeiro mostrar os grupos confirmados */}
                  {confirmations
                    .filter(confirmation => confirmation.confirmed && confirmation.group)
                    .map((confirmation) => (
                      <TableRow key={confirmation.id} className="bg-blue-50/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-blue-600" />
                            {confirmation.group?.name}
                          </div>
                          <div className="pl-6 mt-2 text-sm text-gray-500">
                            {confirmation.group?.guests.map(guest => (
                              <div key={guest.id}>{guest.name}</div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center">
                            <Users className="mr-1 h-4 w-4 text-blue-600" />
                            Grupo
                          </span>
                        </TableCell>
                        <TableCell>
                          {confirmation.numberOfPeople || confirmation.group?.guests.length || 1}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                            {formatDate(confirmation.confirmationDate)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {confirmation.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {/* Depois mostrar os convidados individuais confirmados */}
                  {confirmations
                    .filter(confirmation => confirmation.confirmed && confirmation.guest && !confirmation.guest.groupId)
                    .map((confirmation) => (
                      <TableRow key={confirmation.id}>
                        <TableCell className="font-medium">
                          {confirmation.guest?.name}
                        </TableCell>
                        <TableCell>
                          <span>Individual</span>
                        </TableCell>
                        <TableCell>
                          {confirmation.numberOfPeople || 1}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                            {formatDate(confirmation.confirmationDate)}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {confirmation.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Respostas Pendentes</CardTitle>
          <CardDescription>
            Convidados que ainda não confirmaram ou recusaram o convite
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guestsWithoutConfirmation.length === 0 && confirmations.filter(c => !c.confirmed).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-lg font-medium text-gray-500">
                Todos os convidados já responderam! 🎉
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo/Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Primeiro mostrar os grupos que recusaram */}
                  {confirmations
                    .filter(confirmation => !confirmation.confirmed && confirmation.group)
                    .map((confirmation) => {
                      const guests = confirmation.group?.guests || [];
                      const groupName = confirmation.group?.name || '';
                      const leaderId = confirmation.group?.leaderId;
                      const leader = guests.find(g => g.id === leaderId);
                      const leaderContact = leader ? {
                        name: leader.name,
                        phone: leader.phone || null,
                        inviteLink: leader.inviteLink || '',
                        slug: leader.slug || null,
                      } : { name: groupName, phone: null, inviteLink: '', slug: null };
                      return (
                        <TableRow key={confirmation.id} className="opacity-70 bg-red-50">
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-blue-600" />
                              {groupName}
                            </div>
                            <div className="pl-6 mt-2 text-sm text-gray-500">
                              {guests.map(guest => (
                                <div key={guest.id}>{guest.name}</div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center">
                              <Users className="mr-1 h-4 w-4 text-blue-600" />
                              Grupo
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center text-red-600">
                              <X className="mr-1 h-4 w-4" />
                              Recusou
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ContactButton
                                guest={leaderContact}
                                isDisabled={!leaderContact.phone}
                              />
                              <Link href={getGuestConfirmationUrl(leaderContact)} target="_blank">
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Ver convite
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  
                  {/* Depois mostrar os convidados individuais que recusaram */}
                  {confirmations
                    .filter(confirmation => !confirmation.confirmed && confirmation.guest && !confirmation.guest.groupId)
                    .map((confirmation) => (
                      confirmation.guest && (
                        <TableRow key={confirmation.id} className="opacity-70 bg-red-50">
                          <TableCell className="font-medium">
                            {confirmation.guest.name}
                          </TableCell>
                          <TableCell>
                            <span>Individual</span>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center text-red-600">
                              <X className="mr-1 h-4 w-4" />
                              Recusou
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ContactButton
                                guest={{
                                  name: confirmation.guest.name,
                                  phone: confirmation.guest.phone || null,
                                  inviteLink: confirmation.guest.inviteLink || '',
                                }}
                                isDisabled={!confirmation.guest.phone}
                              />
                              <Link href={getGuestConfirmationUrl(confirmation.guest)} target="_blank">
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Ver convite
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    ))}
                  
                  {/* Agrupar convidados sem resposta por grupo */}
                  {Object.entries(
                    guestsWithoutConfirmation.reduce((acc, guest) => {
                      const groupName = guest.group?.name || 'Sem Grupo';
                      if (!acc[groupName]) {
                        acc[groupName] = [];
                      }
                      acc[groupName].push(guest);
                      return acc;
                    }, {} as Record<string, typeof guestsWithoutConfirmation>),
                  ).map(([groupName, guests]) => (
                    <React.Fragment key={groupName}>
                      {groupName !== 'Sem Grupo' ? (
                        <TableRow className="bg-gray-50/50">
                          <TableCell className="font-medium align-top">
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-blue-600" />
                              <span className="font-medium">{groupName}</span>
                            </div>
                            <div className="pl-6 mt-1 text-sm text-gray-500">
                              {guests.map((guest) => (
                                <div key={guest.id} className="flex items-center gap-2">
                                  {guest.group?.leaderId === guest.id && (
                                    <Crown className="h-3 w-3 text-amber-500" />
                                  )}
                                  {guest.name}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="align-center">
                            <span className="flex items-center text-gray-600">
                              <Users className="mr-1 h-4 w-4 text-blue-600" />
                              Grupo
                            </span>
                          </TableCell>
                          <TableCell className="align-center">
                            <span className="flex items-center text-orange-500">
                              <X className="mr-1 h-4 w-4" />
                              Pendente
                            </span>
                          </TableCell>
                          <TableCell className="align-middle">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const leader = guests.find(g => g.group?.leaderId === g.id);
                                return (
                                  <ContactButton
                                    guest={leader || { name: groupName, phone: null, inviteLink: '', slug: null }}
                                    isDisabled={!leader?.phone}
                                  />
                                );
                              })()}
                              <Link href={getGuestConfirmationUrl(guests.find(g => g.group?.leaderId === g.id) || guests[0])} target="_blank">
                                <Button
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700"
                                >
                                  Ver convite
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        guests.map((guest) => (
                          <TableRow key={guest.id}>
                            <TableCell className="font-medium">{guest.name}</TableCell>
                            <TableCell>
                              <span>Individual</span>
                            </TableCell>
                            <TableCell>
                              <span className="flex items-center text-orange-500">
                                <X className="mr-1 h-4 w-4" />
                                Pendente
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ContactButton
                                  guest={guest}
                                  isDisabled={!guest.phone}
                                />
                                <Link href={getGuestConfirmationUrl(guest)} target="_blank">
                                  <Button
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Ver convite
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
