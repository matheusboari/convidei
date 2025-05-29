import { GroupForm } from '@/components/dashboard/group-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { auth } from '../../../../../auth';
import { redirect, notFound } from 'next/navigation';

interface EditGroupPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGroupPage({ params }: EditGroupPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  const { id } = await params;
  
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
