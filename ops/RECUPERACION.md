# Recuperación: recrear el servicio desde este repo

Qué se necesita y en qué orden si la máquina que sirve el sitio se pierde. Los valores concretos (host, usuario, puertos, rutas)
**no están en este repo**: se pasan como variables (ver `bootstrap.sh`).

## Qué vive dónde
| Pieza | Dónde |
|---|---|
| Código del sitio, contenedor, plantillas de operación | este repo (`site/`, `docker-compose.yml`, `ops/`) |
| Checkout, contenedor, temporizador de auto-pull, vhosts de Apache, certificado | el servidor que sirve el sitio |
| Enrutado por nombre (SNI) hacia el servidor | el proxy del borde (HAProxy en modo TCP) |
| Registros A y TXT | el gestor de dominios |

## A. El servidor se perdió
1. Un host nuevo con Docker (con `docker compose`), Apache (módulos `ssl`, `proxy`, `proxy_http`, `headers`), `certbot`, `git`, `curl`.
2. Clonar el repo y ejecutar el script (usuario con `sudo`):
   ```bash
   APP_DIR=/ruta/del/checkout APP_PORT=<puerto-local-libre> SERVICE_USER=<usuario> ./ops/bootstrap.sh
   ```
   `CHECK=1` muestra lo que haría sin ejecutar nada. Es idempotente.
3. **Certificado:** ver sección C. Hasta tenerlo, el script instala solo el vhost del puerto 80.
4. **Borde:** apuntar el backend de `ops/haproxy-snippet.cfg` al host nuevo (`APP_HOST:APP_TLS_PORT`), validar y `reload`.
5. **DNS:** si la IP del borde no cambió, no hay que tocar nada; si cambió, actualizar los A (`ops/dns.md`).

## B. Se pierde la máquina desde la que se edita
`git clone` del repo y seguir `AGENTS.md`. Producción no depende de esa máquina: sigue haciendo `fetch` + `merge --ff-only` de `main`.

## C. Certificado caducado o perdido
La clave privada **no** está en el repo: se reemite. El certificado cubre `wiliamluis.com` y `www.wiliamluis.com`. Si el proxy del borde solo
reenvía el 443, el reto HTTP-01 no llega y hay que usar **DNS-01**: `certbot certonly --manual --preferred-challenges dns -d wiliamluis.com -d www.wiliamluis.com`,
crear los TXT `_acme-challenge` que pida (ver `ops/dns.md`), esperar a que propaguen (`dig`) y continuar. Tras emitir o renovar,
**recargar Apache** (`reload`). Con DNS-01 manual la renovación (~cada 90 días) es manual: ponte un aviso.

## Comprobación
- `curl -sI http://127.0.0.1:<APP_PORT>/` → 200 (contenedor).
- `curl -sI https://wiliamluis.com/` y `https://www.wiliamluis.com/` → 200 (todo el camino).
- `/.git/config` debe dar 404 (solo se monta `site/`).

## Revertir un cambio publicado
`git revert <commit>` y `git push`: el temporizador lo recoge en menos de un minuto. Nunca editar archivos versionados en el servidor
(el auto-pull se detiene si el árbol no está limpio).
