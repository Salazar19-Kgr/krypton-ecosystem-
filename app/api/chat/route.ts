import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          ok: false,
          error: "El mensaje está vacío.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: "Krypton Core preparado.",
      received: message,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Solicitud inválida.",
      },
      { status: 400 }
    );
  }
}
