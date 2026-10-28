# portfolio

Portfolio de **Wiliam Quispe**, AI & Data Engineer en Lima. <https://wiliamluis.com>

Sitio estático y bilingüe (ES/EN), sin cookies, sin analítica y sin scripts de terceros. HTML, CSS y JavaScript propios; tipografía
STIX Two Text autoalojada (SIL OFL). Una función interactiva, «Compara con tu oferta»: cruza una oferta de trabajo con mis habilidades
**en tu navegador** (coincidencia de palabras clave; no envía nada).

## Estructura
```
site/              el sitio (index.html, privacidad.html, css/, js/, img/, fonts/, cv/)
docker-compose.yml nginx que sirve site/ en el puerto local APP_PORT
ops/               cómo se sirve y cómo recrearlo en un host nuevo (genérico, con marcadores)
deploy.sh          comprueba que lo local está en origin/main y espera al despliegue
CREDITOS.md        créditos de las fotografías
```

## Probar en local
```bash
python3 -m http.server -d site 8766 --bind 127.0.0.1    # http://127.0.0.1:8766/
```

## Despliegue
`main` es la fuente de verdad: un push se publica solo (contenedor nginx detrás de un proxy inverso con TLS; un temporizador hace
`git fetch` + `merge --ff-only`). Cómo recrearlo en un host nuevo: [`ops/RECUPERACION.md`](ops/RECUPERACION.md).

## Diseño
Dirección «The quiet instrument»: una columna, un acento por pantalla, la tipografía como protagonista y fotografía de cielo a sangre entre capítulos.

Código bajo la licencia de este repositorio.
