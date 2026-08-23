import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  // Set the cookie for the Vercel domain
  // We use the same secure settings as the backend
  cookies().set("vercel_admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", // Lax is fine here because the Vercel middleware is reading it from its own domain
    maxAge: 24 * 60 * 60, // 1 day in seconds
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  cookies().delete("vercel_admin_token");
  return NextResponse.json({ success: true });
}
