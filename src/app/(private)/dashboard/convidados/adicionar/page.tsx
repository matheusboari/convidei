import { GuestForm } from '@/components/dashboard/guest-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AddGuestPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  // Buscar os grupos para o dropdown
  const groups = await prisma.group.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">
          Adicionar Convidado
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Convidado</CardTitle>
          <CardDescription>
            Preencha os dados do convidado que deseja adicionar à lista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuestForm groups={groups} />
        </CardContent>
      </Card>
    </div>
  );
} 
