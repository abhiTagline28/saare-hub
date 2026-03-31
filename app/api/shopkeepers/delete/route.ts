import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/fileHandler";
import type { User, Design } from "@/lib/types";

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

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Shopkeeper ID required" }, { status: 400 });
    }

    const users = await readJSON<User[]>("users.json");
    const user = users.find((u) => u.id === id);

    if (!user || user.role !== "shopkeeper") {
      return NextResponse.json({ error: "Shopkeeper not found" }, { status: 404 });
    }

    // Remove shopkeeper from users
    const updatedUsers = users.filter((u) => u.id !== id);
    await writeJSON("users.json", updatedUsers);

    // Remove shopkeeper from all design assignments
    const designs = await readJSON<Design[]>("designs.json");
    const updatedDesigns = designs.map((d) => ({
      ...d,
      assignedTo: d.assignedTo.filter((shopId) => shopId !== id),
    }));
    await writeJSON("designs.json", updatedDesigns);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
