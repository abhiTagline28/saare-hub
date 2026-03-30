import { NextRequest, NextResponse } from "next/server";
import { readJSON } from "@/lib/fileHandler";
import type { User } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const users = await readJSON<User[]>("users.json");
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = { id: user.id, role: user.role, name: user.name, email: user.email };
    const response = NextResponse.json({ success: true, user: session });

    response.cookies.set("session", JSON.stringify(session), {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
