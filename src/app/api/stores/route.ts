import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// ✅ GET ALL STORES (SAFE)
export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      include: {
        products: true,
      },
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("STORE GET ERROR:", error);
    return NextResponse.json([]); // ✅ prevent crash
  }
}

// ✅ CREATE STORE (SELLER ONLY)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" });
    }

    const data = await req.json();

    // ✅ VALIDATE required fields
    if (!data.name || !data.category) {
      return NextResponse.json({ error: "Store name and category are required" }, { status: 400 });
    }

    const store = await prisma.store.create({
      data: {
        name: data.name,
        category: data.category,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        ownerId: user.id,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("STORE POST ERROR:", error);
    return NextResponse.json({ error: "Failed to create store" });
  }
}