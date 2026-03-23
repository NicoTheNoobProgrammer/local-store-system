import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { name, price, image, storeId } = body;

    // ✅ VALIDATE all required fields
    if (!name || !price || !storeId) {
      return NextResponse.json({ error: "Missing required fields (name, price, storeId)" }, { status: 400 });
    }

    // ✅ Verify the store belongs to this seller
    const store = await prisma.store.findUnique({
      where: { id: Number(storeId) },
    });

    if (!store || store.ownerId !== user.id) {
      return NextResponse.json({ error: "Store not found or access denied" }, { status: 403 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        image: image || "",
        storeId: Number(storeId),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}