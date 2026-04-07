import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: "admin-id",
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ Admin created:", admin.email);

  const task = await prisma.task.create({
    data: {
      title: "Initial Setup",
      description: "Setup project",
      status: "pending",
      priority: "medium",
      dueDate: "2025-12-31",
      assignedToId: admin.id,
      assignedById: admin.id,
    },
  });

  console.log("📝 Task created:", task.title);
  console.log("🌱 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });