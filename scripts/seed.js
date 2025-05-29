const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando seed do banco de dados...');

    // Criar usuário administrador
    const adminPassword = await bcrypt.hash('antonella123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@chadaantonella.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@chadaantonella.com',
        password: adminPassword,
        role: 'admin',
      },
    });
    
    console.log('Usuário administrador criado:', admin.email);
    console.log('Seed concluído com sucesso!');
  } catch (error) {
    console.error('Erro durante o seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
