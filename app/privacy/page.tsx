import LegalDoc from "@/components/legal/LegalDoc";

export const metadata = { title: "Política de privacidad · Krypton Ecosystem" };

export default function PrivacyPage() {
  return (
    <LegalDoc
      eyebrow="LEGAL"
      title="Política de privacidad"
      updated="18 de octubre de 2026"
      intro="Esta política explica qué datos recopila Krypton Ecosystem (en adelante, Krypton), para qué los usa y cómo puedes controlarlos. No vendemos tus datos ni mostramos publicidad."
      sections={[
        {
          title: "Datos que recopilamos",
          body: [
            "Datos de tu cuenta de Google: nombre, correo electrónico y foto de perfil.",
            "Tus conversaciones: los mensajes que escribes y las respuestas que recibes, y las imágenes que adjuntas para analizarlas o que generas con Krypton.",
            "Preferencias de uso, como la configuración de animaciones, que se guardan en tu dispositivo. También registramos datos técnicos mínimos para seguridad, límites de uso y corrección de errores.",
          ],
        },
        {
          title: "Para qué usamos tus datos",
          body: [
            "Para darte el servicio, guardar tu historial, aplicar límites diarios, proteger la plataforma contra abusos y mejorar su estabilidad.",
          ],
        },
        {
          title: "Con quién se comparten",
          body: [
            "Para responderte, enviamos solo lo necesario a nuestros proveedores: Google (inicio de sesión y modelos de inteligencia artificial), OpenAI, Groq y OpenRouter (modelos de inteligencia artificial), Tavily y Wikipedia (búsqueda de información), Cloudinary (imágenes generadas), Supabase (base de datos y autenticación) y Cloudflare (alojamiento).",
            "No compartimos tus datos con anunciantes.",
          ],
        },
        {
          title: "Cuánto tiempo los conservamos",
          body: [
            "Conservamos tu historial mientras tengas cuenta o hasta que lo borres. Puedes borrar todo tu historial desde Configuración. Si quieres eliminar tu cuenta y tus datos por completo, escríbenos.",
          ],
        },
        {
          title: "Seguridad",
          body: [
            "Usamos conexiones cifradas y reglas de acceso que permiten que cada persona vea únicamente sus propias conversaciones. Ningún sistema es totalmente seguro, por eso te recomendamos no compartir contraseñas, datos bancarios ni información sensible innecesaria.",
          ],
        },
        {
          title: "Tus derechos",
          body: [
            "Puedes pedir acceso a tus datos, corregirlos, borrarlos u oponerte a su uso. Para ejercer estos derechos usa Configuración o escríbenos por WhatsApp al +58 424 5095002.",
          ],
        },
        {
          title: "Almacenamiento local y cookies",
          body: [
            "Usamos cookies necesarias para mantener tu sesión iniciada y almacenamiento local para guardar tus preferencias. No usamos cookies de publicidad ni de seguimiento de terceros.",
          ],
        },
        {
          title: "Krypton Health y datos de salud",
          body: [
            "Si usas Krypton Health, los datos de salud que escribas o adjuntes se procesan solo para responderte. Comparte únicamente lo que consideres necesario.",
          ],
        },
        {
          title: "Menores de edad",
          body: [
            "Krypton no está dirigido a menores de 13 años. Si eres menor de edad, úsalo con el permiso de tu madre, padre o tutor.",
          ],
        },
        {
          title: "Cambios y contacto",
          body: [
            "Podemos actualizar esta política y lo indicaremos en la app. Para cualquier consulta sobre tu privacidad escríbenos por WhatsApp al +58 424 5095002.",
          ],
        },
      ]}
    />
  );
}
