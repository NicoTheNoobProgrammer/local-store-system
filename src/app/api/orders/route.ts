import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { OrderStatus } from "@prisma/client";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { orderId, action } = await req.json();

  if (!orderId || !action) {
    return NextResponse.json({ error: "Order ID and action are required" }, { status: 400 });
  }

  // ✅ Verify order belongs to seller's products
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            include: { store: true },
          },
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // ✅ Check if any item in order belongs to this seller
  const sellerHasItems = order.items.some(item => item.product.store.ownerId === user.id);
  if (!sellerHasItems) {
    return NextResponse.json({ error: "Cannot modify this order" }, { status: 403 });
  }

  // ✅ Handle status transitions
  const statusMap: { [key: string]: string } = {
    "confirm": "CONFIRMED",
    "processing": "PROCESSING",
    "shipped": "SHIPPED",
    "delivered": "DELIVERED",
    "completed": "COMPLETED",
  };

  const newStatus = statusMap[action];
  if (!newStatus) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as OrderStatus },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Order status updated to ${newStatus}`,
      order: updatedOrder 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
