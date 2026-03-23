import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password, username, role } = await req.json();

  if (!email || !password || !username) {
    return NextResponse.json({ error: "Missing required fields (email, password, username)" });
  }

  const exists = await prisma.user.findUnique({ where: { email } });

  if (exists) {
    return NextResponse.json({ error: "User already exists" });
  }

  const user = await prisma.user.create({
    data: { 
      email, 
      password, 
      username,
      role 
    },
  });

  const response = NextResponse.json(user);

  // Set userId cookie (same as login)
  response.cookies.set("userId", String(user.id), {
    httpOnly: true,
    path: "/",
  });

  return response;
}