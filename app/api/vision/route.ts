import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const imageUrl =
      typeof body?.imageUrl === "string"
        ? body.imageUrl.trim()
        : "";

    if (!imageUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "No se recibió una imagen.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: "Krypton Vision preparado.",
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
