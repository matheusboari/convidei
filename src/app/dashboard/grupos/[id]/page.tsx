import { GroupForm } from "@/components/dashboard/group-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { auth } from "../../../../../auth";
import { redirect, notFound } from "next/navigation";

interface EditGroupPageProps {
  params: {
    id: string;
  };
}

export default async function EditGroupPage({ params }: EditGroupPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  const group = await prisma.group.findUnique({
    where: {
      id: params.id,
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
              description: group.description || "",
            }}
            isEditing
          />
        </CardContent>
      </Card>
    </div>
  );
} 