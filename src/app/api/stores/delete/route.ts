import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "SELLER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { storeId } = await req.json();

  if (!storeId) {
    return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
  }

  // ✅ Verify store belongs to seller
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  });

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  if (store.ownerId !== user.id) {
    return NextResponse.json({ error: "Cannot delete another seller's store" }, { status: 403 });
  }

  // ✅ Delete all products in store first
  await prisma.product.deleteMany({
    where: { storeId },
  });

  // ✅ Delete store
  await prisma.store.delete({
    where: { id: storeId },
  });

  return NextResponse.json({ success: true });
}
