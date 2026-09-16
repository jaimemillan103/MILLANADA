# Apps Script v9 — La Millanada 2026

Este backend usa como fuente única el Google Sheet `organización`:

`14bvnt5EWz-njcRNp_CxzoMqzOZfuhik2pf9YJ5ujbms`

Pestañas reales:

- `ASISTENCIA`: maestro de personas. Solo se modifica la columna de asistencia (`CONFIRMADO` o vacío).
- `ENVIOS`: una fila nueva por cada confirmación enviada.
- `PLATOS`: una fila nueva cuando una persona reclama/cambia su plato.
- `KAHOOT`: una fila nueva por pregunta anónima.

## Actualización

1. Sustituye el contenido del Apps Script activo por `Code.gs`.
2. Guarda.
3. Ejecuta `setup()` una vez.
4. Acepta los permisos solicitados.
5. Actualiza la implementación web a **Nueva versión** y conserva acceso **Cualquier persona**.

`setup()` también migra `KAHOOT` de `NOMBRE | PREGUNTA | RESPUESTA | FECHA` a `PREGUNTA | RESPUESTA | FECHA` sin perder las tres columnas útiles.

## API

- `GET ?action=state`: personas, estados de asistencia y ocupación actual de platos.
- `POST { action: "rsvp", payload: ... }`: actualiza asistencia y añade registros a `ENVIOS` / `PLATOS`.
- `POST { action: "kahoot", payload: ... }`: añade pregunta + respuesta de forma anónima a `KAHOOT`.

Las escrituras se protegen con `LockService`.
