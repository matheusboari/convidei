"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

interface ConfirmationFormProps {
  id: string;
  isGroup: boolean;
  isConfirmed: boolean;
  confirmationId?: string;
  groupSize?: number | null;
}

export function ConfirmationForm({
  id,
  isGroup,
  isConfirmed,
  confirmationId,
  groupSize,
}: ConfirmationFormProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(isConfirmed);
  const [numberOfPeople, setNumberOfPeople] = useState<string>(
    isGroup && groupSize ? groupSize.toString() : "1"
  );
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          isGroup,
          confirmed,
          numberOfPeople: isGroup ? parseInt(numberOfPeople) : undefined,
          notifyEmail,
          email: notifyEmail ? email : undefined,
          notes,
          confirmationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao confirmar presença");
      }

      setConfirmed(confirmed);
      toast.success(confirmed ? "Presença confirmada com sucesso!" : "Ausência registrada com sucesso!");
    } catch (error) {
      toast.error("Erro ao confirmar presença. Tente novamente.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (confirmed) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-medium text-green-600">
          Sua presença está confirmada!
        </p>
        <p className="text-gray-600">
          Obrigado por confirmar sua presença. Vamos aguardar você no dia 19 de
          Julho, às 15:00.
        </p>
        <p className="text-sm text-gray-500">
          Não esqueça de levar sua fralda de presente para a Antonella!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isGroup && (
        <div className="space-y-2">
          <Label htmlFor="numberOfPeople">Número de pessoas do grupo que irão comparecer</Label>
          <Select
            value={numberOfPeople}
            onValueChange={setNumberOfPeople}
          >
            <SelectTrigger id="numberOfPeople">
              <SelectValue placeholder="Selecione o número de pessoas" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: groupSize || 10 }).map((_, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>
                  {i + 1} {i === 0 ? "pessoa" : "pessoas"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="notifyEmail" 
            checked={notifyEmail} 
            onCheckedChange={(checked) => setNotifyEmail(checked === true)}
          />
          <Label htmlFor="notifyEmail" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Desejo receber lembretes por e-mail
          </Label>
        </div>

        {notifyEmail && (
          <div className="space-y-2">
            <Label htmlFor="email">Seu e-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required={notifyEmail}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Alguma informação adicional?"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-purple-600 hover:bg-purple-700" 
        disabled={loading}
      >
        {loading ? "Confirmando..." : "Confirmar Presença"}
      </Button>
    </form>
  );
} 