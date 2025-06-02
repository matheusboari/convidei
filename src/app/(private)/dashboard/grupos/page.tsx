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
import { Users, Pencil, Link as LinkIcon, UserPlus, Crown, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { DeleteGroupButton } from '@/components/dashboard/delete-group-button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getGuestConfirmationUrl } from '@/lib/slug';
import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';

// Configurar revalidação de cache a cada 30 segundos
export const revalidate = 30;

interface GroupWithRelations {
  id: string;
  name: string;
  description: string | null;
  inviteLink: string;
  leaderId: string | null;
  createdAt: Date;
  updatedAt: Date;
  leader: {
    id: string;
    name: string;
    email: string | null;
    inviteLink: string;
    slug: string;
  } | null;
  _count: {
    guests: number;
  };
  confirmation: {
    id: string;
    confirmed: boolean;
  } | null;
}

// Componente principal da página
async function GroupsContent() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = session.user.id;

  const groups = await prisma.group.findMany({
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
          inviteLink: true,
          slug: true,
        },
      },
      guests: {
        select: {
          id: true,
        },
      },
      confirmation: {
        select: {
          id: true,
          confirmed: true,
        },
      },
      _count: {
        select: {
          guests: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  }) as GroupWithRelations[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grupos</h1>
          <p className="text-gray-500">
            Organize convidados em grupos para facilitar o gerenciamento
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/grupos/adicionar">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Users className="mr-2 h-4 w-4" />
              Novo Grupo
            </Button>
          </Link>
        </div>
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
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Para um grupo receber confirmação, é necessário definir um líder. O líder receberá o link para confirmar a presença de todos os membros.
                </AlertDescription>
              </Alert>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Líder</TableHead>
                    <TableHead className="text-center">Convidados</TableHead>
                    <TableHead className="text-center">Confirmação</TableHead>
                    <TableHead className="text-center">Link</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Link href={`/dashboard/grupos/${group.id}`}>
                            {group.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        {group.leader ? (
                          <div className="flex items-center">
                            <Crown className="mr-2 h-4 w-4 text-amber-500" />
                            {group.leader.name}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-400 border-gray-200">
                            Não definido
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {group._count.guests}
                      </TableCell>
                      <TableCell className="text-center">
                        {group.confirmation?.confirmed ? (
                          <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">
                            Confirmado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-400 border-gray-200">
                            Pendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                {group.leader ? (
                                  <Link
                                    href={getGuestConfirmationUrl(group.leader)}
                                    target="_blank"
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                  </Link>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-gray-300 border-gray-200 cursor-not-allowed"
                                    disabled
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {group.leader
                                ? 'Link de confirmação do grupo'
                                : 'Defina um líder para obter o link de confirmação'}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Link href={`/dashboard/grupos/${group.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/grupos/${group.id}/membros`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </Link>
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

// Componente wrapper da página
export default function GroupsPage() {
  return (
    <Suspense 
      fallback={
        <LoadingState 
          title="Grupos"
          description="Lista de grupos de convidados"
          showCards={true}
          showTable={true}
          tableRows={8}
        />
      }
    >
      <GroupsContent />
    </Suspense>
  );
} 
