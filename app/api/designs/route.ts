import { NextRequest, NextResponse } from "next/server";
import { readJSON } from "@/lib/fileHandler";
import type { Design } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const designs = await readJSON<Design[]>("designs.json");

    if (session.role === "admin") {
      return NextResponse.json({ designs });
    }

    // Shopkeepers only see assigned designs
    const assigned = designs.filter((d) => d.assignedTo.includes(session.id));
    return NextResponse.json({ designs: assigned });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
