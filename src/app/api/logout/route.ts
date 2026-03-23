import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  // Clear userId cookie
  res.cookies.set("userId", "", {
    expires: new Date(0),
    path: "/",
  });

  return res;
}

export async function GET() {
  const res = NextResponse.json({ success: true });

  // Clear userId cookie
  res.cookies.set("userId", "", {
    expires: new Date(0),
    path: "/",
  });

  return res;
}