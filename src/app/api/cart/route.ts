import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

// ✅ GET CART
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json([]);

    const cart = await prisma.cart.findFirst({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) return NextResponse.json([]);

    return NextResponse.json(cart.items);
  } catch (error) {
    return NextResponse.json([]);
  }
}

// ✅ ADD TO CART
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const body = await req.json();
    const productId = Number(body.productId);
    const quantity = Number(body.quantity) || 1; // Get quantity from request, default to 1

    if (!productId) {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    // 🔥 GET PRODUCT + STORE
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // ❌ BLOCK seller buying own product
    if (product.store.ownerId === user.id) {
      return NextResponse.json(
        { error: "Cannot buy your own product" },
        { status: 403 }
      );
    }

    // 🛒 GET OR CREATE CART
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    // 🔁 CHECK EXISTING
    const existing = await prisma.cartItem.findFirst({
      where: {
        productId,
        cartId: cart.id,
      },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: existing.quantity + quantity,
        },
      });

      return NextResponse.json(updated);
    }

    const newItem = await prisma.cartItem.create({
      data: {
        productId,
        quantity: quantity,
        cartId: cart.id,
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}