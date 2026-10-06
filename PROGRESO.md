# Krypton Ecosystem — Progreso

## Cómo retomar
Al continuar en un chat nuevo, escribe "continúa Krypton". Antes de publicar: `npx tsc --noEmit`, y luego `git add -A`, `git commit`, `git push origin main` (GitHub Actions despliega solo). Termux no tiene /tmp.

## Infraestructura
- Web: https://krypton-ecosystem.prds33735435.workers.dev (Cloudflare Workers + Vinext)
- Repo: Salazar19-Kgr/krypton-ecosystem-; workflow `.github/workflows/cloudflare-deploy.yml` (fija compatibilityDate)
- Next.js 16 + Tailwind v4; Supabase: login Google, tablas profiles, conversations y messages con RLS
- Secretos en Cloudflare: GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, TAVILY_API_KEY, Cloudinary

## Cerebro (lib/krypton)
- llm.ts: Gemini (4 modelos en cadena) → Groq → OpenRouter gratis
- brain.ts: reconocimiento por reglas + Tavily, Wikipedia, calculadora
- vision.ts: análisis de imágenes (placas de compresores incluidas)
- imagegen.ts: generar imágenes (Gemini escribe el prompt → modelo de imagen → Cloudinary)
- app/api/chat/route.ts: sesión, historial en Supabase, reintentos; app/api/diag/route.ts: diagnóstico

## Interfaz
- app/globals.css: liquid glass sobre public/krypton-water.webp; AquaticBackground y PerformanceGuard en el layout
- Chat compacto con imágenes y Markdown; historial en /memory

## Pendientes
Dashboard con datos reales, streaming de respuestas, refrigeración y matemáticas más profundas, límites de uso por usuario, borrar carpetas vacías (ai, core, modules).
