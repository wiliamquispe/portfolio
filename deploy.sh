#!/usr/bin/env bash
# deploy.sh — comprueba que lo local está en origin/main y espera a que el servidor lo recoja (auto-pull cada minuto).
# Opcional: DEPLOY_HOST=<alias SSH del servidor> para ver el log del auto-pull; SITE_URL para verificar el sitio.
set -euo pipefail
cd "$(dirname "$0")"
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || { echo "Hay cambios sin commitear. Haz commit primero."; git status --short; exit 1; }
git fetch -q origin main
[[ "$(git rev-parse HEAD)" == "$(git rev-parse origin/main)" ]] || { echo "HEAD no coincide con origin/main: haz git push (o pull)."; git status -sb | head -1; exit 1; }
echo "OK: $(git log -1 --oneline)"
echo "El servidor lo recoge en menos de un minuto."
if [[ -n "${DEPLOY_HOST:-}" ]]; then
  sleep 70
  ssh "$DEPLOY_HOST" "journalctl -t portfolio-autopull -n 5 --no-pager -o cat" || true
fi
if [[ -n "${SITE_URL:-}" ]]; then curl -sI "$SITE_URL" | head -1; fi
