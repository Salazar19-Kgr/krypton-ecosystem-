import LegalDoc from "@/components/legal/LegalDoc";

export const metadata = { title: "Términos y condiciones · Krypton Ecosystem" };

export default function TermsPage() {
  return (
    <LegalDoc
      eyebrow="LEGAL"
      title="Términos y condiciones"
      updated="18 de octubre de 2026"
      intro="Estos términos regulan el uso de Krypton Ecosystem (en adelante, Krypton). Al crear una cuenta o usar el servicio declaras que los has leído y aceptas. Si no estás de acuerdo, no uses Krypton."
      sections={[
        {
          title: "Qué es Krypton",
          body: [
            "Krypton es un asistente de inteligencia artificial que permite conversar, analizar imágenes, resolver problemas de matemáticas, consultar temas de refrigeración, buscar información y generar imágenes.",
            "El servicio está en versión beta: puede cambiar, tener fallos o interrupciones sin previo aviso.",
          ],
        },
        {
          title: "Tu cuenta",
          body: [
            "Inicias sesión con tu cuenta de Google. Eres responsable de la actividad que ocurra en tu cuenta y de mantenerla segura.",
            "Debes tener al menos 13 años. Si eres menor de edad, usa Krypton con el permiso de tu madre, padre o tutor.",
          ],
        },
        {
          title: "Uso aceptable",
          body: [
            "No puedes usar Krypton para actividades ilegales, para acosar o dañar a otras personas, para suplantar identidades, para crear contenido que explote a menores, para generar software malicioso ni para intentar vulnerar la seguridad del servicio.",
            "Podemos aplicar límites de uso, por ejemplo un máximo diario de imágenes generadas, y suspender cuentas que incumplan estas reglas.",
          ],
        },
        {
          title: "Respuestas generadas por inteligencia artificial",
          body: [
            "Las respuestas pueden contener errores o estar incompletas. Verifica siempre la información importante antes de tomar decisiones.",
            "Krypton no sustituye el consejo de un profesional. En temas de electricidad, refrigeración, finanzas, derecho o salud, consulta a una persona calificada y sigue las normas de seguridad correspondientes.",
          ],
        },
        {
          title: "Krypton Health",
          body: [
            "Krypton Health ofrece información médica general y orientación. No es un diagnóstico, no es un tratamiento y no reemplaza a un médico. En una emergencia, llama de inmediato a los servicios de emergencia de tu país.",
          ],
        },
        {
          title: "Tu contenido",
          body: [
            "Conservas la propiedad de los mensajes e imágenes que envías. Nos autorizas a procesarlos únicamente para darte el servicio.",
            "Tus conversaciones se guardan en tu historial y puedes borrarlas cuando quieras desde Configuración.",
          ],
        },
        {
          title: "Servicios de terceros",
          body: [
            "Krypton funciona con proveedores externos, como Google, OpenAI, Groq, OpenRouter, Tavily, Wikipedia, Cloudinary, Supabase y Cloudflare. Sus propios términos se aplican a sus servicios.",
          ],
        },
        {
          title: "Propiedad intelectual",
          body: [
            "El diseño, la marca, el código y los textos de Krypton pertenecen a su titular. No puedes copiarlos, venderlos ni redistribuirlos sin autorización.",
          ],
        },
        {
          title: "Disponibilidad y responsabilidad",
          body: [
            "Krypton se ofrece tal como está, sin garantía de funcionamiento continuo ni de que las respuestas sean exactas. En la medida que permita la ley, no nos hacemos responsables de daños derivados del uso del servicio o de decisiones tomadas a partir de sus respuestas.",
          ],
        },
        {
          title: "Cambios en los términos",
          body: [
            "Podemos actualizar estos términos. Cuando haya cambios importantes lo indicaremos en la app. Si sigues usando Krypton después de una actualización, aceptas los nuevos términos.",
          ],
        },
        {
          title: "Ley aplicable y contacto",
          body: [
            "Estos términos se rigen por las leyes de la República Bolivariana de Venezuela, sin perjuicio de los derechos que te correspondan según la ley de tu país.",
            "Para dudas o reclamos escríbenos por WhatsApp al +58 424 5095002.",
          ],
        },
      ]}
    />
  );
}
