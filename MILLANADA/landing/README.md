# La Millanada 2026 — landing + RSVP

Landing en Next.js/vinext para La Millanada 2026. El RSVP reproduce el flujo de `PRIMA_ARTIFACT.html`: búsqueda por nombre, confirmación de rama familiar, extras, reparto de platos, notas y pregunta para el Kahoot.

## 1. Despliegue

### Web

Este proyecto **no es una web estática para subir el ZIP directamente a Cloudflare Pages**: usa la ruta de servidor `/api/millanada` como proxy hacia Apps Script. El destino recomendado es **Cloudflare Workers**, que sirve tanto la web como esa ruta API.

1. Instala dependencias: `npm ci`.
2. Para desarrollo: `npm run dev`.
3. Para comprobar producción: `npm run build`.
4. La URL `/exec` de Apps Script ya está incluida en `wrangler.jsonc` como `MILLANADA_SCRIPT_URL`. Si algún día vuelves a desplegar Apps Script con otro ID, actualiza ese valor.
5. Despliega con `npm run deploy` (equivale a `npx @vinext/cloudflare deploy`) o conecta el repositorio a **Cloudflare Workers Builds**.

Si usas el panel de Cloudflare con GitHub/GitLab, el directorio raíz del proyecto debe ser esta carpeta `landing/`. Una configuración sencilla es usar `npm ci` como Build command y `npm run deploy` como Deploy command. En esta versión no hace falta añadir `MILLANADA_SCRIPT_URL` a mano en Cloudflare: ya va definida en `wrangler.jsonc`.

Si `MILLANADA_SCRIPT_URL` no existe, la web entra deliberadamente en **modo prueba** y guarda solo en `localStorage`. La interfaz lo avisa de forma visible para evitar confundir pruebas con confirmaciones reales.

### Google Apps Script

1. Abre el proyecto de Apps Script conectado al Google Sheet `Reparto Menu Millanada`.
2. Sustituye su código por `apps-script/Code.gs`.
3. Ejecuta `setup()` una vez y concede permisos.
4. Crea/actualiza el despliegue como **Aplicación web**:
   - Ejecutar como: propietario del script.
   - Acceso: cualquiera con el enlace.
5. Copia la URL terminada en `/exec` y úsala como `MILLANADA_SCRIPT_URL` en el hosting.

La web consulta el estado cada 8 segundos y usa `searcherId` como clave de upsert: si una persona vuelve a enviar su respuesta, se actualiza la misma fila en vez de crear un duplicado.

## 2. URL pública actual

**No venía incluida en el ZIP recibido.** Antes de entregar al cliente, sustituir esta línea por la URL pública del despliegue definitivo.

## 3. Campos escritos en Google Sheets

El script usa dos pestañas del mismo Google Sheet:

- `Confirmaciones Web`: conserva el RSVP completo y hace upsert por `searcher_id`.
- `Reparto Menu`: es el reparto visible de comida y material. En cada guardado la web reconstruye automáticamente las columnas **E (FAMILIA RESPONSABLE)**, **F (CONFIRMADO)** y **G (NOTAS)** a partir de los RSVP actuales. Así, si una familia cambia de plato, se borra la asignación anterior y aparece la nueva sin duplicados. Los platos escritos en «Otro plato» se añaden al final como `OTRO PROPUESTO`.

En `Confirmaciones Web`, si ya existen columnas del formulario antiguo, **no se borran**: se añaden al final las columnas nuevas que falten.

Columnas nuevas:

- `submitted_at`: fecha/hora del primer envío.
- `searcher_id`: ID estable del invitado que rellena; clave de upsert.
- `searcher_name`: nombre del invitado que rellena.
- `familia`: rama familiar.
- `attendees_json`: JSON con `[{id, name, age, attending, extra, dishes}]`.
- `dish_selection_json`: JSON con los platos seleccionados.
- `other_dish`: propuesta libre de otro plato.
- `notes`: alergias, sillas de peques, hora de llegada, etc.
- `kahoot_question`: pregunta propuesta para el Kahoot.
- `updated_at`: fecha/hora del último guardado.

Payload lógico enviado por la landing:

```json
{
  "searcherId": "42",
  "searcherName": "Álvaro",
  "familia": "Millán Sánchez",
  "attendees": [
    {
      "id": "42",
      "name": "Álvaro",
      "age": "Joven adulto",
      "attending": true,
      "extra": false,
      "dishes": ["Salmorejo cordobés"]
    }
  ],
  "dishSelection": ["Salmorejo cordobés"],
  "otherDish": "",
  "notes": "",
  "kahootQuestion": "",
  "updatedAt": "2026-09-14T21:00:00.000Z"
}
```

## Menú sincronizado con la landing

La lista de `app/data.ts` y la pestaña `Reparto Menu` usan los mismos 36 conceptos. Incluye los cambios de septiembre: ensalada de tomate con atún, nachos con guacamole, empanadas sin sabor fijado, pan preñao de queso, alitas en la barbacoa, bebidas separadas (Coca-Cola, Fanta, Nuestra, Aquarius y cervezas), bolsas de hielo y el material (platos, vasos, cubiertos, servilletas, bolsas de basura grandes, fuentes y cuencos). Las berenjenas se han retirado.

La nota de bebidas indica que ya hay ron, ginebra, wishkey, vodka y pacharán, por lo que esos alcoholes no se ofrecen como compra en el reparto.

## Endpoints lógicos

La landing habla con `/api/millanada`, que actúa como proxy para no exponer lógica de Apps Script en el cliente:

- `GET /api/millanada?action=state`: total de personas confirmadas + ocupación de platos.
- `GET /api/millanada?action=rsvp&searcherId=42`: recupera el RSVP guardado para editarlo.
- `POST /api/millanada`: guarda/actualiza un RSVP.

El endpoint público de estado **no devuelve** notas ni preguntas del Kahoot.

## Cierre de confirmaciones

Desde el **6 de octubre de 2026 a las 00:00 (hora peninsular)**, es decir, terminado el 5 de octubre, la landing queda en modo consulta y el Apps Script rechaza escrituras con el mensaje:

> Confirmaciones cerradas — habla con Teresa.

## Nota para sincronizar `PLAN.md`

`PRIMA_ARTIFACT.html` contiene **63 invitados**, no 62. Esa lista exacta está ahora en `app/data.ts` y sustituye a la lista antigua para la landing. `PLAN.md` no se ha modificado, por petición expresa; hay que sincronizar allí la lista en una pasada posterior de Claude Code/Codex.

## Fotos

Las imágenes de `public/galeria/` y `public/hero-millanada.webp` ya usan fotos reales de la Millanada anterior tomadas de la carpeta compartida `FOTOS MILLANADA 2024`. La foto de grupo se usa como hero y cinco imágenes adicionales forman la galería.


## Backend Apps Script desplegado

URL activa: `https://script.google.com/macros/s/AKfycbwJSf_hmiIYSSK11fltTY-6r9HUfUXKtyCsnznaBIY2dgPZN1wlO4ItZ7jw4wflbCLNBg/exec`

## Despliegue recomendado: GitHub -> Cloudflare Workers

La forma recomendada para producción es conectar este repositorio a **Cloudflare Workers Builds** y dejar que Cloudflare instale, construya y despliegue en cada `push` a `main`.

Si el repositorio contiene toda la carpeta `MILLANADA`, usa estos ajustes en Cloudflare:

- Root directory: `MILLANADA/landing`
- Build command: `npm run build`
- Deploy command: `npx @vinext/cloudflare deploy --skip-build`
- Production branch: `main`

Si `landing/` es la raíz del repositorio, deja Root directory vacío.

`wrangler.jsonc` ya contiene el nombre `la-millanada-2026` y `MILLANADA_SCRIPT_URL` con el Apps Script de producción.

El `vite.config.ts` usa únicamente la configuración oficial mínima de vinext + `@cloudflare/vite-plugin`; no necesita KV, CDN cache ni Cloudflare Images para esta landing.
