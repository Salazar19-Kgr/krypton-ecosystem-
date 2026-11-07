# KRYTON ECOSYSTEM | Arquitectura

## Visión general
KRYTON ECOSYSTEM organiza capacidades de inteligencia artificial en módulos funcionales que comparten una identidad y una arquitectura común.

## Dominios funcionales

| Dominio | Responsabilidad |
|:--|:--|
| CORE | Conversación y razonamiento general |
| HEALTH | Información de salud especializada |
| TOOLS | Productividad y generación de documentos |
| PLATFORM | Pruebas y control de calidad |
| SENTINEL | Ciberseguridad defensiva y OSINT |

## Principios
- **Separación de responsabilidades:** mantener límites claros entre interfaz, lógica e integraciones.
- **Modularidad:** permitir que cada capacidad evolucione sin acoplamiento innecesario.
- **Seguridad:** mantener secretos en variables de entorno y nunca exponerlos al cliente.
- **Extensibilidad:** incorporar proveedores y herramientas mediante integraciones controladas.
- **Documentación:** actualizar este documento cuando cambie la arquitectura real.

## Stack
Next.js, React, TypeScript, Tailwind CSS, Supabase y Google GenAI, según las dependencias y configuración del proyecto.

> Este documento describe dominios y principios. No implica que cada módulo o integración esté completamente implementado.
