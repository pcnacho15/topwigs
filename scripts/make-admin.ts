import { PrismaClient } from "@prisma/client";

/** Promueve un usuario a admin: `pnpm make-admin correo@ejemplo.com` */
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: pnpm make-admin <email>");
    process.exit(1);
  }
  const user = await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });
  console.log(`✔ ${user.email} ahora es admin.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
