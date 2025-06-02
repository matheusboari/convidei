import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';
import { Providers } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chá de Bebê da Antonella',
  description: 'Aplicação para gerenciar convidados do chá de bebê da Antonella',
};

// Configurações de otimização
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
