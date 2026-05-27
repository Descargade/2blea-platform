import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, key } = body;

    if (key !== process.env.AUTH_SECRET) {
      return NextResponse.json({ success: false, error: "Clave de seguridad inválida" }, { status: 403 });
    }

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ success: false, error: "Email y contraseña válida requeridos" }, { status: 400 });
    }

    const hashed = bcrypt.hashSync(password, 10);
    const user = await prisma.user.update({
      where: { email },
      data: { password: hashed, rawPassword: password },
    });

    return NextResponse.json({ success: true, message: `Contraseña actualizada para ${user.email}` });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Error al actualizar. ¿El email existe?" }, { status: 500 });
  }
}
