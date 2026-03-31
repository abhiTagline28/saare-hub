import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/fileHandler";
import type { User } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, name, email, password } = await req.json();

    if (!id || !name || !email) {
      return NextResponse.json({ error: "ID, name, and email are required" }, { status: 400 });
    }

    const users = await readJSON<User[]>("users.json");
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Shopkeeper not found" }, { status: 404 });
    }

    // Check for duplicate email (exclude current user)
    if (users.some((u) => u.email === email && u.id !== id)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    users[index] = {
      ...users[index],
      name,
      email,
      ...(password ? { password } : {}),
    };

    await writeJSON("users.json", users);

    return NextResponse.json({
      success: true,
      shopkeeper: { id: users[index].id, name: users[index].name, email: users[index].email },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
