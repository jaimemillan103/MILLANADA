# MILLANADA v9d

Cambios respecto a v9b:

- Las 15 fotos del Recap están alojadas dentro de la web (`public/recap`) como WebP optimizadas. Ya no dependen de Google Drive para mostrarse.
- Eliminada la frase bajo las fotos que explicaba que el carrusel se mueve solo.
- La página principal vuelve a renderizarse como componente de servidor; solo la cuenta atrás, el loop, RSVP y Kahoot usan JavaScript cliente. Esto reduce JS inicial y hace la carga más robusta.
- Se mantiene el `/exec` nuevo en `wrangler.jsonc`.

Publicación: subir esta versión a `main` y esperar el redeploy de Cloudflare.
