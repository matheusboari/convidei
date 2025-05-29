import { GuestForm } from '@/components/dashboard/guest-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { auth } from '../../../../../auth';
import { redirect, notFound } from 'next/navigation';

interface EditGuestPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGuestPage({ params }: EditGuestPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  const { id } = await params;
  
  const guest = await prisma.guest.findUnique({
    where: {
      id,
    },
  });

  if (!guest) {
    notFound();
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
          Editar Convidado
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar {guest.name}</CardTitle>
          <CardDescription>
            Atualize os dados do convidado conforme necessário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GuestForm
            initialData={{
              id: guest.id,
              name: guest.name,
              email: guest.email || '',
              phone: guest.phone || '',
              groupId: guest.groupId || '',
              giftSize: guest.giftSize || '',
              giftQuantity: guest.giftQuantity || 1,
            }}
            groups={groups}
            isEditing
          />
        </CardContent>
      </Card>
    </div>
  );
} 
