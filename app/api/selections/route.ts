import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/fileHandler";
import type { Selection, Design } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    const selections = await readJSON<Selection[]>("selections.json");

    if (session.role === "admin") {
      return NextResponse.json({ selections });
    }

    // Shopkeepers only see their own selections
    const own = selections.filter((s) => s.shopkeeperId === session.id);
    return NextResponse.json({ selections: own });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session");
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = JSON.parse(sessionCookie.value);
    if (session.role !== "shopkeeper") {
      return NextResponse.json({ error: "Only shopkeepers can select designs" }, { status: 403 });
    }

    const { designId } = await req.json();
    if (!designId) {
      return NextResponse.json({ error: "Design ID required" }, { status: 400 });
    }

    const designs = await readJSON<Design[]>("designs.json");
    const design = designs.find((d) => d.id === designId);

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (!design.assignedTo.includes(session.id)) {
      return NextResponse.json({ error: "Design not assigned to you" }, { status: 403 });
    }

    const selections = await readJSON<Selection[]>("selections.json");

    // Check if already selected
    const existing = selections.find(
      (s) => s.designId === designId && s.shopkeeperId === session.id
    );
    if (existing) {
      return NextResponse.json({ error: "Already selected" }, { status: 409 });
    }

    const newSelection: Selection = {
      id: `sel_${uuidv4().slice(0, 8)}`,
      designId,
      shopkeeperId: session.id,
      shopkeeperName: session.name,
      shopkeeperEmail: session.email,
      designTitle: design.title,
      selectedAt: new Date().toISOString(),
    };

    selections.push(newSelection);
    await writeJSON("selections.json", selections);

    return NextResponse.json({ success: true, selection: newSelection });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
