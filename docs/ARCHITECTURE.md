# Arquitectura de Krypton Ecosystem

Todos los modulos llaman a un mismo cerebro (lib/krypton/brain.ts), que decide el modo de respuesta y arma el contexto antes de llamar al proveedor de IA.

La cadena de proveedores (lib/krypton/llm.ts) prueba Gemini, DeepSeek, Groq, OpenRouter y OpenAI en orden, saltando el que falle.

Supabase guarda cuentas, planes, pagos y la biblioteca de conocimiento.

Cloudflare Workers sirve la aplicacion en produccion.
