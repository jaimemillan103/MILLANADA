# Apps Script — La Millanada 2026

`Code.gs` conecta la landing con el Google Sheet `Reparto Menu Millanada` (ID ya configurado dentro del script).

## Instalación / actualización

1. Abre el proyecto de Google Apps Script que tenga acceso al Sheet.
2. Sustituye el contenido por `Code.gs`.
3. Ejecuta `setup()` una vez y acepta permisos.
4. Despliega como **Aplicación web**:
   - Ejecutar como: tú / propietario del Sheet.
   - Acceso: cualquiera con el enlace.
5. Copia la URL que termina en `/exec`.
6. Configura esa URL como `MILLANADA_SCRIPT_URL` en el hosting de la landing.

Cuando cambie `Code.gs`, crea una nueva versión del despliegue (o actualiza la existente) para que la URL `/exec` ejecute el código nuevo.

## Operaciones

- `GET ?action=state`: devuelve solo información pública necesaria para contador y reparto.
- `GET ?action=rsvp&searcherId=...`: devuelve la respuesta guardada de ese invitado para poder editarla.
- `POST { action: "submit", payload: ... }`: guarda o actualiza por `searcherId`.

Las escrituras se protegen con `LockService` para evitar choques si varias ramas guardan al mismo tiempo.

## Pestañas y columnas

### `Confirmaciones Web`

El script conserva columnas antiguas y añade las nuevas que falten:

`submitted_at`, `searcher_id`, `searcher_name`, `familia`, `attendees_json`, `dish_selection_json`, `other_dish`, `notes`, `kahoot_question`, `updated_at`.

`kahoot_question` queda como columna independiente para recopilar todas las propuestas fácilmente.

### `Reparto Menu`

Después de cada `POST`, `syncMenuAssignments_()` reconstruye el reparto desde todos los RSVP vigentes:

- Columna E `FAMILIA RESPONSABLE`: familia o familias que se han apuntado ese concepto.
- Columna F `CONFIRMADO`: `✅` cuando existe al menos un responsable.
- Columna G `NOTAS`: nombres de las personas que lo llevan.

Al reconstruirlo entero, editar un RSVP no deja asignaciones antiguas. Si alguien escribe un plato libre que no existe en el menú, se añade una fila `OTRO PROPUESTO` al final. `LockService` protege tanto el RSVP como esta sincronización para evitar choques entre envíos simultáneos.

## Cierre

A partir del 6 de octubre de 2026 00:00 +02:00, `POST` rechaza cambios. Los `GET` siguen funcionando para consulta.
