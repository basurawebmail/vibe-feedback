# Changelog & Context Transfer

Este archivo documenta el estado actual del proyecto y sirve como punto de partida para continuar el desarrollo en una nueva sesión, manteniendo todo el contexto estructurado.

## 🚀 Estado Actual del Proyecto
Hemos construido el núcleo de la plataforma SaaS (anteriormente llamada "Vibe Feedback"), diseñada para recopilar feedback de usuarios mediante un widget embebido.

**Infraestructura y Despliegue:**
- El proyecto está desplegado correctamente en **Vercel** (`https://vibe-feedback.vercel.app`).
- Backend y base de datos soportados por **Supabase**.
- Las variables de entorno han sido sincronizadas en Vercel y localmente (`.env.local`).

**Autenticación Completada:**
- Flujo *Passwordless* (Magic Link) funcionando 100% en producción y local.
- Configuración de `Redirect URLs` en Supabase solucionada para permitir las redirecciones a `/auth/confirm`.
- Las sesiones de los usuarios se guardan y mantienen correctamente tras la validación del código (PKCE flow).

**Widget y Recepción de Datos:**
- El script embebible (`widget.js`) se inyecta correctamente en cualquier web del cliente mediante Shadow DOM.
- El widget usa un atributo `data-api` dinámico para saber a qué endpoint enviar la información.
- El endpoint `api/feedback/route.ts` recibe las peticiones `POST`, valida el `script_token` del proyecto y almacena correctamente el feedback en Supabase (aplicando políticas RLS para permitir inserciones anónimas).

---

## 📋 Tareas Pendientes (Para la siguiente sesión)

Estas son las prioridades inmediatas a abordar en el nuevo chat:

### 1. Rebranding (Nuevo Nombre)
- Sustituidas las menciones "Vibe Feedback" por "ForgePulse" (empresa) y "LensReport" (producto).
- Actualizado esquema de colores a tonos suaves azul/gris oscuro con acentos verdes cálidos.

### 2. Soporte Multi-idioma (i18n)
- Implementado proveedor de i18n (`I18nProvider`) con diccionarios (`es.json`, `en.json`).
- Middleware ajustado para detectar `Accept-Language` y guardar preferencia en cookie `NEXT_LOCALE`.

### 3. Stripe y Precios (Mocks)
- Endpoint `/api/checkout` para simular creación de sesión.
- Webhook `/api/webhook/stripe` preparado para recibir pagos y actualizar `plan: 'starter'`.

### 4. Scaffolding IA (Gemini 2.0 Flash) y Anti-spam
- Endpoint `/api/ai/process` como Edge Function (con mock response que simula el parseo JSON de Gemini).
- El endpoint `/api/feedback` ahora lanza asíncronamente el proceso de IA tras guardar en la BD.
- Implementado Cloudflare Turnstile (stub) y honeypot en el flujo de recepción.

### 3. Personalización de Correos
- Ir a Supabase > Authentication > Email Templates.
- Personalizar el diseño y contenido HTML del correo enviado en el Magic Link para que coincida con la nueva marca.

---

*Nota para la IA de la próxima sesión: Revisa este documento para entender la arquitectura actual y priorizar la implementación de i18n y el Rebranding global del proyecto.*
