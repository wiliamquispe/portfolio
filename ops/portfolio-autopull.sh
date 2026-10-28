#!/bin/bash
# Auto-pull del portfolio: fetch + merge --ff-only de main. Lo ejecuta un timer de systemd como __SERVICE_USER__.
# Marcadores (los sustituye bootstrap.sh al instalar): __APP_DIR__, __PORT__
set -u
D=__APP_DIR__
G() { git -C "$D" "$@"; }
log() { logger -t portfolio-autopull "$*"; echo "$*"; }
exec 9>/tmp/portfolio-autopull.lock; flock -n 9 || exit 0

G fetch -q origin main || { log "ERROR fetch"; exit 1; }
L=$(G rev-parse HEAD); R=$(G rev-parse origin/main)
[ "$L" = "$R" ] && exit 0
G merge-base --is-ancestor "$L" "$R" || { log "ABORTA: HEAD local no es ancestro de origin/main (no fast-forward)"; exit 1; }
[ -z "$(G status --porcelain --untracked-files=no)" ] || { log "ABORTA: cambios locales sin commitear en produccion"; exit 1; }

CH=$(G diff --name-only "$L" "$R")
G merge --ff-only -q origin/main || { log "ERROR merge"; exit 1; }
log "actualizado $(echo "$L" | cut -c1-7) -> $(echo "$R" | cut -c1-7): $(echo "$CH" | tr '\n' ' ')"

# site/ es un montaje de solo lectura (sin reinicio); si cambia el compose se recrea el contenedor y si cambia nginx.conf se recarga
grep -qx 'docker-compose.yml' <<<"$CH" && docker compose -f "$D/docker-compose.yml" up -d
grep -qx 'ops/nginx.conf' <<<"$CH" && docker compose -f "$D/docker-compose.yml" exec -T web nginx -s reload
code=$(curl -sk -o /dev/null -w '%{http_code}' http://127.0.0.1:__PORT__/)
log "verificacion HTTP=$code"
[ "$code" = 200 ] || exit 1
