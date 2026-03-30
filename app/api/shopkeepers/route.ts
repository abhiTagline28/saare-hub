import { NextRequest, NextResponse } from "next/server";
import { readJSON } from "@/lib/fileHandler";
import type { User } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await readJSON<User[]>("users.json");
    const shopkeepers = users
      .filter((u) => u.role === "shopkeeper")
      .map(({ id, name, email }) => ({ id, name, email }));

    return NextResponse.json({ shopkeepers });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
