import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const msgSelect = {
  id: true, subject: true, body: true, read: true, taskId: true, createdAt: true,
  from: { select: { id: true, name: true } },
  to: { select: { id: true, name: true } },
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const messages = await prisma.message.findMany({
      where: userId ? { OR: [{ fromId: userId }, { toId: userId }] } : undefined,
      select: msgSelect,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(messages);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { subject, body, fromId, toId, taskId } = await req.json();

    if (!subject || !body || !fromId || !toId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: { subject, body, fromId, toId, taskId: taskId || null },
      select: msgSelect,
    });
    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
