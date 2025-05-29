import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { auth } from "../../../../auth";
import { redirect } from "next/navigation";
import { ImportGuestsButton } from "@/components/dashboard/import-guests-button";
import { GuestsList } from "@/components/dashboard/guests-list";

export default async function GuestsPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }

  const guests = await prisma.guest.findMany({
    include: {
      group: {
        include: {
          leader: {
            select: {
              id: true,
            }
          }
        }
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
        <div>
          <h1 className="text-2xl font-bold">Convidados</h1>
          <p className="text-gray-500">
            Gerencie a lista de convidados para o chá de bebê
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ImportGuestsButton />
          <Link href="/dashboard/convidados/adicionar">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Novo Convidado
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Convidados</CardTitle>
          <CardDescription>
            Gerencie os convidados e suas confirmações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="mb-4 text-lg font-medium text-gray-500">
                Nenhum convidado cadastrado
              </p>
              <p className="mb-6 text-gray-400">
                Adicione convidados para começar a gerenciar a lista
              </p>
              <Link href="/dashboard/convidados/adicionar">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Convidado
                </Button>
              </Link>
            </div>
          ) : (
            <GuestsList guests={guests} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
