/* Media storage: Vercel Blob in production (read-only FS), local /public/uploads in development. */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type Stored = { url: string; bytes: number };

const safeName = (n: string) => n.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/-+/g, "-").slice(0, 80);

export async function storeFile(file: File): Promise<Stored> {
  const stamp = Date.now().toString(36);
  const name = `${stamp}-${safeName(file.name || "upload")}`;
  const d = new Date();
  const folder = `uploads/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`${folder}/${name}`, file, { access: "public", addRandomSuffix: false });
    return { url: blob.url, bytes: file.size };
  }

  const dir = path.join(process.cwd(), "public", folder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/${folder}/${name}`, bytes: file.size };
}

export async function removeFile(url: string) {
  if (url.startsWith("http") && process.env.BLOB_READ_WRITE_TOKEN) {
    const { del } = await import("@vercel/blob");
    await del(url).catch(() => {});
    return;
  }
  if (url.startsWith("/uploads/")) {
    const { unlink } = await import("node:fs/promises");
    await unlink(path.join(process.cwd(), "public", url)).catch(() => {});
  }
}
