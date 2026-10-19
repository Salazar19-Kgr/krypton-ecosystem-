import { ANDROID_PACKAGE, ANDROID_SHA256 } from "@/lib/app/android";

// Enlace oficial entre la web y la app de Android (quita la barra de direcciones en la app)
export function GET() {
  const body =
    ANDROID_PACKAGE && ANDROID_SHA256
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: ANDROID_PACKAGE,
              sha256_cert_fingerprints: ANDROID_SHA256.split(",").map((s) => s.trim()),
            },
          },
        ]
      : [];
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
  });
}
