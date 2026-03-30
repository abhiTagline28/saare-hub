import { NextRequest, NextResponse } from "next/server";
import { readJSON } from "@/lib/fileHandler";
import type { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const users = await readJSON<User[]>("users.json");
    const user = users.find((u) => u.id === session.id);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: { id: user.id, role: user.role, name: user.name, email: user.email },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
