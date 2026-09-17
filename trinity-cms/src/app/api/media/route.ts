import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeFile } from "@/lib/storage";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];
const MAX = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No file" }, { status: 400 });

  const out = [];
  for (const file of files) {
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 415 });
    if (file.size > MAX) return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 });
    const stored = await storeFile(file);
    const row = await db.media.create({
      data: { url: stored.url, filename: file.name, bytes: stored.bytes, mimeType: file.type, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") },
    });
    out.push(row);
  }
  return NextResponse.json({ ok: true, items: out });
}

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const q = new URL(req.url).searchParams.get("q")?.trim();
  const items = await db.media.findMany({
    where: q ? { OR: [{ filename: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }] } : undefined,
    orderBy: { createdAt: "desc" }, take: 200,
  });
  return NextResponse.json({ items });
}
