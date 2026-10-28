# AGENTS.md — portfolio (sitio estático de Wiliam Quispe)

Instrucciones para un agente que cambie este repo. Es **público**: no añadas aquí ni en `ops/` contraseñas, tokens, claves, nombres de
máquinas, usuarios del servidor, IPs, rutas de producción ni fechas de caducidad de certificados.

## Qué es
Sitio estático bilingüe en `site/`: `index.html`, `css/` (`tokens.css`, `fonts.css`, `base.css`), `js/` (`site.js`: idioma, menú, fundido del hero,
entradas, filas del libro; `match.js`: «Compara con tu oferta»), `img/`, `fonts/`, `cv/`, `privacidad.html`. Sin build, sin dependencias.

## Reglas de diseño (no mezclar con otro estilo)
- Una columna de 440-560 px a ~22 % del ancho; hero a pantalla completa con la barra de 64 px en la línea media.
- Un solo tipo (STIX Two Text), cinco pasos de tamaño, un acento (mandarina) por pantalla; texto corrido ≥ 16 px.
- Sin líneas finas, degradados, sombras en reposo, monoespaciada, iconos en tarjetas, cristal ni emojis.
- Texto en ES y EN a la vez: `<span lang="es">…</span><span lang="en">…</span>`; el contenido nunca depende de JavaScript para verse.
- Solo `transform` y `opacity` en el movimiento; respetar `prefers-reduced-motion`.

## Cómo cambiar algo
1. Editar `site/`; probar en local (ver README).
2. Comprobar a 1440, 768 y 390 px y con teclado; sin errores en consola.
3. Commit y push a `main`. El despliegue es automático (el servidor hace fast-forward de `main`). No se edita producción a mano; se revierte con `git revert`.

## Operación
`docker-compose.yml` y `ops/` describen cómo se sirve el sitio y cómo recrearlo (`ops/RECUPERACION.md`, `ops/bootstrap.sh`). El puerto local sale de `.env` (`APP_PORT`, no versionado). Los ficheros usan marcadores
(`__SERVICE_USER__`, `__APP_DIR__`, `__PORT__`, `APP_HOST`, `APP_TLS_PORT`); los valores reales no están en este repo.
