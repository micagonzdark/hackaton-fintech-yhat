# Hackathon Fintech 2026

## Descripción

> Completar con la descripción del proyecto.

## Problema que resuelve

> Completar con el problema y la solución propuesta.

## Equipo

| Nombre | Rol |
|--------|-----|
| -      | -   |

## Arquitectura

```
proyecto/
├── frontend/    # UI
├── backend/     # API / lógica de negocio
├── docs/        # Documentación, diagramas, pitch
└── scripts/     # Scripts de setup o utilidades
```

## Requisitos previos

- Node.js >= 18 / Python >= 3.11 (según el stack elegido)
- Git

## Setup rápido

```bash
# Clonar el repo
git clone <url>
cd 06_Hackaton

# Copiar variables de entorno
cp .env.example .env
# Editar .env con los valores correspondientes

# Ver carpetas de frontend y backend para instrucciones específicas
```

## Demo local

Regenerar la base SQLite:

```bash
./scripts/build_demo_db.sh
```

Usar el simulador por terminal:

```bash
./scripts/simulate_credit.py list
./scripts/simulate_credit.py show H001
./scripts/simulate_credit.py simulate H001 --season-drop 30 --requested 2800000
```

Levantar la UI:

```bash
python3 -m http.server 4173
```

Abrir:

```text
http://127.0.0.1:4173/frontend/
```

## Variables de entorno

Ver [.env.example](.env.example).

## Links útiles

- Documentación del hackathon: -
- Figma / Diseño: -
- Deploy / Demo: -
