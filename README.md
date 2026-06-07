# FlowRent · Hackathon Fintech 2026

> Adelantos embebidos para negocios estacionales dentro de plataformas digitales.

## Ver el MVP

| | |
| --- | --- |
| 📊 **Consola de Riesgo** | [Ver demo →][LINK_DASHBOARD] |
| 🏠 **Vista del Anfitrión** | [Ver demo →][LINK_HOST] |

---

## Problema

Los negocios estacionales necesitan capital antes del pico de ingresos, pero los bancos los rechazan porque no entienden sus ciclos. Las plataformas donde operan (Airbnb, Rappi, Mercado Libre) ya tienen todos los datos para evaluar ese riesgo, e infraestructura para retener cobros futuros.

FlowRent convierte esa ventaja en adelantos responsables, recuperados directamente sobre los pagos que la plataforma ya procesa.

## Cómo funciona

1. La plataforma comparte datos operativos del usuario: historial de ingresos, reservas futuras, reputación y control de cobros.
2. FlowRent construye un score de crédito embebido con seis dimensiones y genera una oferta personalizada.
3. El usuario acepta desde la app de la plataforma. La recuperación ocurre como una retención automática y transparente sobre cada cobro futuro.

El caso piloto es Airbnb: ciclos marcados, reservas visibles, cobros procesados por la plataforma.

## Stack

HTML, CSS y JavaScript vanilla · SQLite · Python 3.11

Sin frameworks ni servidor. Los datos son sintéticos (6 perfiles demo).

## Correr localmente

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

- Vista anfitrión: `http://127.0.0.1:4173/frontend/host.html`
- Consola de riesgo: `http://127.0.0.1:4173/frontend/index.html`



## Documentación

- [Modelo de negocio y MVP](docs/MVP_HACKATHON.md)
- [Modelo de scoring](docs/modelo_hibrido.md)
- [Marco legal](docs/legal_framework.md)
- [Guion cronometrado de demo](docs/guion_demo_hackathon.md)

---

*Datos ficticios. Sin transferencia de fondos, KYC ni retención real.*

[LINK_DASHBOARD]: https://micagonzdark.github.io/hackaton-fintech-yhat/frontend/index.html
[LINK_HOST]: https://bnb-hat.netlify.app/
