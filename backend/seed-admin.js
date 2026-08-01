const bcrypt = require('bcrypt');
const prisma = require('./src/prisma');

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@test.com', password: hashedPassword, role: 'ADMIN' },
  });
  console.log('Created:', admin);
}

main().finally(() => process.exit());