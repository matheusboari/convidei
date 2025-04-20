"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

interface DeleteGroupButtonProps {
  groupId: string;
}

export function DeleteGroupButton({ groupId }: DeleteGroupButtonProps) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    if (!confirm("Tem certeza que deseja excluir este grupo? Isso removerá todos os convidados associados a ele.")) {
      e.preventDefault();
    }
  };

  return (
    <form action={`/api/groups/${groupId}/delete`} method="POST">
      <Button
        variant="outline"
        size="icon"
        type="submit"
        className="text-red-500 hover:text-red-600"
        onClick={handleDeleteClick}
      >
        <Trash className="h-4 w-4" />
        <span className="sr-only">Excluir</span>
      </Button>
    </form>
  );
} 