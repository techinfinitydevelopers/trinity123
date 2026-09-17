"use client";
import { useActionState } from "react";
import { loginAction, type ActionResult } from "@/lib/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(loginAction, null);
  return (
    <form action={action} className="space-y-4">
      <div><label className="lbl" htmlFor="email">Email</label><input className="inp" id="email" name="email" type="email" autoComplete="username" required placeholder="you@trinitystudyabroad.com" /></div>
      <div><label className="lbl" htmlFor="password">Password</label><input className="inp" id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" /></div>
      {state && !state.ok ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">{state.error}</p> : null}
      <button className="btn-primary w-full" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
