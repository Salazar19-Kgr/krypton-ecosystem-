// Krypton Ecosystem: service worker mínimo. Hace la app instalable y siempre toma la versión más nueva.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(
    fetch(event.request).catch(
      () =>
        new Response(
          "<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'><body style='margin:0;display:grid;place-items:center;height:100vh;background:#08142e;color:#fff;font-family:system-ui;text-align:center'><div><h1>Sin conexión</h1><p>Krypton necesita internet. Vuelve a intentarlo.</p></div>",
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        )
    )
  );
});
