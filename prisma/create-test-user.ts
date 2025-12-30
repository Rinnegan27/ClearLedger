import { PrismaClient } from "../app/generated/prisma/client";
import bcrypt from "bcrypt";
import { config } from "dotenv";

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  console.log("🔐 Creating test user account...\n");

  // Hash password
  const password = "Test1234!"; // Meets all password requirements
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create or update test user
  const user = await prisma.user.upsert({
    where: { email: "test@clearm.ai" },
    update: {
      password: hashedPassword,
      emailVerified: new Date(), // Mark as verified so user can login immediately
    },
    create: {
      email: "test@clearm.ai",
      name: "Test User",
      password: hashedPassword,
      emailVerified: new Date(), // Mark as verified
    },
  });

  console.log("✅ Test user created successfully!\n");
  console.log("📧 Email:", user.email);
  console.log("🔑 Password:", password);
  console.log("\n🎯 You can now sign in at: http://localhost:3000/auth/signin");
  console.log("\nCredentials:");
  console.log("  Email: test@clearm.ai");
  console.log("  Password: Test1234!");
}

main()
  .catch((e) => {
    console.error("❌ Error creating test user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
