import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set("x-krypton-mw", "1");
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) return response;
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) => {
            list.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            response.headers.set("x-krypton-mw", "1");
            list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      }
    );
    await supabase.auth.getUser();
  } catch {}
  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/|favicon.ico|sw.js|manifest.webmanifest|icons/|krypton-chat-bg.webp).*)"],
};
