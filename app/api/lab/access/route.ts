import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return NextResponse.json({ admin: false });
    const { data } = await supabase.rpc("is_admin");
    return NextResponse.json({ admin: data === true });
  } catch {
    return NextResponse.json({ admin: false });
  }
}
