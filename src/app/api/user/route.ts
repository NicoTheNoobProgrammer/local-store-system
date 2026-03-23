import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/**
 * GET /api/user
 * Returns current user info (role, username, email, etc.)
 * Works for both BUYERS and SELLERS
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("User info error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user info" },
      { status: 500 }
    );
  }
}
