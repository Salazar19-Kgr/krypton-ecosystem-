import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ ok: false }, { status: 401 });
    const { data } = await supabase.rpc("my_plan");
    const adm = await supabase.rpc("is_admin");
    return NextResponse.json({ ok: true, plan: typeof data === "string" ? data : "free", admin: adm.data === true });
  } catch {
    return NextResponse.json({ ok: true, plan: "free", admin: false });
  }
}
