import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/plans";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false }, { status: 401 });
    const sub = await supabase.rpc("my_subscription");
    const row = Array.isArray(sub.data) ? sub.data[0] : sub.data;
    const plan: string = typeof row?.plan === "string" ? row.plan : "free";
    const [perMin, perDay] = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
    const since = new Date(Date.now() - 86400000).toISOString();
    const day = await supabase
      .from("messages")
      .select("role", { count: "exact", head: true })
      .eq("user_id", u.user.id)
      .eq("role", "user")
      .gte("created_at", since);
    return NextResponse.json({ ok: true, plan, expires_at: row?.expires_at ?? null, used: day.count ?? 0, perDay, perMin });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
