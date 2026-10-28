# DNS de wiliamluis.com

En el gestor de dominios, zona `wiliamluis.com`:

| Tipo | Host | Valor | Notas |
|---|---|---|---|
| A | `@` | `<IP_DEL_BORDE>` | La IP pública del proxy que recibe el 443. |
| A | `www` | `<IP_DEL_BORDE>` | Igual. |
| TXT | `_acme-challenge` | *(lo indica certbot en cada emisión/renovación)* | Temporal. Con DNS-01 manual hay uno por nombre (apex y `www`); pueden convivir. |

No toques el resto de registros de la zona. Comprueba con `dig +short A wiliamluis.com` y `dig +short A www.wiliamluis.com`.
