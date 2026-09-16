# La Millanada 2026 — v9 / brief v5

Landing Next.js/vinext para Cloudflare Workers, reconstruida a partir del brief v5 y del mockup HTML final.

## Qué cambia en esta versión

- Hero con la foto grupal fija.
- `Recap 2024` con las 15 fotos del mockup en un loop horizontal infinito y automático.
- Nav: `Recap 2024` · `Confirmar` · `Kahoot`; CTA de confirmar en verde.
- Fondo blanco dominante; naranja, verde y rojo como acentos.
- Horario actualizado del brief v5.
- Formulario: nombre → rama → plato obligatorio si viene alguien → “Algo más” → confirmar.
- Categorías de platos plegadas por defecto y filtro “Mostrar solo libres”.
- Kahoot separado, anónimo y con pregunta + respuesta obligatoria.
- Nueva fuente única de datos: Google Sheet `organización`.

## Base de datos

Spreadsheet ID:

`14bvnt5EWz-njcRNp_CxzoMqzOZfuhik2pf9YJ5ujbms`

La hoja real usa estas pestañas:

- `ASISTENCIA`: tabla maestra. El script solo modifica la columna de asistencia y escribe `CONFIRMADO` o vacío.
- `ENVIOS`: histórico append-only: FECHA, NOMBRE DE QUIEN RELLENA, FAMILIA, ALGO MÁS.
- `PLATOS`: histórico append-only: PLATO, QUIÉN LO TRAE, FECHA.
- `KAHOOT`: histórico append-only: PREGUNTA, RESPUESTA, FECHA.

El brief llama conceptualmente `PERSONAS` a la tabla maestra, pero el archivo vivo tiene la pestaña `ASISTENCIA`; esta implementación usa el nombre real sin renombrarla.

`setup()` migra automáticamente `KAHOOT` desde el esquema antiguo `NOMBRE | PREGUNTA | RESPUESTA | FECHA` al nuevo `PREGUNTA | RESPUESTA | FECHA`, conservando pregunta, respuesta y fecha.

## Apps Script

1. Abre el proyecto de Apps Script cuya implementación `/exec` usa la landing.
2. Sustituye su `Code.gs` por `apps-script/Code.gs`.
3. Guarda y ejecuta `setup()` una vez; acepta permisos.
4. Ve a **Implementar → Gestionar implementaciones → editar → Nueva versión → Implementar**.
5. Mantén **Ejecutar como: tú** y **Acceso: Cualquier persona**.

La URL configurada actualmente en `wrangler.jsonc` es:

`https://script.google.com/macros/s/AKfycbz0e1GYYQLzvW-RpGCmV1OOsnW4yZBCiCLKTRofqnXdC-tOZ6mh7d80_dsNpLh6wZrvrA/exec`

Si se crea una implementación distinta, cambia `MILLANADA_SCRIPT_URL`.

## Desarrollo y despliegue

```bash
npm ci
npm run dev
npm run build
```

Para Cloudflare Workers con GitHub:

- Root directory: `MILLANADA/landing` si el repo contiene la carpeta `MILLANADA`; vacío si `landing` es la raíz.
- Build command: `npm run build`
- Deploy command: `npx @vinext/cloudflare deploy --skip-build`
- Production branch: `main`

## Fotos

- Hero: `/public/hero-millanada.webp`.
- Loop: 15 IDs de Google Drive extraídos del mockup aprobado, en `app/data.ts` (`recapPhotoIds`).
- Las imágenes del loop se sirven mediante `https://drive.google.com/thumbnail?id=<ID>&sz=w1200`.

## Cierre de confirmaciones

El backend rechaza cambios desde el **6 de octubre de 2026 a las 00:00 (Europe/Madrid)**. La fecha límite mostrada al usuario es el **5 de octubre**.
