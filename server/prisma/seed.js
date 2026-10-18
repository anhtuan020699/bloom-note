const { PrismaClient } = require('@prisma/client');
const { randomBytes, randomUUID, scrypt: scryptCb } = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(scryptCb);
const prisma = new PrismaClient();

const username = 'admin';
const password = 'admin';

async function hashPassword(pass) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scrypt(pass, salt, 64);
  return `${salt}:${buf.toString('hex')}`;
}

async function main() {
  const passwordHash = await hashPassword(password);
  const existing = await prisma.adminUser.findUnique({ where: { username } });
  if (existing) {
    await prisma.adminUser.update({ where: { id: existing.id }, data: { passwordHash } });
    await prisma.adminSession.deleteMany({ where: { userId: existing.id } });
    console.log('[seed] Cập nhật admin');
  } else {
    await prisma.adminUser.create({
      data: { id: randomUUID(), username, passwordHash },
    });
    console.log('[seed] Tạo mới admin');
  }
  console.log(`[seed] username: ${username}`);
  console.log(`[seed] password: ${password}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
