import { slugify } from "./blocks";

/* A webinar on the home slider has no id of its own; its page address is the slug of its title (an explicit `slug` is not needed). */
export const webinarSlug = (w: { title: string }) => slugify(w.title) || "webinar";

/* "04:30 PM" / "16:30" → [h, m]; null when the text is not a clock time. */
export function parseTime(t?: string): [number, number] | null {
  const m = /(\d{1,2})[:.](\d{2})\s*(am|pm)?/i.exec(t ?? "");
  if (!m) return null;
  let h = +m[1];
  const ap = m[3]?.toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  return h < 24 && +m[2] < 60 ? [h, +m[2]] : null;
}

/* Today as YYYY-MM-DD in India (the client's day), whatever timezone the server runs in. */
export const todayIST = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

/* A webinar whose day has passed. No date = not past (its page can still announce it). Only upcoming webinars get a More Info page. */
export const isPastWebinar = (w: { date?: string }) => !!w.date && w.date < todayIST();
