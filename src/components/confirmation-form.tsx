'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationFormProps {
  guest: {
    id: string;
    name: string;
    groupId: string | null;
    group?: {
      id: string;
      name: string;
    } | null;
  };
  defaultConfirmed?: boolean;
  defaultNotes?: string;
}

export function ConfirmationForm({
  guest,
  defaultConfirmed,
  defaultNotes = '',
}: ConfirmationFormProps) {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(defaultConfirmed);
  const [notes, setNotes] = useState(defaultNotes);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isGroupMember = guest.groupId !== null && guest.group !== null;

  const handleConfirm = async (willAttend: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/confirm/${guest.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmed: willAttend,
          notes,
        }),
      });

      if (!response.ok) {
        throw new Error('Ocorreu um erro ao confirmar sua presença');
      }

      setConfirmed(willAttend);
      setSubmitted(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-4">
        <Alert className={confirmed ? 'bg-green-50' : 'bg-orange-50'}>
          <div
            className={`p-2 rounded-full ${
              confirmed ? 'bg-green-100' : 'bg-orange-100'
            } inline-flex`}
          >
            {confirmed ? (
              <Check className="h-5 w-5 text-green-700" />
            ) : (
              <X className="h-5 w-5 text-orange-700" />
            )}
          </div>
          <AlertTitle className="mt-4 text-lg">
            {confirmed
              ? isGroupMember
                ? `Presença confirmada para o grupo ${guest.group?.name}`
                : 'Presença confirmada!'
              : 'Ausência registrada'}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {confirmed
              ? isGroupMember
                ? 'Sua confirmação foi registrada para todos os membros do grupo. Estamos ansiosos para receber vocês!'
                : 'Obrigado por confirmar sua presença. Estamos ansiosos para receber você!'
              : 'Agradecemos por nos informar. Sentiremos sua falta!'}
            {notes && (
              <div className="mt-4">
                <p className="font-medium">Sua mensagem:</p>
                <p className="italic mt-1">{notes}</p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isGroupMember && (
        <Alert className="bg-purple-50 border-purple-200">
          <AlertTriangle className="h-5 w-5 text-purple-700" />
          <AlertTitle className="text-purple-800">
            Confirmação para o grupo {guest.group?.name}
          </AlertTitle>
          <AlertDescription className="text-purple-700">
            Ao confirmar sua presença, você estará confirmando para todos os membros do grupo.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Você vai comparecer?</h3>
        <div className="flex gap-3">
          <Button
            onClick={() => handleConfirm(true)}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            <Check className="mr-2 h-4 w-4" />
            Sim, vou comparecer
          </Button>
          <Button
            onClick={() => handleConfirm(false)}
            variant="outline"
            className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
            disabled={loading}
          >
            <X className="mr-2 h-4 w-4" />
            Não poderei ir
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium">Deixe uma mensagem (opcional)</h3>
        <Textarea
          placeholder="Digite uma mensagem para os organizadores (opcional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px]"
          disabled={loading}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 
