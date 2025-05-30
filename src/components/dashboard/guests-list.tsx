'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Pencil, Link as LinkIcon, Check, X, Baby, Crown, ChevronDown, ChevronRight , Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DeleteGuestButton } from '@/components/dashboard/delete-guest-button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isChild: boolean;
  giftSize: string | null;
  giftQuantity: number | null;
  inviteLink: string;
  group: {
    id: string;
    name: string;
    leader: {
      id: string;
    } | null;
  } | null;
  confirmation: {
    confirmed: boolean;
  } | null;
}

interface GuestsListProps {
  guests: Guest[];
}

export function GuestsList({ guests }: GuestsListProps) {
  const [groupByGroup, setGroupByGroup] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Separar convidados com e sem grupo usando useMemo
  const { guestsWithGroup, guestsWithoutGroup } = useMemo(() => {
    return {
      guestsWithGroup: guests.filter(guest => guest.group),
      guestsWithoutGroup: guests.filter(guest => !guest.group),
    };
  }, [guests]);

  // Agrupar convidados por grupo usando useMemo
  const groupedGuests = useMemo(() => {
    return groupByGroup
      ? guestsWithGroup.reduce((acc, guest) => {
        const groupName = guest.group?.name || 'Individual';
        if (!acc[groupName]) {
          acc[groupName] = [];
        }
        acc[groupName].push(guest);
        return acc;
      }, {} as Record<string, Guest[]>)
      : { 'Todos os Convidados': guests };
  }, [groupByGroup, guestsWithGroup, guests]);

  // Função para alternar o estado de colapso de um grupo
  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Inicializar todos os grupos como colapsados quando o agrupamento é ativado
  useEffect(() => {
    if (groupByGroup) {
      const initialCollapsedState: Record<string, boolean> = {};
      Object.keys(groupedGuests).forEach(groupName => {
        initialCollapsedState[groupName] = true;
      });
      setCollapsedGroups(initialCollapsedState);
    }
  }, [groupByGroup]); // Remover groupedGuests da dependência para evitar loop infinito

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end space-x-2">
        <Switch 
          id="group-by" 
          checked={groupByGroup}
          onCheckedChange={setGroupByGroup}
        />
        <Label htmlFor="group-by" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          Agrupar por grupo
        </Label>
      </div>

      <div className="overflow-auto">
        {groupByGroup ? (
          <>
            {/* Exibir convidados sem grupo primeiro */}
            {guestsWithoutGroup.length > 0 && (
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h3 className="text-lg font-semibold text-purple-800">
                    Convidados Individuais
                  </h3>
                  <Badge className="ml-2 bg-purple-100 text-purple-800">
                    {guestsWithoutGroup.length} {guestsWithoutGroup.length === 1 ? 'convidado' : 'convidados'}
                  </Badge>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Presente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guestsWithoutGroup.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell className="font-medium">
                          {guest.name}
                          {guest.isChild && (
                            <Badge className="ml-2 bg-pink-100 text-pink-800 hover:bg-pink-100">
                              Criança
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {guest.giftSize && (
                            <div className="flex items-center gap-1">
                              <Baby className="h-4 w-4 text-blue-500" />
                              <span>
                                {guest.giftSize}
                                {guest.giftQuantity && guest.giftQuantity > 1 
                                  ? ` (${guest.giftQuantity})`
                                  : ''}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {guest.confirmation?.confirmed === true ? (
                            <span className="flex items-center text-green-600">
                              <Check className="mr-1 h-4 w-4" />
                              Confirmado
                            </span>
                          ) : guest.confirmation?.confirmed === false ? (
                            <span className="flex items-center text-red-600">
                              <X className="mr-1 h-4 w-4" />
                              Recusou
                            </span>
                          ) : (
                            <span className="flex items-center text-orange-500">
                              <X className="mr-1 h-4 w-4" />
                              Pendente
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              asChild
                            >
                              <Link href={`/dashboard/convidados/${guest.id}`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Link>
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-purple-600 hover:text-purple-700"
                                    asChild
                                  >
                                    <Link
                                      href={`/confirmar/${guest.inviteLink}`}
                                      target="_blank"
                                    >
                                      <LinkIcon className="h-4 w-4" />
                                      <span className="sr-only">Link de Convite</span>
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Link de confirmação individual
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <DeleteGuestButton guestId={guest.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Exibir grupos de convidados */}
            {Object.entries(groupedGuests).map(([groupName, groupGuests]) => (
              <div key={groupName} className="mb-6">
                <div 
                  className="mb-2 flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-md"
                  onClick={() => toggleGroupCollapse(groupName)}
                >
                  {collapsedGroups[groupName] ? (
                    <ChevronRight className="h-5 w-5 text-gray-500 mr-1" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 mr-1" />
                  )}
                  <h3 className="text-lg font-semibold text-purple-800">
                    {groupName}
                  </h3>
                  <Badge className="ml-2 bg-purple-100 text-purple-800">
                    {groupGuests.length} {groupGuests.length === 1 ? 'convidado' : 'convidados'}
                  </Badge>
                </div>
                
                {!collapsedGroups[groupName] && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Presente</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupGuests.map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">
                            {guest.name}
                            {guest.isChild && (
                              <Badge className="ml-2 bg-pink-100 text-pink-800 hover:bg-pink-100">
                                Criança
                              </Badge>
                            )}
                            {guest.group?.leader?.id === guest.id && (
                              <Crown className="ml-2 h-4 w-4 text-amber-500 inline" />
                            )}
                          </TableCell>
                          <TableCell>
                            {guest.giftSize && (
                              <div className="flex items-center gap-1">
                                <Baby className="h-4 w-4 text-blue-500" />
                                <span>
                                  {guest.giftSize}
                                  {guest.giftQuantity && guest.giftQuantity > 1 
                                    ? ` (${guest.giftQuantity})`
                                    : ''}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {guest.confirmation?.confirmed === true ? (
                              <span className="flex items-center text-green-600">
                                <Check className="mr-1 h-4 w-4" />
                                Confirmado
                              </span>
                            ) : guest.confirmation?.confirmed === false ? (
                              <span className="flex items-center text-red-600">
                                <X className="mr-1 h-4 w-4" />
                                Recusou
                              </span>
                            ) : (
                              <span className="flex items-center text-orange-500">
                                <X className="mr-1 h-4 w-4" />
                                Pendente
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                asChild
                              >
                                <Link href={`/dashboard/convidados/${guest.id}`}>
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Link>
                              </Button>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    {guest.group?.leader?.id === guest.id ? (
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-purple-600 hover:text-purple-700"
                                        asChild
                                      >
                                        <Link
                                          href={`/confirmar/${guest.inviteLink}`}
                                          target="_blank"
                                        >
                                          <LinkIcon className="h-4 w-4" />
                                          <span className="sr-only">Link de Convite</span>
                                        </Link>
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="text-gray-300 border-gray-200 cursor-not-allowed"
                                        disabled
                                      >
                                        <LinkIcon className="h-4 w-4" />
                                        <span className="sr-only">Link de Convite</span>
                                      </Button>
                                    )}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {guest.group?.leader?.id === guest.id ? (
                                      'Link de confirmação do grupo'
                                    ) : (
                                      'Apenas o líder do grupo pode confirmar a presença'
                                    )}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <DeleteGuestButton guestId={guest.id} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ))}
          </>
        ) : (
          // Visualização normal (não agrupada)
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Presente</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">
                    {guest.name}
                    {guest.isChild && (
                      <Badge className="ml-2 bg-pink-100 text-pink-800 hover:bg-pink-100">
                        Criança
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.group ? (
                      <div className="flex items-center gap-1">
                        {guest.group.leader?.id === guest.id && (
                          <Crown className="h-4 w-4 text-amber-500" />
                        )}
                        <span>{guest.group.name}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-gray-400 border-gray-200">
                        Individual
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.giftSize && (
                      <div className="flex items-center gap-1">
                        <Baby className="h-4 w-4 text-blue-500" />
                        <span>
                          {guest.giftSize}
                          {guest.giftQuantity && guest.giftQuantity > 1 
                            ? ` (${guest.giftQuantity})`
                            : ''}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {guest.confirmation?.confirmed === true ? (
                      <span className="flex items-center text-green-600">
                        <Check className="mr-1 h-4 w-4" />
                        Confirmado
                      </span>
                    ) : guest.confirmation?.confirmed === false ? (
                      <span className="flex items-center text-red-600">
                        <X className="mr-1 h-4 w-4" />
                        Recusou
                      </span>
                    ) : (
                      <span className="flex items-center text-orange-500">
                        <X className="mr-1 h-4 w-4" />
                        Pendente
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                      >
                        <Link href={`/dashboard/convidados/${guest.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {(!guest.group || guest.group.leader?.id === guest.id) ? (
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-purple-600 hover:text-purple-700"
                                asChild
                              >
                                <Link
                                  href={`/confirmar/${guest.inviteLink}`}
                                  target="_blank"
                                >
                                  <LinkIcon className="h-4 w-4" />
                                  <span className="sr-only">Link de Convite</span>
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-gray-300 border-gray-200 cursor-not-allowed"
                                disabled
                              >
                                <LinkIcon className="h-4 w-4" />
                                <span className="sr-only">Link de Convite</span>
                              </Button>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            {!guest.group ? (
                              'Link de confirmação individual'
                            ) : guest.group.leader?.id === guest.id ? (
                              'Link de confirmação do grupo'
                            ) : (
                              'Apenas o líder do grupo pode confirmar a presença'
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DeleteGuestButton guestId={guest.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
} 
