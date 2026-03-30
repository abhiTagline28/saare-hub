import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/fileHandler";
import type { Design } from "@/lib/types";
import fs from "fs/promises";
import path from "path";

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
      return NextResponse.json({ error: "Design ID required" }, { status: 400 });
    }

    const designs = await readJSON<Design[]>("designs.json");
    const design = designs.find((d) => d.id === id);

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    // Delete image file
    try {
      const imagePath = path.join(process.cwd(), "public", design.image);
      await fs.unlink(imagePath);
    } catch {
      // Image might not exist, continue
    }

    const updated = designs.filter((d) => d.id !== id);
    await writeJSON("designs.json", updated);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
