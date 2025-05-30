'use client';

import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { getGuestWhatsAppUrl } from '@/lib/slug';

interface ContactButtonProps {
  guest: {
    name: string;
    phone: string | null;
    inviteLink: string;
    slug?: string | null;
  };
  isDisabled: boolean;
  disabledTitle?: string;
}

export function ContactButton({ guest, isDisabled, disabledTitle }: ContactButtonProps) {
  const handleClick = () => {
    const whatsappUrl = getGuestWhatsAppUrl({
      name: guest.name,
      phone: guest.phone,
      slug: guest.slug || null,
      inviteLink: guest.inviteLink,
    });
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
