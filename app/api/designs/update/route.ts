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
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const assignedTo = JSON.parse(formData.get("assignedTo") as string) as string[];
    const image = formData.get("image") as File | null;

    if (!id || !title || !assignedTo?.length) {
      return NextResponse.json({ error: "ID, title, and assigned shopkeepers are required" }, { status: 400 });
    }

    const designs = await readJSON<Design[]>("designs.json");
    const index = designs.findIndex((d) => d.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    let imagePath = designs[index].image;

    // If new image uploaded, replace old one
    if (image && image.size > 0) {
      // Delete old image
      try {
        await fs.unlink(path.join(process.cwd(), "public", designs[index].image));
      } catch {
        // Old image might not exist
      }

      const ext = image.name.split(".").pop() || "jpg";
      const filename = `${uuidv4()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await image.arrayBuffer());
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      imagePath = `/uploads/${filename}`;
    }

    designs[index] = {
      ...designs[index],
      title,
      image: imagePath,
      assignedTo,
    };

    await writeJSON("designs.json", designs);

    return NextResponse.json({ success: true, design: designs[index] });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
