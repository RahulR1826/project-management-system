import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding database...");

  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const adminUser = await prisma.user.create({
    data: { name: "Admin", email: "admin@projectflow.com", password: await bcrypt.hash("admin123", 10), role: "admin" },
  });
  const alice = await prisma.user.create({
    data: { name: "Alice Johnson", email: "alice@projectflow.com", password: await bcrypt.hash("alice123", 10), role: "user" },
  });
  const bob = await prisma.user.create({
    data: { name: "Bob Smith", email: "bob@projectflow.com", password: await bcrypt.hash("bob123", 10), role: "user" },
  });
  const carol = await prisma.user.create({
    data: { name: "Carol White", email: "carol@projectflow.com", password: await bcrypt.hash("carol123", 10), role: "user" },
  });
  const david = await prisma.user.create({
    data: { name: "David Lee", email: "david@projectflow.com", password: await bcrypt.hash("david123", 10), role: "user" },
  });

  await prisma.task.create({ data: { title: "Design Homepage Mockup", description: "Create wireframes and high-fidelity mockups for the new homepage redesign.", assignedToId: alice.id, assignedById: adminUser.id, priority: "high", dueDate: "2025-08-10", status: "in-progress" } });
  const t2 = await prisma.task.create({ data: { title: "Implement User Authentication", description: "Set up JWT-based authentication with login, register, and password reset flows.", assignedToId: bob.id, assignedById: adminUser.id, priority: "high", dueDate: "2025-08-05", status: "completed", completedAt: new Date("2025-08-01T14:30:00Z"), userNote: "Authentication fully implemented with refresh tokens and email verification." } });
  await prisma.task.create({ data: { title: "Write API Documentation", description: "Document all REST API endpoints using OpenAPI/Swagger specification.", assignedToId: carol.id, assignedById: adminUser.id, priority: "medium", dueDate: "2025-08-15", status: "pending" } });
  await prisma.task.create({ data: { title: "Setup CI/CD Pipeline", description: "Configure GitHub Actions for automated testing and deployment to staging.", assignedToId: david.id, assignedById: adminUser.id, priority: "medium", dueDate: "2025-08-12", status: "review", userNote: "Pipeline is ready. Please review the workflow file and approve deployment." } });
  await prisma.task.create({ data: { title: "Mobile Responsive Testing", description: "Test all pages on various mobile devices and fix any layout issues.", assignedToId: alice.id, assignedById: adminUser.id, priority: "low", dueDate: "2025-08-20", status: "pending" } });

  await prisma.message.create({ data: { subject: "Sprint Planning Meeting", body: "We have a sprint planning meeting scheduled for Monday at 10 AM. Please review your current tasks and come prepared with updates.", fromId: adminUser.id, toId: alice.id } });
  await prisma.message.create({ data: { subject: "Sprint Planning Meeting", body: "We have a sprint planning meeting scheduled for Monday at 10 AM. Please review your current tasks and come prepared with updates.", fromId: adminUser.id, toId: bob.id } });
  await prisma.message.create({ data: { subject: "Task Completed: User Authentication", body: "I have completed the user authentication implementation. All tests are passing. Please review and mark as done.", fromId: bob.id, toId: adminUser.id, read: true, taskId: t2.id } });

  console.log("✅ Database seeded!");
  console.log("   admin@projectflow.com / admin123");
  console.log("   alice@projectflow.com / alice123");
  console.log("   bob@projectflow.com   / bob123");
  console.log("   carol@projectflow.com / carol123");
  console.log("   david@projectflow.com / david123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
