# MILLANADA v9e — corrección del Worker público

Esta versión corrige el nombre del Worker para que el deploy publique exactamente en:

`https://millanada.jaimemillan103.workers.dev`

Cambios en `wrangler.jsonc`:

- `name`: `millanada`
- `workers_dev`: `true`
- Se mantiene el nuevo `MILLANADA_SCRIPT_URL`.

No cambia la landing ni Apps Script respecto a v9d.
