import { notFound } from "next/navigation";
import { GuestConfirmationForm } from "@/components/guest/guest-confirmation-form";
import prisma from "@/lib/prisma";

interface ConfirmPageProps {
  params: {
    id: string;
  };
}

export default async function ConfirmPage({ params }: ConfirmPageProps) {
  try {
    const { id } = params;
    
    // Buscar o convidado pelo link de convite
    const guest = await prisma.guest.findUnique({
      where: {
        inviteLink: id,
      },
      include: {
        confirmation: true,
        group: true,
      },
    });

    if (!guest) {
      notFound();
    }

    // Se for um grupo, incluir informações do grupo
    let groupInfo = null;
    if (guest.group) {
      const groupGuests = await prisma.guest.findMany({
        where: {
          groupId: guest.group.id,
          id: {
            not: guest.id,
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      groupInfo = {
        id: guest.group.id,
        name: guest.group.name,
        members: groupGuests,
      };
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 p-4">
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="py-8 px-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-purple-800 mb-2">
                Olá, {guest.name}!
              </h1>
              <p className="text-gray-600">
                {guest.confirmation?.confirmed 
                  ? "Sua presença está confirmada para o chá de fraldas da Antonella! 🎉"
                  : "Você foi convidado para o chá de fraldas da Antonella"}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-purple-100 rounded-lg p-4 text-center">
                <h2 className="font-semibold text-purple-800 mb-2">Detalhes do Evento</h2>
                <p className="text-gray-700">Data: <span className="font-medium">19 de julho de 2025</span></p>
                <p className="text-gray-700">Horário: <span className="font-medium">15:00</span></p>
                <p className="text-gray-700">Local: <span className="font-medium">Villa di Helena</span></p>
                <p className="text-gray-700">Av. Amaleto Marino, 250 - Res. Santa Izabel</p>
              </div>

              <GuestConfirmationForm 
                guest={guest} 
                groupInfo={groupInfo}
              />

              {guest.giftSize && (
                <div className="mt-8 bg-blue-50 rounded-lg p-4 text-center">
                  <h3 className="font-semibold text-blue-700 mb-2">Seu presente sugerido</h3>
                  <p className="text-gray-700">
                    Fralda tamanho <span className="font-medium">{guest.giftSize}</span>
                    {guest.giftQuantity && guest.giftQuantity > 1 
                      ? ` (${guest.giftQuantity} unidades)`
                      : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erro ao buscar informações do convidado:", error);
    notFound();
  }
}
