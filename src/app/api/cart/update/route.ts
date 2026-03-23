import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" });

  const { itemId, type } = await req.json();

  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
  });

  if (!item) return NextResponse.json({ error: "Not found" });

  if (type === "increase") {
    return NextResponse.json(
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: item.quantity + 1 },
      })
    );
  }

  if (type === "decrease") {
    if (item.quantity <= 1) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
      return NextResponse.json({ deleted: true });
    }

    return NextResponse.json(
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity: item.quantity - 1 },
      })
    );
  }
}