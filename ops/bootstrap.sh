#!/usr/bin/env bash
# bootstrap.sh — recrea el servicio del sitio en un host nuevo (Docker + Apache + auto-pull). Idempotente.
# No toca el DNS ni el proxy del borde: al final imprime lo que falta hacer a mano.
#
# Variables obligatorias:  APP_DIR (carpeta destino)  APP_PORT (puerto local libre)  SERVICE_USER (usuario que corre el auto-pull)
# Opcionales:              REPO_URL, DOMAIN, SUDO (comando para elevar privilegios), CHECK=1 (solo muestra lo que haría)
set -euo pipefail

: "${APP_DIR:?define APP_DIR (carpeta donde vivirá el checkout)}"
: "${APP_PORT:?define APP_PORT (puerto local libre, solo 127.0.0.1)}"
: "${SERVICE_USER:?define SERVICE_USER (usuario que ejecuta el timer)}"
REPO_URL="${REPO_URL:-https://github.com/wiliamquispe/portfolio.git}"
DOMAIN="${DOMAIN:-wiliamluis.com}"
CHECK="${CHECK:-0}"
SUDO="${SUDO:-sudo}"   # comando para elevar privilegios (sudo por defecto)

run() { if [ "$CHECK" = 1 ]; then echo "[check] $*"; else "$@"; fi; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "falta '$1'" >&2; exit 1; }; }

for c in git docker curl systemctl apache2ctl; do need "$c"; done
docker compose version >/dev/null 2>&1 || { echo "falta 'docker compose'" >&2; exit 1; }
case "$APP_PORT" in ''|*[!0-9]*) echo "APP_PORT debe ser numérico" >&2; exit 1 ;; esac
if ss -tln 2>/dev/null | grep -qE "[:.]${APP_PORT}\b"; then
  # si ya lo ocupa nuestro propio contenedor es una repetición normal
  docker ps --format '{{.Names}} {{.Ports}}' | grep -q "portfolio-landing.*:${APP_PORT}->" || { echo "el puerto ${APP_PORT} ya está en uso" >&2; exit 1; }
fi

echo "== 1. Código en ${APP_DIR}"
if [ -d "${APP_DIR}/.git" ]; then run git -C "$APP_DIR" pull --ff-only
else run $SUDO mkdir -p "$APP_DIR"; run $SUDO chown "${SERVICE_USER}:" "$APP_DIR"; run $SUDO -u "$SERVICE_USER" git clone "$REPO_URL" "$APP_DIR"; fi
[ "$CHECK" = 1 ] || $SUDO -u "$SERVICE_USER" env APP_DIR="$APP_DIR" APP_PORT="$APP_PORT" sh -c 'printf "APP_PORT=%s\n" "$APP_PORT" > "$APP_DIR/.env"'

echo "== 2. Contenedor"
run docker compose -f "${APP_DIR}/docker-compose.yml" --project-directory "$APP_DIR" up -d
if [ "$CHECK" != 1 ]; then
  sleep 2; code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:${APP_PORT}/")
  [ "$code" = 200 ] || { echo "el contenedor no responde 200 (HTTP=${code})" >&2; exit 1; }; echo "contenedor OK (HTTP=200)"
fi

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
render() { sed "s|__APP_DIR__|${APP_DIR}|g; s|__PORT__|${APP_PORT}|g; s|__SERVICE_USER__|${SERVICE_USER}|g" "$1" > "$2"; }

echo "== 3. Auto-pull (systemd)"
if [ "$CHECK" != 1 ]; then
  for f in portfolio-autopull.sh portfolio-autopull.service portfolio-autopull.timer; do render "${APP_DIR}/ops/${f}" "${tmp}/${f}"; done
  $SUDO install -m 755 "${tmp}/portfolio-autopull.sh" /usr/local/sbin/portfolio-autopull.sh
  $SUDO install -m 644 "${tmp}/portfolio-autopull.service" "${tmp}/portfolio-autopull.timer" /etc/systemd/system/
  $SUDO systemctl daemon-reload; $SUDO systemctl enable --now portfolio-autopull.timer
else echo "[check] instalaría portfolio-autopull.{sh,service,timer}"; fi

echo "== 4. Apache"
if [ "$CHECK" != 1 ]; then
  for f in "${DOMAIN}.conf" "${DOMAIN}-ssl.conf"; do render "${APP_DIR}/ops/apache/${f}" "${tmp}/${f}"; done
  $SUDO install -m 644 "${tmp}/${DOMAIN}.conf" "/etc/apache2/sites-available/${DOMAIN}.conf"; $SUDO a2ensite "${DOMAIN}" >/dev/null
  if $SUDO test -d "/etc/letsencrypt/live/${DOMAIN}"; then
    $SUDO install -m 644 "${tmp}/${DOMAIN}-ssl.conf" "/etc/apache2/sites-available/${DOMAIN}-ssl.conf"; $SUDO a2ensite "${DOMAIN}-ssl" >/dev/null
  else echo "AVISO: no hay certificado para ${DOMAIN}; se instala solo el vhost :80 (ver RECUPERACION.md, 'Certificado')."; fi
  $SUDO apache2ctl configtest && $SUDO systemctl reload apache2
else echo "[check] instalaría los vhosts de ${DOMAIN} y haría reload de Apache"; fi

cat <<MSG

== Falta, a mano ==
 - DNS: ver ops/dns.md
 - Borde (HAProxy): ver ops/haproxy-snippet.cfg
 - Certificado: ver ops/RECUPERACION.md
MSG
