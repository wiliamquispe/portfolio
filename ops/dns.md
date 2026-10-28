# DNS de wiliamluis.com

En el gestor de dominios, zona `wiliamluis.com`:

| Tipo | Host | Valor | Notas |
|---|---|---|---|
| A | `@` | `<IP_DEL_BORDE>` | La IP pública del proxy que recibe el 443. |
| A | `www` | `<IP_DEL_BORDE>` | Igual. |
| TXT | `_acme-challenge` | *(lo indica certbot en cada emisión/renovación)* | Temporal. Reto del apex. |
| TXT | `_acme-challenge.www` | *(ídem)* | Temporal. Reto de `www`: **el nombre es distinto** (`_acme-challenge.www`, no `_acme-challenge`). |

Let's Encrypt reutiliza una validación vigente (hasta 30 días): en una reemisión cercana puede pedir solo uno de los dos. Mira siempre el nombre exacto que muestra certbot.

No toques el resto de registros de la zona. Comprueba con `dig +short A wiliamluis.com` y `dig +short A www.wiliamluis.com`.
