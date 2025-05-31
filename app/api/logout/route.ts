// app/api/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies(); // ✅ await is necessary here

  cookieStore.delete("__session");

  return NextResponse.json({ status: "logged out" });
}
