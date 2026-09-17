import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/chat";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(6).max(30),
  subject: z.string().trim().max(200).optional().default(""),
  message: z.string().trim().max(4000).optional().default(""),
  website: z.string().max(0).optional(), // honeypot — must stay empty
  source: z.string().max(40).optional().default("contact-form"),
});

export async function POST(req: Request) {
  // The honeypot stops naive bots; this stops a targeted script filling the leads table.
  if (!rateLimit(`lead:${clientIp(req.headers)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many submissions. Please call or WhatsApp us instead." }, { status: 429 });
  }
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  const { website: _hp, ...data } = parsed.data;
  void _hp;
  await db.lead.create({ data });
  return NextResponse.json({ ok: true });
}
