import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  dueDate: true,
  userNote: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  assignedTo: { select: { id: true, name: true, email: true } },
  assignedBy: { select: { id: true, name: true } },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const tasks = await prisma.task.findMany({
      where: userId ? { assignedToId: userId } : undefined,
      select: taskSelect,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tasks);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, assignedToId, assignedById, priority, dueDate } = await req.json();

    if (!title || !assignedToId || !assignedById || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: { title, description: description || "", assignedToId, assignedById, priority: priority || "medium", dueDate, status: "pending" },
      select: taskSelect,
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
