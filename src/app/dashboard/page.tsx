import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, UserPlus, UserCheck, Users, Gift, Calendar } from 'lucide-react';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LoadingState } from '@/components/ui/loading-state';

// Configurar revalidação de cache a cada 30 segundos
export const revalidate = 30;

// Componente principal da página
async function DashboardContent() {
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  // Buscar estatísticas do banco de dados
  const totalGuests = await prisma.guest.count();
  const totalGroups = await prisma.group.count();
  
  const confirmedGuests = await prisma.confirmation.count({
    where: {
      confirmed: true,
    },
  });
  
  // Calcular fraldas prometidas - somando a quantidade de fraldas de todos os convidados confirmados
  const confirmedGifts = await prisma.guest.findMany({
    where: {
      confirmation: {
        confirmed: true,
      },
      giftQuantity: {
        not: null,
      },
    },
    select: {
      giftQuantity: true,
    },
  });
  
  const totalDiapers = confirmedGifts.reduce((acc, guest) => acc + (guest.giftQuantity || 0), 0);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-purple-800">Chá de Bebê da Antonella</h1>
        <p className="text-lg text-gray-500">19 de Julho de 2025, às 15:30</p>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Convidados</CardTitle>
                <User className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGuests}</div>
                <p className="text-xs text-muted-foreground">
                  Convidados individuais registrados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{confirmedGuests}</div>
                <p className="text-xs text-muted-foreground">
                  Convidados que confirmaram presença
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grupos</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalGroups}</div>
                <p className="text-xs text-muted-foreground">
                  Grupos de convidados criados
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fraldas Prometidas</CardTitle>
                <Gift className="h-4 w-4 text-pink-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDiapers}</div>
                <p className="text-xs text-muted-foreground">
                  Total de fraldas prometidas
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Próximos Passos</CardTitle>
                <CardDescription>
                  O que você pode fazer a seguir para preparar o chá de bebê
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <UserPlus className="mt-1 h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Adicione convidados individuais</h3>
                    <p className="text-sm text-gray-500">
                      Cadastre os convidados que participarão do evento e gere os links de confirmação.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="mt-1 h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Crie grupos de convidados</h3>
                    <p className="text-sm text-gray-500">
                      Organize os convidados em grupos para facilitar o gerenciamento.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Gift className="mt-1 h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Gerencie os presentes</h3>
                    <p className="text-sm text-gray-500">
                      Registre as fraldas que cada convidado vai levar para o evento.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Calendar className="mt-1 h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Acompanhe as confirmações</h3>
                    <p className="text-sm text-gray-500">
                      Verifique quem confirmou presença e quais presentes foram prometidos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>
                Visualização detalhada das informações do evento
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {totalGuests > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Taxa de Confirmação</h3>
                    <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${(confirmedGuests / totalGuests) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {confirmedGuests} de {totalGuests} convidados confirmaram presença ({Math.round((confirmedGuests / totalGuests) * 100)}%)
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Fraldas por Convidado Confirmado</h3>
                    <p className="text-2xl font-bold">
                      {confirmedGuests > 0 ? Math.round(totalDiapers / confirmedGuests) : 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      Média de fraldas por convidado que confirmou presença
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Estatísticas estarão disponíveis quando houver dados de convidados cadastrados.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Componente wrapper da página
export default function DashboardPage() {
  return (
    <Suspense 
      fallback={
        <LoadingState 
          title="Dashboard"
          description="Visão geral do evento"
          showCards={true}
          showTable={false}
        />
      }
    >
      <DashboardContent />
    </Suspense>
  );
} 
