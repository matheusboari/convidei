import { GroupForm } from "@/components/dashboard/group-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { auth } from "../../../../../auth";
import { redirect } from "next/navigation";

export default async function AddGroupPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
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