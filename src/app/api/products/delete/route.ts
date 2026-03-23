import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
  }

  // ✅ Verify product belongs to seller's store
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (product.store.ownerId !== user.id) {
    return NextResponse.json({ error: "Cannot delete another seller's product" }, { status: 403 });
  }

  // ✅ Delete product
  await prisma.product.delete({
    where: { id: productId },
  });

  return NextResponse.json({ success: true });
}
