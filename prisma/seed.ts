import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertService(name: string, description: string, basePrice: number, order: number) {
  const existing = await prisma.service.findFirst({ where: { name, deletedAt: null } });
  if (existing) {
    return prisma.service.update({ where: { id: existing.id }, data: { basePrice, active: true, order } });
  }
  return prisma.service.create({ data: { name, description, basePrice, order } });
}

async function upsertExtra(serviceId: string, name: string, price: number) {
  const existing = await prisma.extra.findFirst({ where: { name, serviceId, deletedAt: null } });
  if (existing) {
    return prisma.extra.update({ where: { id: existing.id }, data: { price } });
  }
  return prisma.extra.create({ data: { name, price, serviceId } });
}

async function main() {
  console.log("🌱 Iniciando seed...");

  const password = bcrypt.hashSync("password123", 10);
  const clientPassword = bcrypt.hashSync("cliente123", 10);

  // ── Admin ──
  const admin = await prisma.user.upsert({
    where: { email: "admin@2blea.com" },
    update: {},
    create: {
      email: "admin@2blea.com",
      password,
      name: "Admin 2bleA",
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin: ${admin.email}`);

  // ── Cliente ──
  const clienteUser = await prisma.user.upsert({
    where: { email: "cliente@2blea.com" },
    update: {},
    create: {
      email: "cliente@2blea.com",
      password: clientPassword,
      name: "Carlos Mendoza",
      role: "CLIENTE",
      phone: "+54 11 5555-0101",
    },
  });

  await prisma.client.upsert({
    where: { userId: clienteUser.id },
    update: {},
    create: {
      userId: clienteUser.id,
      company: "Mendoza Tech SRL",
      phone: "+54 11 5555-0101",
      address: "Av. Corrientes 1234, CABA",
      notes: "Cliente premium - proyectos recurrentes",
    },
  });
  console.log(`  ✓ Cliente: ${clienteUser.email}`);

  // ── Servicios ──
  const commonExtras = [
    { name: "Sistema de turnos", price: 10000 },
    { name: "Confirmación automática", price: 10000 },
    { name: "Login de usuarios", price: 10000 },
    { name: "Panel administrador", price: 30000 },
    { name: "Base de datos", price: 60000 },
    { name: "Hosting / configuración", price: 15000 },
  ];

  const landingSimple = await upsertService("Landing Page Simple", "Landing page profesional y optimizada para conversión.", 70000, 1);
  for (const e of commonExtras) await upsertExtra(landingSimple.id, e.name, e.price);

  const landingTurnos = await upsertService("Landing + Turnos + Confirmación", "Landing con sistema de turnos y confirmación automática.", 85000, 2);
  for (const e of commonExtras) await upsertExtra(landingTurnos.id, e.name, e.price);

  const pagVentas = await upsertService("Página de Ventas", "Página de ventas profesional con embudos de conversión.", 150000, 3);
  for (const e of commonExtras) await upsertExtra(pagVentas.id, e.name, e.price);

  const webNegocios = await upsertService("Web para Negocios", "Sitio web completo para negocios con panel administrador.", 220000, 4);
  for (const e of commonExtras) await upsertExtra(webNegocios.id, e.name, e.price);

  const catalogo = await upsertService("Catálogo Online", "Catálogo digital interactivo con gestión de productos.", 180000, 5);
  for (const e of commonExtras) await upsertExtra(catalogo.id, e.name, e.price);

  const sitioPro = await upsertService("Sitio Web Profesional", "Sitio web profesional completo con todas las funcionalidades.", 300000, 6);
  for (const e of commonExtras) await upsertExtra(sitioPro.id, e.name, e.price);

  console.log(`  ✓ 6 servicios con extras`);

  // ── Ofertas ──

  // ── Ofertas ──
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 15);

  const of1 = await prisma.offer.findFirst({ where: { title: "Combo Landing + Turnos" } });
  if (!of1) {
    await prisma.offer.create({
      data: {
        title: "Combo Landing + Turnos",
        description: "Contratá Landing + Turnos y obtené hosting gratis por 6 meses.",
        discount: 15,
        featured: true,
        endDate: futureDate,
        serviceId: landingSimple.id,
      },
    });
  }

  const of2 = await prisma.offer.findFirst({ where: { title: "Lanzamiento Web" } });
  if (!of2) {
    await prisma.offer.create({
      data: {
        title: "Lanzamiento Web",
        description: "20% off en cualquier sitio web profesional durante este mes.",
        discount: 20,
        featured: true,
        endDate: futureDate,
        serviceId: sitioPro.id,
      },
    });
  }

  const of3 = await prisma.offer.findFirst({ where: { title: "Catálogo + Hosting" } });
  if (!of3) {
    await prisma.offer.create({
      data: {
        title: "Catálogo + Hosting",
        description: "Catálogo online con hosting gratis por 1 año.",
        discount: 10,
        featured: false,
        endDate: futureDate,
        serviceId: catalogo.id,
      },
    });
  }
  console.log(`  ✓ 3 ofertas`);

  // ── Proyecto demo ──
  const client = await prisma.client.findFirst({ where: { userId: clienteUser.id } });
  if (client) {
    const existingProject = await prisma.project.findFirst({
      where: { clientId: client.id, name: "Landing Premium - Mendoza Tech" },
    });

    if (!existingProject) {
      const project = await prisma.project.create({
        data: {
          name: "Landing Premium - Mendoza Tech",
          description: "Landing page con sistema de turnos y chat en vivo para Mendoza Tech SRL.",
          status: "EN_PROGRESO",
          progress: 65,
          clientId: client.id,
          startDate: new Date("2026-05-01"),
        },
      });

      await prisma.activityLog.createMany({
        data: [
          { action: "PROJECT_CREATED", details: "Proyecto creado", projectId: project.id, userId: admin.id },
          { action: "STATUS_CHANGED", details: "Estado: PENDIENTE → EN_PROGRESO", projectId: project.id, userId: admin.id },
          { action: "FILE_UPLOADED", details: "Se adjuntó: brief.pdf", projectId: project.id },
          { action: "COMMENT_ADDED", details: "Requerimientos actualizados", projectId: project.id, userId: clienteUser.id },
        ],
      });

      const conversation = await prisma.conversation.create({
        data: {
          clientId: client.id,
          adminId: admin.id,
          projectId: project.id,
        },
      });

      await prisma.message.createMany({
        data: [
          {
            conversationId: conversation.id,
            senderId: clienteUser.id,
            content: "Hola, quería consultar sobre el progreso de la landing. ¿Cómo vamos con los diseños?",
            createdAt: new Date("2026-05-15T10:00:00Z"),
          },
          {
            conversationId: conversation.id,
            senderId: admin.id,
            content: "¡Hola Carlos! Vamos muy bien. Ya tenemos la primera versión del diseño lista. Te la comparto en estos días para que la revises.",
            createdAt: new Date("2026-05-15T10:30:00Z"),
            read: true,
          },
          {
            conversationId: conversation.id,
            senderId: clienteUser.id,
            content: "Perfecto, gracias. ¿Me pueden agregar el sistema de turnos que hablamos?",
            createdAt: new Date("2026-05-16T14:00:00Z"),
            read: true,
          },
          {
            conversationId: conversation.id,
            senderId: admin.id,
            content: "Sí, ya lo agregamos al alcance. Queda en $10.000 adicionales. Te enviamos el presupuesto actualizado.",
            createdAt: new Date("2026-05-16T15:00:00Z"),
          },
        ],
      });

      await prisma.notification.createMany({
        data: [
          { userId: admin.id, type: "project_update", title: "Nuevo proyecto creado", message: "Landing Premium - Mendoza Tech creado", link: "/admin/proyectos/" + project.id },
          { userId: admin.id, type: "message", title: "Nuevo mensaje de cliente", message: "Carlos Mendoza preguntó sobre el progreso", link: "/admin/mensajes" },
          { userId: clienteUser.id, type: "message", title: "Respuesta de administrador", message: "Admin respondió tu consulta", link: "/cliente/mensajes" },
        ],
      });

      console.log(`  ✓ Proyecto demo con conversación y notificaciones`);
    } else {
      console.log(`  - Proyecto demo ya existe (skip)`);
    }
  }

  console.log("\n✅ Seed completado exitosamente");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
