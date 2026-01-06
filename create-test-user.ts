import { PrismaClient } from "./app/generated/prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createTestUser() {
  const email = "admin@clearm.ai";
  const password = "Admin123!";
  const name = "Admin User";

  console.log("Creating test user...");
  console.log("Email:", email);
  console.log("Password:", password);

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create or update user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      emailVerified: new Date(),
      name,
    },
    create: {
      email,
      password: hashedPassword,
      emailVerified: new Date(),
      name,
    },
  });

  console.log("\n✅ User created successfully!");
  console.log("\n📋 LOGIN CREDENTIALS:");
  console.log("====================");
  console.log("Email:    ", email);
  console.log("Password: ", password);
  console.log("\nLogin URL: http://localhost:3001/auth/signin");
  console.log("\nAfter login, go to: http://localhost:3001/dashboard");
}

createTestUser()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
