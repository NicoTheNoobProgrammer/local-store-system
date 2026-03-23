import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // get items in cart
  const cartItems = await prisma.cartItem.findMany({
    include: {
      product: true,
    },
  });

  if (!cartItems.length) return NextResponse.json([]);

  // get prices of items in cart
  const prices = cartItems.map(item => item.product.price);

  const avgPrice =
    prices.reduce((a, b) => a + b, 0) / prices.length;

  // recommend products near average price
  const recommendations = await prisma.product.findMany({
    where: {
      price: {
        gte: avgPrice - 100,
        lte: avgPrice + 100,
      },
    },
    take: 5,
  });

  return NextResponse.json(recommendations);
}