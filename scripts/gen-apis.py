import os
r = r'C:\Users\aaron\2blea-platform'

def w(relpath, content):
    fp = os.path.join(r, relpath)
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content.lstrip('\n'))
    print('OK:', relpath)

# Clients API
w('src/app/api/clients/route.ts', '''import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const hashedPassword = bcrypt.hashSync("password123", 10);
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email, password: hashedPassword, name: body.name, role: "CLIENTE", phone: body.phone,
        client: { create: { company: body.company, phone: body.phone, address: body.address, notes: body.notes } },
      },
      include: { client: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 400 });
  }
}
''')

# Projects API
w('src/app/api/projects/route.ts', '''import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const user = session.user as any;
  let projects;
  if (user.role === "ADMIN") {
    projects = await prisma.project.findMany({
      where: { deletedAt: null },
      include: { client: { include: { user: { select: { id: true, name: true, email: true } } } }, files: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    const client = await prisma.client.findUnique({ where: { userId: user.id } });
    if (!client) return NextResponse.json([]);
    projects = await prisma.project.findMany({
      where: { clientId: client.id, deletedAt: null },
      include: { files: true },
      orderBy: { createdAt: "desc" },
    });
  }
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: body.name, description: body.description, clientId: body.clientId,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  });
  await prisma.activityLog.create({
    data: { userId: (session.user as any).id, projectId: project.id, action: "PROJECT_CREATED", details: "Proyecto creado" },
  });
  return NextResponse.json(project, { status: 201 });
}
''')

# Messages API
w('src/app/api/messages/route.ts', '''import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const user = session.user as any;
  let conversations;
  if (user.role === "ADMIN") {
    conversations = await prisma.conversation.findMany({
      where: { deletedAt: null },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        client: { include: { user: { select: { id: true, name: true, email: true } } } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  } else {
    const client = await prisma.client.findUnique({ where: { userId: user.id } });
    if (!client) return NextResponse.json([]);
    conversations = await prisma.conversation.findMany({
      where: { clientId: client.id, deletedAt: null },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }
  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const user = session.user as any;
  const message = await prisma.message.create({
    data: { conversationId: body.conversationId, senderId: user.id, content: body.content },
  });
  await prisma.conversation.update({ where: { id: body.conversationId }, data: { updatedAt: new Date() } });
  return NextResponse.json(message, { status: 201 });
}
''')

# Services API
w('src/app/api/services/route.ts', '''import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const services = await prisma.service.findMany({
    where: { deletedAt: null },
    include: { extras: { where: { deletedAt: null } } },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(services);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const service = await prisma.service.update({
    where: { id: body.id },
    data: { basePrice: body.basePrice, active: body.active },
  });
  return NextResponse.json(service);
}
''')

# Offers API
w('src/app/api/offers/route.ts', '''import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const offers = await prisma.offer.findMany({
    where: { deletedAt: null },
    include: { service: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(offers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const body = await req.json();
  const offer = await prisma.offer.create({
    data: {
      title: body.title, description: body.description, discount: body.discount,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      active: body.active ?? true, featured: body.featured ?? false,
      serviceId: body.serviceId || null,
    },
  });
  return NextResponse.json(offer, { status: 201 });
}
''')

# Offers [id] API
w('src/app/api/offers/[id]/route.ts', '''import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  await prisma.offer.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
''')

# Budget API
w('src/app/api/budget/route.ts', '''import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await prisma.budgetRequest.create({
      data: {
        name: 
