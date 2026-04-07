import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const taskSelect = {
  id: true, title: true, description: true, status: true, priority: true,
  dueDate: true, userNote: true, completedAt: true, createdAt: true, updatedAt: true,
  assignedTo: { select: { id: true, name: true, email: true } },
  assignedBy: { select: { id: true, name: true } },
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { status, userNote, completedAt } = body;
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(userNote !== undefined && { userNote }),
        ...(completedAt !== undefined && { completedAt: completedAt ? new Date(completedAt) : null }),
      },
      select: taskSelect,
    });
    return NextResponse.json(task);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
