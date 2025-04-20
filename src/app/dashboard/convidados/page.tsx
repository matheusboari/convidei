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
import { UserPlus, Pencil, Link as LinkIcon, Check, X } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { DeleteGuestButton } from "@/components/dashboard/delete-guest-button";

export default async function GuestsPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  const guests = await prisma.guest.findMany({
    include: {
      group: true,
      confirmation: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">
          Convidados
        </h1>
        <Link href="/dashboard/convidados/adicionar">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Convidado
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Convidados</CardTitle>
          <CardDescription>
            Gerencie todos os convidados do chá de bebê.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="mb-4 text-lg font-medium text-gray-500">
                Nenhum convidado cadastrado
              </p>
              <p className="mb-6 text-gray-400">
                Adicione convidados para enviar os convites e gerenciar as
                confirmações
              </p>
              <Link href="/dashboard/convidados/adicionar">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Convidado
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Presente</TableHead>
                    <TableHead>Confirmação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{guest.name}</TableCell>
                      <TableCell>
                        {guest.email || guest.phone || "-"}
                      </TableCell>
                      <TableCell>
                        {guest.group ? guest.group.name : "-"}
                      </TableCell>
                      <TableCell>
                        {guest.giftSize
                          ? `${guest.giftSize} (${guest.giftQuantity || 1})`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {guest.confirmation?.confirmed ? (
                          <span className="flex items-center text-green-600">
                            <Check className="mr-1 h-4 w-4" />
                            Confirmado
                          </span>
                        ) : (
                          <span className="flex items-center text-orange-500">
                            <X className="mr-1 h-4 w-4" />
                            Pendente
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
                          <DeleteGuestButton guestId={guest.id} />
                        </div>
                      </TableCell>
                    </TableRow>
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
