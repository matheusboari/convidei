import { GroupForm } from '@/components/dashboard/group-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';

// Configurar revalidação de cache a cada 30 segundos
export const revalidate = 30;

interface EditGroupPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Componente principal da página
async function EditGroupContent({ id }: { id: string }) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  const group = await prisma.group.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      description: true,
      leaderId: true,
    },
  });

  if (!group) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">
          Editar Grupo
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar {group.name}</CardTitle>
          <CardDescription>
            Atualize as informações do grupo conforme necessário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GroupForm
            initialData={{
              id: group.id,
              name: group.name,
              description: group.description || '',
              leaderId: group.leaderId || '',
            }}
            isEditing
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Componente wrapper da página
export default async function EditGroupPage({ params }: EditGroupPageProps) {
  const { id } = await params;
  
  return (
    <Suspense 
      fallback={
        <LoadingState 
          title="Editar Grupo"
          description="Atualizando informações do grupo"
          showCards={true}
          showTable={false}
        />
      }
    >
      <EditGroupContent id={id} />
    </Suspense>
  );
} 
