# Puesta en marcha v9

## 1) Apps Script

Usa **el Apps Script que ya está detrás de la URL `/exec` de la landing**.

1. Pega `apps-script/Code.gs` sustituyendo el código actual.
2. Guarda.
3. Ejecuta `setup()` una vez.
4. Comprueba que termina con `OK: organización preparada...`.
5. Implementar → Gestionar implementaciones → editar → **Nueva versión** → Implementar.
6. Ejecutar como: tú. Acceso: **Cualquier persona**.

La v9 usa únicamente el Sheet `organización` (ID `14bvnt5EWz-njcRNp_CxzoMqzOZfuhik2pf9YJ5ujbms`).

## 2) GitHub / Cloudflare

Sustituye el contenido del proyecto por esta versión o sube los archivos modificados y haz commit a `main`.

`wrangler.jsonc` mantiene la URL `/exec` actual. Si Apps Script conserva la misma implementación, no hay que cambiarla.

## 3) Prueba antes de publicar

Haz una prueba con una rama y verifica:

- `ASISTENCIA`: solo cambia la columna ASISTENCIA a `CONFIRMADO` o vacío.
- `ENVIOS`: aparece una fila nueva con fecha, rellenador, familia y “Algo más”.
- `PLATOS`: aparece el plato reclamado.
- `KAHOOT`: pregunta y respuesta se guardan sin nombre.
- En la landing, un plato ya reclamado aparece ocupado.

No borres las filas de cabecera `RAMA: ...` de `ASISTENCIA`.
