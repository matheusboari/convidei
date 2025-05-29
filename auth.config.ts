import type { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import prisma from './src/lib/prisma';

// Definir tipagem para usuário personalizado
type UserWithRole = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
};

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Credenciais incompletas');
          return null;
        }
        
        try {
          // Converter explicitamente para string para evitar problemas de tipo
          const email = credentials.email.toString();
          const password = credentials.password.toString();
          
          const user = await prisma.user.findUnique({
            where: { email },
          });
          
          if (!user) {
            console.log('Usuário não encontrado:', email);
            return null;
          }
          
          const passwordMatch = await compare(password, user.password);
          
          if (!passwordMatch) {
            console.log('Senha incorreta para usuário:', email);
            return null;
          }
          
          console.log('Login bem-sucedido para:', email);
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userWithRole = user as UserWithRole;
        return {
          ...token,
          id: userWithRole.id,
          role: userWithRole.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        },
      };
    },
  },
  debug: process.env.NODE_ENV === 'development',
}; 
