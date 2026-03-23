import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" });
  }

  const email = body.email?.trim();
  const password = body.password?.trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" });
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" });
  }

  if (user.password !== password) {
    return NextResponse.json({ error: "Wrong password" });
  }

  const response = NextResponse.json({
    success: true,
    user, // ✅ IMPORTANT
  });

  // ✅ Set cookie
  response.cookies.set("userId", String(user.id), {
    httpOnly: true,
    path: "/",
  });

  return response;
}