# FlowRent · Hackathon Fintech 2026

## Propuesta

FlowRent es infraestructura de adelantos embebidos para comercios con ingresos estacionales que operan dentro de plataformas digitales. Utiliza los datos operativos y el flujo de cobros de cada plataforma para estimar cuánto ingreso futuro puede adelantarse responsablemente y recuperarse mediante una retención transparente.

El MVP usa Airbnb como caso ideal inicial: los anfitriones turísticos suelen tener ciclos marcados, reservas futuras visibles y cobros procesados dentro de la plataforma. El producto, sin embargo, está pensado para integrarse también en plataformas de comercio, turismo, servicios, educación y eventos.

## Problema que resuelve

Los negocios estacionales no son necesariamente impredecibles: operan con ciclos que pueden entenderse. FlowRent permite que una plataforma convierta sus datos operativos en ofertas adaptadas al momento y la capacidad de cada negocio.

## Equipo

| Nombre | Rol |
|--------|-----|
| -      | -   |

## MVP construido

- Vista host con oferta, fee, total, retención, motivos y consentimiento simulado.
- Consola de riesgo con score, PD proxy, P10, stress y cobertura visible.
- Cartera demo con unit economics y sensibilidad.
- Simulador CLI y base SQLite reproducibles.
- Documentación técnica, legal y guion de presentación.

## Arquitectura

```
proyecto/
├── frontend/    # UI
├── backend/     # API / lógica de negocio
├── docs/        # Documentación, diagramas, pitch
└── scripts/     # Scripts de setup o utilidades
```

## Requisitos

- Python >= 3.11
- SQLite CLI para regenerar la base

## Demo local

Regenerar la base SQLite:

```bash
./scripts/build_demo_db.sh
```

Usar el simulador por terminal:

```bash
./scripts/simulate_credit.py list
./scripts/simulate_credit.py show H002
./scripts/simulate_credit.py simulate H002 --season-drop 30 --requested 1500000
```

Levantar la UI:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Abrir experiencia host:

```text
http://127.0.0.1:4173/frontend/host.html
```

Abrir consola de riesgo:

```text
http://127.0.0.1:4173/frontend/index.html
```

## Demo recomendada

1. Mostrar la oferta de Martín en la vista host.
2. Simular consentimiento y aceptación.
3. Abrir la consola de riesgo.
4. Usar el botón `2 · Temporada −30%`.
5. Usar el botón `3 · Rechazo explicable`.
6. Cerrar con cartera y sensibilidad.

## Documentación clave

- [Guía simple para entender el modelo](docs/guia_modelo_para_pitch.md)
- [MVP integral para hackathon](docs/MVP_HACKATHON.md)
- [Pitch final de 4 minutos](docs/pitch_4_minutos_final.md)
- [Guion cronometrado de demo](docs/guion_demo_hackathon.md)
- [Guía para armar los slides manualmente](docs/guia_slides_manual.md)
- [Especificación del modelo híbrido](docs/modelo_hibrido.md)
- [Documento técnico híbrido v2.0](docs/Sistema_Modelos_Predictivos_Hibrido_v2.docx)
- [Detalle técnico del modelo de datos y scoring](docs/data_model.md)
- [Marco legal y reformulación como adelanto de cobros futuros](docs/legal_framework.md)

## Limitaciones honestas

- Datos completamente ficticios.
- PD proxy y P10 precargado, no modelos calibrados.
- Sin transferencia de fondos, KYC ni retención real.
- La estructura de fondeo, contratos y operación requiere validación legal por jurisdicción.
