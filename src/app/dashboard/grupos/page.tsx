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
import { Users, Pencil, Trash, Link as LinkIcon, UserPlus } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { DeleteGroupButton } from "@/components/dashboard/delete-group-button";

export default async function GroupsPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">
          Grupos
        </h1>
        <Link href="/dashboard/grupos/adicionar">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Users className="mr-2 h-4 w-4" />
            Adicionar Grupo
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Grupos</CardTitle>
          <CardDescription>
            Gerencie grupos de convidados para o chá de bebê
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="mb-4 text-lg font-medium text-gray-500">
                Nenhum grupo cadastrado
              </p>
              <p className="mb-6 text-gray-400">
                Crie grupos para organizar seus convidados por família ou outra relação
              </p>
              <Link href="/dashboard/grupos/adicionar">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Users className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Grupo
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Convidados</TableHead>
                    <TableHead>Confirmação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>
                        {group.description || "-"}
                      </TableCell>
                      <TableCell>
                        {group._count.guests}
                      </TableCell>
                      <TableCell>
                        {group.confirmation?.confirmed ? (
                          <span className="flex items-center text-green-600">
                            Confirmado
                          </span>
                        ) : (
                          <span className="flex items-center text-orange-500">
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
                            <Link href={`/dashboard/grupos/${group.id}`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                          >
                            <Link href={`/dashboard/grupos/${group.id}/membros`}>
                              <UserPlus className="h-4 w-4" />
                              <span className="sr-only">Adicionar Membros</span>
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-purple-600 hover:text-purple-700"
                            asChild
                          >
                            <Link
                              href={`/confirmar/${group.inviteLink}`}
                              target="_blank"
                            >
                              <LinkIcon className="h-4 w-4" />
                              <span className="sr-only">Link de Convite</span>
                            </Link>
                          </Button>
                          <DeleteGroupButton groupId={group.id} />
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