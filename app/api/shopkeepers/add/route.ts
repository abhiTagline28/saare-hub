import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/fileHandler";
import type { User } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

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

    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const users = await readJSON<User[]>("users.json");

    // Check for duplicate email
    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const newUser: User = {
      id: `shop_${uuidv4().slice(0, 8)}`,
      role: "shopkeeper",
      name,
      email,
      password,
    };

    users.push(newUser);
    await writeJSON("users.json", users);

    return NextResponse.json({
      success: true,
      shopkeeper: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
