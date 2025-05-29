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
import { Trash, User, UserPlus } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { auth } from '../../../../../../auth';
import { redirect, notFound } from 'next/navigation';
import { GroupMembersForm } from '@/components/dashboard/group-members-form';

interface GroupMembersPageProps {
  params: {
    id: string;
  };
}

export default async function GroupMembersPage({ params }: GroupMembersPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  const group = await prisma.group.findUnique({
    where: {
      id: params.id,
    },
    include: {
      guests: true,
    },
  });

  if (!group) {
    notFound();
  }

  // Buscar convidados que não estão em nenhum grupo
  const availableGuests = await prisma.guest.findMany({
    where: {
      groupId: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">
          Membros do Grupo
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Membros do Grupo: {group.name}</CardTitle>
          <CardDescription>
            Adicione ou remova convidados deste grupo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Membros Atuais</h2>
              {group.guests.length === 0 ? (
                <p className="text-gray-500">Este grupo ainda não possui membros.</p>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.guests.map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell className="font-medium">{guest.name}</TableCell>
                          <TableCell>
                            {guest.email || guest.phone || '-'}
                          </TableCell>
                          <TableCell>
                            <form action={`/api/groups/${group.id}/members/${guest.id}/remove`} method="POST">
                              <Button
                                variant="outline"
                                size="sm"
                                type="submit"
                                className="text-red-500"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Remover
                              </Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Adicionar Membros</h2>
              {availableGuests.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-gray-500">
                    Não há convidados disponíveis para adicionar a este grupo.
                  </p>
                  <Link href="/dashboard/convidados/adicionar">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar Novo Convidado
                    </Button>
                  </Link>
                </div>
              ) : (
                <GroupMembersForm groupId={group.id} availableGuests={availableGuests} />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
