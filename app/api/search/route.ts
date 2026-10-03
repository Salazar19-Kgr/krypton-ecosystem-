import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "La búsqueda todavía no está conectada." },
    { status: 501 }
  );
}
