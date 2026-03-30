import { NextRequest, NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/fileHandler";
import type { Design } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
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

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const assignedTo = JSON.parse(formData.get("assignedTo") as string) as string[];
    const image = formData.get("image") as File;

    if (!title || !image || !assignedTo?.length) {
      return NextResponse.json({ error: "Title, image, and assigned shopkeepers are required" }, { status: 400 });
    }

    // Save image
    const ext = image.name.split(".").pop() || "jpg";
    const filename = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    // Save design
    const designs = await readJSON<Design[]>("designs.json");
    const newDesign: Design = {
      id: `design_${uuidv4().slice(0, 8)}`,
      title,
      image: `/uploads/${filename}`,
      createdAt: new Date().toISOString(),
      assignedTo,
    };

    designs.push(newDesign);
    await writeJSON("designs.json", designs);

    return NextResponse.json({ success: true, design: newDesign });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
