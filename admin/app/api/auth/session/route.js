import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("vercel_admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", 
    maxAge: 24 * 60 * 60, 
    path: "/",
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("vercel_admin_token");
  return NextResponse.json({ success: true });
}
