import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();

  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" });
  }

  // ✅ Seller's stores
  const stores = await prisma.store.findMany({
    where: { ownerId: user.id },
    include: {
      products: true,
    },
  });

  // ✅ Get all product IDs of this seller
  const productIds = stores.flatMap((store) =>
    store.products.map((p) => p.id)
  );

  // ✅ Get orders containing seller's products
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // ✅ Filter only relevant orders
  const sellerOrders = orders
    .map((order) => ({
      ...order,
      items: order.items.filter((item) =>
        productIds.includes(item.productId)
      ),
    }))
    .filter((order) => order.items.length > 0)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Sort by newest first
    .map((order, index) => ({
      ...order,
      orderNumber: index + 1, // ✅ Add seller-specific order number (1, 2, 3...)
    }));

  return NextResponse.json({
    stores,
    orders: sellerOrders,
  });
}