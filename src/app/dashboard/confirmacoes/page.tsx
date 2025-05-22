import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X, Mail, Calendar, Users } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function ConfirmationsPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

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
            },
          },
        },
      },
    },
    orderBy: [
      { confirmed: "desc" },
      { confirmationDate: "desc" },
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
            }
          }
        }
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Contador de confirmações
  const totalConfirmed = confirmations.filter(c => c.confirmed).length;
  const totalPending = guestsWithoutConfirmation.length + confirmations.filter(c => !c.confirmed).length;

  // Formatar data relativa
  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
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
                          {confirmation.notes || "-"}
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
                          {confirmation.notes || "-"}
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
                    .map((confirmation) => (
                      <TableRow key={confirmation.id} className="opacity-70 bg-red-50">
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
                          <span className="flex items-center text-red-600">
                            <X className="mr-1 h-4 w-4" />
                            Recusou
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href={`mailto:${confirmation.group?.guests[0]?.email}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!confirmation.group?.guests[0]?.email}
                            >
                              <Mail className="mr-1 h-4 w-4" />
                              Contatar
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {/* Depois mostrar os convidados individuais que recusaram */}
                  {confirmations
                    .filter(confirmation => !confirmation.confirmed && confirmation.guest && !confirmation.guest.groupId)
                    .map((confirmation) => (
                      <TableRow key={confirmation.id} className="opacity-70 bg-red-50">
                        <TableCell className="font-medium">
                          {confirmation.guest?.name}
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
                          <Link href={`mailto:${confirmation.guest?.email}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!confirmation.guest?.email}
                            >
                              <Mail className="mr-1 h-4 w-4" />
                              Contatar
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  
                  {/* Agrupar convidados sem resposta por grupo */}
                  {Object.entries(
                    guestsWithoutConfirmation.reduce((acc, guest) => {
                      const groupName = guest.group?.name || "Sem Grupo";
                      if (!acc[groupName]) {
                        acc[groupName] = [];
                      }
                      acc[groupName].push(guest);
                      return acc;
                    }, {} as Record<string, typeof guestsWithoutConfirmation>)
                  ).map(([groupName, guests]) => (
                    <>
                      {groupName !== "Sem Grupo" && (
                        <TableRow key={groupName} className="bg-gray-50/50">
                          <TableCell colSpan={4} className="py-2">
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4 text-blue-600" />
                              <span className="font-medium">{groupName}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {guests.map((guest) => (
                        <TableRow key={guest.id} className={groupName !== "Sem Grupo" ? "pl-4" : ""}>
                          <TableCell className="font-medium">
                            {guest.name}
                          </TableCell>
                          <TableCell>
                            {guest.group ? (
                              <span className="flex items-center">
                                <Users className="mr-1 h-4 w-4 text-blue-600" />
                                Grupo
                              </span>
                            ) : (
                              <span>Individual</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center text-orange-500">
                              <X className="mr-1 h-4 w-4" />
                              Sem resposta
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Link href={`mailto:${guest.email}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={!guest.email}
                                >
                                  <Mail className="mr-1 h-4 w-4" />
                                  Contatar
                                </Button>
                              </Link>
                              {(!guest.group || guest.group.leader?.id === guest.id) ? (
                                <Link href={`/confirmar/${guest.inviteLink}`} target="_blank">
                                  <Button
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    Ver convite
                                  </Button>
                                </Link>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-gray-400"
                                  disabled
                                  title="Apenas o líder do grupo pode confirmar a presença"
                                >
                                  Ver convite
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
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