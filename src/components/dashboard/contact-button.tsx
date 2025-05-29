'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface ContactButtonProps {
  guest: {
    name: string;
    phone: string | null;
    inviteLink: string;
  };
  isDisabled: boolean;
  disabledTitle?: string;
}

export function ContactButton({ guest, isDisabled, disabledTitle }: ContactButtonProps) {
  const handleClick = () => {
    const message = `Olá ${guest.name}! Você foi convidado(a) para o chá de fraldas da Antonella! \n\nData: 19 de julho de 2025\nHorário: 15:00\nLocal: Villa di Helena\nEndereço: Av. Amaleto Marino, 250 - Res. Santa Izabel\n\nPara confirmar sua presença, acesse o link: ${process.env.NEXT_PUBLIC_APP_URL}/confirmar/${guest.inviteLink}`;
    const whatsappUrl = `https://wa.me/${guest.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isDisabled}
      title={disabledTitle}
      onClick={handleClick}
    >
      <MessageCircle className="mr-1 h-4 w-4" />
      Contatar
    </Button>
  );
} 
