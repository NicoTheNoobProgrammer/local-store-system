import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not logged in" });

  const body = await req.json();
  const { email, phone } = body;

  if (!email || !phone) {
    return NextResponse.json({ error: "Email and phone are required" }, { status: 400 });
  }

  const cart = await prisma.cart.findFirst({
    where: { userId: user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" });
  }

  // ✅ FIX TYPE
  const total: number = cart.items.reduce(
    (sum: number, item) =>
      sum + item.quantity * item.product.price,
    0
  );

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      total,
      status: "PENDING",
      email,
      phone,
      items: {
        create: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: true,
    },
  });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return NextResponse.json(order);
}