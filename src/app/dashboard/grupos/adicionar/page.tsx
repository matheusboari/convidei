import { Button } from '@/components/ui/button';
import { GroupForm } from '@/components/dashboard/group-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';

// Configurar revalidação de cache a cada 30 segundos
export const revalidate = 30;

// Componente principal da página
async function AddGroupContent() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">
          Adicionar Grupo
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novo Grupo</CardTitle>
          <CardDescription>
            Crie um grupo para organizar seus convidados, como por exemplo família ou amigos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GroupForm />
        </CardContent>
      </Card>
    </div>
  );
}

// Componente wrapper da página
export default function AddGroupPage() {
  return (
    <Suspense 
      fallback={
        <LoadingState 
          title="Adicionar Grupo"
          description="Criando novo grupo"
          showCards={true}
          showTable={false}
        />
      }
    >
      <AddGroupContent />
    </Suspense>
  );
} 
