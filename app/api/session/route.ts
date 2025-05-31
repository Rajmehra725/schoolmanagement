// app/api/session/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  const cookieStore = await cookies(); // ✅ await is necessary here

  cookieStore.set("__session", token, {
    httpOnly: true,
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return NextResponse.json({ status: "success" });
}
