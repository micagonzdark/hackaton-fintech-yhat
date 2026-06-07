# Guía de slides basada en el PDF actual

Duración objetivo: **4 minutos**, incluyendo una demo breve.

Esta estructura conserva las siete slides, el orden y el estilo general del PDF `FlowRent.pdf`. Los cambios propuestos corrigen inconsistencias conceptuales y problemas de legibilidad sin reconstruir la presentación desde cero.

## Criterio general

La presentación debe mantener esta historia:

```text
FlowRent es un producto general para comercios estacionales.
Airbnb es el caso inicial utilizado para construir y demostrar el MVP.
```

No hace falta agregar una slide exclusiva sobre Airbnb. La transición puede explicarse brevemente entre las slides 2 y 3:

> Para demostrar esta oportunidad empezamos por un caso especialmente claro: anfitriones de destinos turísticos, donde la estacionalidad es marcada, existen reservas futuras visibles y la plataforma procesa los cobros.

## Slide 1 — FlowRent

### Mantener

- El diseño actual con imagen a la izquierda y definición a la derecha.
- El título `FlowRent`.
- La definición general del producto.

### Texto recomendado

> **Infraestructura de adelantos embebidos para comercios con ingresos estacionales que operan dentro de plataformas digitales.**

> Convertimos datos que una plataforma ya tiene en adelantos responsables que se recuperan dentro del mismo flujo de cobros.

Cambiar `payouts` por `cobros` permite que la definición siga siendo general.

### Ajuste visual mínimo

La imagen de la propiedad puede mantenerse porque representa el primer caso del MVP. Agregar una pequeña etiqueta sobre la imagen:

```text
Primer caso de uso: alquiler turístico
```

Esto evita que la audiencia interprete que FlowRent sirve únicamente para propiedades.

## Slide 2 — El Problema

### Mantener

- El título `El Problema`.
- La distribución actual de tres bloques.
- La imagen vinculada al turismo como introducción al caso inicial.

### Bloques recomendados

#### La brecha de caja

> Los gastos llegan antes de la temporada; los ingresos fuertes llegan después.

#### Datos sin usar

> Historial, estacionalidad, reputación y actividad futura ya existen dentro de las plataformas, pero todavía no se convierten en ofertas financieras adaptadas.

#### Impacto en la plataforma

> La falta de liquidez limita inversión, calidad y actividad de los comercios, reduciendo también el valor generado dentro de la plataforma.

### Corrección visual necesaria

El título `Impacto en la plataforma` actualmente se superpone con el texto. Dar mayor altura al bloque inferior o reducir ligeramente el tamaño del título.

### Transición oral hacia Airbnb

Al terminar esta slide:

> Para construir el MVP elegimos Airbnb como caso inicial porque los hosts turísticos tienen ciclos muy visibles, reservas futuras y recuperación posible mediante payouts.

## Slide 3 — Actores y Propuesta de Valor

Cambiar solamente el título de `Usuarios y Propuesta de Valor` a:

> **Actores y Propuesta de Valor**

Esto permite incluir a quien aporta el capital sin cambiar el formato de tres columnas.

### Columna 1 — Comercio estacional

> Obtiene capital antes de la temporada y lo recupera mediante sus próximos cobros, sin cuotas fijas desconectadas de su actividad.

En la explicación oral se aclara que, para el caso Airbnb, este comercio es el anfitrión.

### Columna 2 — Plataforma

> Mejora retención, actividad y calidad de su oferta utilizando datos y cobros que ya administra.

### Columna 3 — FlowRent + inversor de cartera

> FlowRent opera el modelo y la infraestructura. Inversores de cartera fondean los adelantos y reciben el rendimiento acordado.

### Corrección conceptual necesaria

Eliminar:

> Nosotros aportamos el modelo, la infraestructura y el capital.

Esa frase mezcla el rol tecnológico de FlowRent con el capital utilizado para los adelantos.

### Explicación oral breve

> El capital de la empresa y el de los adelantos son distintos. Un VC puede invertir en FlowRent; un fondo de deuda, vehículo o inversores profesionales pueden financiar la cartera.

## Slide 4 — Producto MVP: Flujo y Tres Superficies

Modificar mínimamente el título actual:

> **Producto MVP: Flujo y Tres Superficies**

Esto resuelve la confusión entre las cuatro etapas superiores y las tres superficies inferiores.

### Mantener el flujo superior

```text
Solicitud
Host solicita adelanto

Evaluación
Reglas duras, score y PD proxy

Cálculo
P10, retención y monto recomendado

Desembolso y recuperación
Host acepta; próximos payouts retienen un porcentaje
```

### Mantener las tres superficies inferiores

#### Experiencia Host

> Monto disponible, fee, retención, reservas visibles y consentimiento.

#### Consola de Riesgo

> Score, PD proxy, stress de temporada, unit economics y sensibilidad.

#### Simulador Reproducible

> Python + SQLite verifican que UI, documentación y casos base respondan a las mismas reglas.

### Correcciones visuales necesarias

- Evitar la superposición del título y texto en `Simulador Reproducible`.
- Aumentar ligeramente la altura de las tres tarjetas inferiores.
- Mantener visible la aclaración de que los datos son sintéticos.

### Mensaje oral

> Aunque FlowRent es general, el MVP utiliza hosts, reservas y payouts porque Airbnb es el primer caso demostrativo.

## Slide 5 — Casos de Demo

### Mantener

- Los tres casos actuales.
- Los números mostrados.
- El formato de aprobado, stress y rechazo.

### Textos recomendados

#### Martín, Mar del Plata — Caso ideal

> Score 75,4 · PD proxy 5,98% · Adelanto USD 1.500 · Fee 5% · Retención 35%.

#### Stress −30% — Aprobación parcial

> El adelanto baja y pasa a aprobación parcial. El sistema reduce la oferta cuando empeora el escenario.

#### Nicolás, Villa Gesell — Rechazo explicable

> Score 38,8 · PD proxy 45% · Habilitación pendiente · Oferta ARS 0.

### Ajuste visual recomendado

El espacio vacío de la izquierda puede usarse para colocar una captura grande de la oferta de Martín. Si se realizará la demo en vivo, puede mantenerse vacío y usarse esta slide como respaldo.

### Mensaje oral

> El modelo no busca aprobar siempre. Busca ofrecer un monto responsable y explicar cuándo debe reducirlo o rechazarlo.

## Slide 6 — Métricas de la Cartera Demo

### Mantener

- La slide y sus cuatro métricas.
- La aclaración explícita de que es una cartera demo.

### Métricas recomendadas

```text
6
Hosts analizados
5 con oferta positiva

ARS 6,1M
Capital recomendado

4,9%
PD proxy ponderada

3,2 meses
Plazo promedio estimado
```

Cambiar `5 con oferta aprobada` por `5 con oferta positiva`, porque la cartera incluye distintos tipos de decisión.

### Texto inferior recomendado

> Bajo supuestos exigentes, la cartera demo queda cerca del equilibrio. El piloto debe validar costo de fondeo, recuperación real, pérdidas y pricing.

Este texto es más prudente que afirmar directamente que el producto funciona.

### Correcciones visuales necesarias

- Separar `Capital recomendado` de `ARS 6.111.669 en total`; actualmente se superponen.
- Usar `ARS 6,1M` en lugar de `6.1M` para mantener consistencia de idioma y moneda.
- Aclarar oralmente que son seis casos sintéticos y no evidencia estadística.

## Slide 7 — Roadmap y Pedido

### Mantener

- El título, la estructura de tres etapas y la ubicación del pedido final.
- La secuencia `Hackathon → Piloto → Escala`.

### Textos recomendados

#### Hackathon

> Flujo host, consola de riesgo, seis casos sintéticos, stress testing y unit economics.

#### Piloto

> Plataforma inicial, estructura de fondeo, contratos, KYC y adelantos conservadores sobre cobros confirmados.

#### Escala

> PD calibrada, forecast P10/P50/P90, pricing optimizado e integración con nuevas plataformas.

### Pedido final recomendado

> Buscamos una plataforma para ejecutar un piloto controlado y una estructura de fondeo para financiar una primera cartera sobre cobros confirmados.

Esto reemplaza `partner financiero`, que es ambiguo y puede interpretarse únicamente como un banco.

### Cierre oral

> Empezamos con Airbnb porque permite demostrar el modelo con ciclos y cobros visibles. Después, la misma infraestructura puede integrarse en otras plataformas con comercios estacionales.

> No financiamos a pesar de la estacionalidad. Financiamos entendiéndola.

## Distribución del tiempo

1. Slide 1: `0:20`.
2. Slide 2: `0:35`.
3. Slide 3: `0:35`.
4. Slide 4: `0:35`.
5. Demo o slide 5: `1:10`.
6. Slide 6: `0:25`.
7. Slide 7: `0:20`.

## Cambios prioritarios antes de presentar

1. Eliminar `Nosotros aportamos ... el capital` de la slide 3.
2. Cambiar el pedido de `partner financiero` por `estructura de fondeo`.
3. Incorporar oralmente por qué Airbnb es el caso inicial.
4. Corregir las superposiciones de texto en las slides 2, 4 y 6.
5. Cambiar `payouts` por `cobros` solamente en la definición general de la slide 1.
