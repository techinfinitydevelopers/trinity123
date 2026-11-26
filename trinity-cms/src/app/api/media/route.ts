import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { storeFile } from "@/lib/storage";

// SVG is deliberately excluded: it is scriptable, and on a self-hosted deploy uploads are served
// from the site origin, which would turn an uploaded SVG into stored XSS on /admin.
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX = 8 * 1024 * 1024;

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No file" }, { status: 400 });

  const folder = String(form.get("folder") ?? "").trim().slice(0, 60) || "uploads";
  const out = [];
  for (const file of files) {
    if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 415 });
    if (file.size > MAX) return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 });
    const stored = await storeFile(file);
    const row = await db.media.create({
      data: { url: stored.url, filename: file.name, bytes: stored.bytes, mimeType: file.type, folder, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") },
    });
    out.push(row);
  }
  return NextResponse.json({ ok: true, items: out });
}

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim();
  const folder = sp.get("folder")?.trim();
  const items = await db.media.findMany({
    where: {
      ...(q ? { OR: [{ filename: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }] } : {}),
      ...(folder ? { folder } : {}),
    },
    orderBy: { createdAt: "desc" }, take: 500,
  });
  /* Category list with counts (all files, ignoring the search), plus every country name so each is offered even while empty. */
  const groups = await db.media.groupBy({ by: ["folder"], _count: { _all: true } });
  const countries = await db.country.findMany({ select: { name: true }, orderBy: { name: "asc" } });
  return NextResponse.json({ items, folders: groups.map((g) => ({ name: g.folder, count: g._count._all })), countries: countries.map((c) => c.name) });
}
