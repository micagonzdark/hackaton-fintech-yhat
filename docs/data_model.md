# Base de datos MVP: adelanto estacional para anfitriones

## Idea central

El producto ofrece un adelanto opt-in sobre cobros futuros a anfitriones de alquiler temporario usando datos que una plataforma tipo Airbnb ya conoce: historial, reputación, propiedad, ingresos, reservas futuras y riesgo del destino.

El score se explica por clusters:

```text
Score final =
15% Solidez del host +
15% Calidad de la propiedad +
25% Historial de ingresos +
15% Reputación y operación +
20% Reservas futuras +
10% Riesgo del mercado
```

El monto no sale solo del score. El monto sale de la capacidad de recuperación por payouts:

```text
Tope de adelanto =
min(
  brecha de caja del host,
  ingreso futuro conservador x porcentaje retenible,
  límite de política de riesgo
)
```

La frase de pitch:

> No pedimos que Airbnb sea banco. Adelantamos una parte conservadora de cobros futuros que la plataforma puede observar y recuperar mediante retención transparente de próximos payouts.

## Marco legal y reformulación de producto

La versión "Airbnb presta plata" es frágil para pitch: Airbnb no es banco y una oferta habitual de crédito puede activar obligaciones regulatorias. Por eso la narrativa recomendada es **adelanto de cobros futuros**, no préstamo abierto.

Principios de diseño:

- El host opta dentro de la app y autoriza uso de datos, adelanto y retención de payouts.
- El producto se recupera por compensación de futuros cobros dentro de la plataforma.
- Para el MVP más defendible, priorizar reservas confirmadas y cobradas o altamente aseguradas.
- Para montos mayores o adelantos sobre ingresos no confirmados, usar un partner regulado o validar registro propio como proveedor no financiero de crédito.

Ver análisis completo en [`docs/legal_framework.md`](legal_framework.md).

## Archivos creados

- `backend/schema.sql`: esquema relacional SQLite-compatible con inserts de demo.
- `backend/seed/demo_credit_data.json`: dataset agregado listo para consumir desde frontend.

## Tablas principales

### `cluster_weights`

Define el peso de cada cluster del score.

### `variable_weights`

Define las variables internas de cada cluster y sus pesos.

Ejemplo: dentro de `Solidez del host`, la antigüedad pesa 30%, las reservas completadas 25%, las verificaciones 15%, etc.

### `markets`

Modela riesgo del destino:

- tipo de destino
- meses de temporada alta
- estacionalidad
- demanda
- crecimiento de oferta
- riesgo climático
- riesgo regulatorio

### `hosts`

Modela al anfitrión:

- antigüedad
- reservas completadas
- verificaciones
- adelantos previos
- alertas de fraude
- cantidad de propiedades activas

### `listings`

Modela la propiedad:

- tipo de inmueble
- capacidad
- amenities
- calidad del listing
- habilitación legal
- disponibilidad de calendario
- precio relativo al mercado

### `host_monthly_revenue`

Modela ingresos mensuales históricos:

- ingreso bruto
- ingreso neto
- noches reservadas
- noches disponibles
- tarifa promedio por noche

### `future_bookings`

Modela reservas futuras observables:

- fecha de check-in
- fecha de payout
- valor bruto
- riesgo de cancelación

### `host_cluster_scores`

Guarda el score de cada host por cluster y una explicación humana.

### `credit_offers`

Guarda la decisión final del adelanto:

- aprobado, rechazado o línea piloto
- score final
- monto máximo
- monto recomendado
- fee
- porcentaje de retención
- stress test
- razón principal

## Perfiles de demo

| Host | Ciudad | Caso | Decisión |
|---|---|---|---|
| H001 | Bariloche | Host histórica de montaña, alta reputación, reservas fuertes de invierno | Aprobado alto |
| H002 | Mar del Plata | Host costero, verano fuerte, baja muy marcada | Aprobado medio |
| H003 | Mendoza | Ingresos más estables, menor necesidad de smoothing | Aprobado medio-bajo |
| H004 | Villa Gesell | Host nuevo, poca evidencia, permiso pendiente | Rechazado |
| H005 | Buenos Aires | Host excelente, ingresos urbanos estables | Aprobado chico |
| H006 | Ushuaia | Potencial alto, riesgo climático y volatilidad | Línea piloto |

## Historias para mostrar en el pitch

### 1. El mejor caso

Lucía, Bariloche:

- 8.7 años en plataforma
- 486 reservas completadas
- rating 4.92
- temporada de invierno fuerte
- reservas futuras confirmadas

Resultado:

- score 89
- monto recomendado: ARS 2.500.000
- retención: 28% de payouts futuros
- stress test -30%: recuperación probable

### 2. El caso rechazado

Nicolás, Villa Gesell:

- menos de 1 año de historial
- 19 reservas completadas
- permiso pendiente
- cancelaciones altas
- pocas reservas futuras

Resultado:

- score 38.8
- decisión: rechazado

### 3. El insight de producto

Valentina, Buenos Aires, tiene muy buen score, pero recibe un adelanto menor porque su problema no es estacional. Esto muestra que el producto no solo pregunta "quién es confiable", sino también "quién necesita estabilización de ingresos".

## Consultas SQL útiles

Ranking de adelantos:

```sql
SELECT
  h.display_name,
  h.city,
  o.final_score,
  o.decision,
  o.recommended_advance_ars,
  o.holdback_pct,
  o.stress_down_30
FROM credit_offers o
JOIN hosts h ON h.host_id = o.host_id
ORDER BY o.final_score DESC;
```

Scores por cluster de un host:

```sql
SELECT
  h.display_name,
  cw.display_name AS cluster,
  hcs.score,
  hcs.explanation
FROM host_cluster_scores hcs
JOIN hosts h ON h.host_id = hcs.host_id
JOIN cluster_weights cw ON cw.cluster_key = hcs.cluster_key
WHERE h.host_id = 'H001'
ORDER BY cw.weight_pct DESC;
```

Ingresos mensuales para graficar:

```sql
SELECT month, gross_revenue_ars, booked_nights, available_nights
FROM host_monthly_revenue
WHERE host_id = 'H001'
ORDER BY month;
```

Reservas futuras:

```sql
SELECT checkin_date, checkout_date, payout_date, gross_value_ars, cancellation_risk_pct
FROM future_bookings
WHERE host_id = 'H001'
ORDER BY checkin_date;
```

## Siguiente paso sugerido

Para la demo visual, usar `backend/seed/demo_credit_data.json` y construir:

1. selector de host
2. curva de ingresos históricos
3. barras de score por cluster
4. oferta de adelanto
5. stress test de temporada

## Métricas para el pitch

Además de mostrar decisiones individuales, conviene mostrar métricas agregadas de cartera. Esto ayuda a responder si el producto es financieramente viable, no solo si el score "parece bueno".

Sobre las ofertas base del dataset:

```text
Hosts analizados: 6
Hosts con oferta positiva: 5
Hosts rechazados: 1
Capital recomendado: ARS 5.270.000
Fee esperado: ARS 625.600
Fee promedio ponderado: 11,9%
Plazo promedio estimado: 3,2 meses
Advance / ingreso futuro P10: 18-19%
```

La métrica clave es:

```text
Advance / P10 futuro
```

Esta métrica responde cuánto estamos adelantando contra el escenario conservador de ingresos futuros. En el piloto simulado está por debajo del 20%, lo que permite defender que el producto no presta contra un escenario optimista.

Otra métrica útil es:

```text
Cobertura visible con reservas futuras
```

Indica qué porcentaje de la recuperación está respaldado por reservas ya confirmadas. Si no cubre 100%, no significa que el adelanto sea inválido: significa que el resto de la recuperación depende del flujo futuro estimado por P10, historial y control de payouts.

## Unit economics

La contribución esperada de cada adelanto se modela así:

```text
contribución =
  ingreso por fee
  - costo de fondeo
  - pérdida esperada
  - costo operativo
```

Donde:

```text
ingreso por fee = principal * fee
costo de fondeo = principal * costo_fondeo_anual * meses / 12
pérdida esperada = principal * PD * LGD
costo operativo = principal * costo_operativo
```

Definiciones:

```text
PD = probabilidad de default
LGD = pérdida dado default
```

La conclusión de negocio es importante:

> El scoring reduce riesgo, pero el margen depende de tres palancas: fondeo barato, plazo corto de recuperación y retención automática sobre payouts.

Por eso la demo incluye supuestos editables:

- costo de fondeo anual
- probabilidad de default
- pérdida dado default
- costo operativo

También incluye sensibilidad en tres escenarios:

```text
Optimista: fondeo bajo, PD baja, LGD baja
Base: supuestos elegidos por el usuario
Stress: fondeo alto, PD alta, LGD alta
```

Esta sección es útil para explicar que el producto puede ser viable como infraestructura B2B si trabaja con una plataforma o partner financiero que tenga bajo costo de capital y control del flujo de cobro.

## Detalle técnico del motor de decisión

El motor separa dos preguntas que suelen mezclarse:

```text
1. ¿Debemos adelantarle cobros?
2. ¿Cuánto flujo futuro podemos adelantar sin sobreexponer al host?
```

La primera pregunta se responde con el score de riesgo y reglas duras. La segunda se responde con capacidad de recuperación, ingresos futuros conservadores y porcentaje de retención sobre payouts.

Esto evita un error común: adelantar demasiado solo porque el host tiene buen rating. Un host puede ser confiable, pero si no tiene flujo futuro suficiente, la oferta debe ser chica.

## Pipeline de decisión

El flujo conceptual es:

```text
Datos plataforma
  -> normalización de variables
  -> score por cluster
  -> score final ponderado
  -> reglas duras
  -> estimación de ingreso futuro conservador
  -> cálculo de monto máximo
  -> stress test
  -> oferta final
```

En el MVP, los scores por cluster ya vienen cargados en `host_cluster_scores` y `demo_credit_data.json`. En una versión productiva, cada score de cluster se calcularía a partir de sus variables internas.

## 1. Score por cluster

Cada cluster devuelve un puntaje de 0 a 100. El puntaje representa una dimensión distinta del riesgo:

| Cluster | Peso | Qué mide | Por qué importa |
|---|---:|---|---|
| Solidez del host | 15% | Historial y confiabilidad del anfitrión | Reduce riesgo de comportamiento oportunista |
| Calidad de la propiedad | 15% | Capacidad productiva del inmueble | Un buen activo genera más flujo futuro |
| Historial de ingresos | 25% | Volumen, estabilidad y estacionalidad histórica | Es la mejor evidencia de capacidad económica |
| Reputación y operación | 15% | Rating, cancelaciones, reclamos, respuesta | Anticipa deterioro de ingresos futuros |
| Reservas futuras | 20% | Flujo observable de reservas confirmadas | Mejora recuperabilidad del adelanto |
| Riesgo del mercado | 10% | Riesgo externo del destino turístico | Ajusta por clima, regulación, demanda y competencia |

Fórmula:

```text
score_final =
  host_solidity * 0.15 +
  property_quality * 0.15 +
  income_history * 0.25 +
  reputation_ops * 0.15 +
  future_bookings * 0.20 +
  market_risk * 0.10
```

Ejemplo H001:

```text
score_final =
  96 * 0.15 +
  88 * 0.15 +
  91 * 0.25 +
  94 * 0.15 +
  86 * 0.20 +
  74 * 0.10

score_final = 89.0
```

## 2. Variables internas por cluster

### Solidez del host

```text
Antigüedad en plataforma       30%
Reservas completadas           25%
Verificaciones completas       15%
Comportamiento en plataforma   20%
Adelantos previos              10%
```

Justificación:

Un host con muchos años, muchas reservas y verificaciones completas es más predecible. Si además ya tomó adelantos y se recuperaron sin incidentes, la plataforma tiene evidencia directa de comportamiento financiero.

### Calidad de la propiedad

```text
Ubicación                      25%
Tipo y capacidad               20%
Amenities                      15%
Calidad del listing            15%
Habilitación legal             15%
Disponibilidad calendario      10%
```

Justificación:

El adelanto se recupera con ingresos futuros generados por la propiedad. Una propiedad con buena ubicación, calendario disponible y permiso vigente tiene mayor probabilidad de sostener ocupación y precio.

### Historial de ingresos

```text
Ingresos 24/36 meses           25%
Consistencia estacional        25%
Volatilidad                    20%
Ocupación histórica            15%
Precio promedio noche          10%
Tendencia                       5%
```

Justificación:

Este es el cluster más importante porque mide la capacidad económica real. No alcanza con haber facturado mucho una vez. El modelo premia patrones repetibles y penaliza volatilidad excesiva.

### Reputación y operación

```text
Rating promedio                25%
Cantidad de reviews            15%
Tendencia rating               15%
Tasa de cancelación            20%
Reembolsos y disputas          15%
Respuesta del host             10%
```

Justificación:

La reputación impacta directamente en conversión, ranking y reservas futuras. Cancelaciones y disputas elevadas son señales de riesgo operativo.

### Reservas futuras

```text
Valor confirmado               35%
Ocupación futura               20%
Fechas de payout               15%
Riesgo de cancelación          15%
Anticipación de reserva        15%
```

Justificación:

Este cluster es el diferencial frente a un banco. La plataforma observa flujo futuro y puede estimar cuánto se puede recuperar vía retención de payouts.

### Riesgo del mercado

```text
Estacionalidad destino         25%
Demanda turística              25%
Crecimiento oferta             20%
Clima y eventos                15%
Regulación local               15%
```

Justificación:

Dos hosts iguales no tienen el mismo riesgo si uno depende de nieve, otro de playa y otro de turismo urbano todo el año. El mercado ajusta el riesgo externo que el host no controla.

## 3. Reglas duras

Antes de calcular el monto, se aplican reglas excluyentes. En el MVP están simplificadas, pero sirven para explicar el criterio:

```text
score_final < 50              -> rechazado
decisión base = rejected      -> rechazado
monto recomendado = 0         -> rechazado
```

En una versión productiva agregaríamos:

```text
fraude detectado              -> rechazado
cuenta suspendida             -> rechazado
identidad no verificada       -> rechazado o revisión
permiso legal faltante        -> rechazado o revisión
sin control de payouts        -> límite muy bajo
cancelación extrema           -> rechazado o línea piloto
historial insuficiente        -> línea piloto
```

La razón es que algunas condiciones no se arreglan con un buen promedio de ingresos. Si hay fraude, suspensión o imposibilidad de cobrar desde payouts, el riesgo cambia de naturaleza.

## 4. Estimación de ingreso futuro conservador

El modelo usa `expected_future_revenue_p10_ars`.

P10 significa: un escenario conservador donde esperamos que el host genere al menos ese ingreso con alta probabilidad. No es el promedio, ni el mejor caso.

Conceptualmente:

```text
P50 = escenario medio
P90 = escenario optimista
P10 = escenario conservador
```

Para adelantos, el MVP usa P10 porque queremos responder:

> Si la temporada sale peor que lo normal, ¿todavía podemos recuperar el adelanto sin salir a cobrar por fuera de la plataforma?

En la UI y el simulador se puede aplicar una caída adicional:

```text
ingreso_futuro_ajustado =
  expected_future_revenue_p10 * (1 - caida_temporada_pct)
```

Ejemplo:

```text
P10 futuro = ARS 11.800.000
caída temporada = 30%

ingreso ajustado = 11.800.000 * 0.70
ingreso ajustado = ARS 8.260.000
```

## 5. Cálculo del monto máximo

La fórmula del MVP es:

```text
monto_maximo =
  ingreso_futuro_ajustado * retencion_pct / (1 + fee_pct)
```

Donde:

```text
ingreso_futuro_ajustado = P10 futuro después de stress
retencion_pct = porcentaje de payouts que la plataforma puede retener
fee_pct = costo total del adelanto
```

La división por `(1 + fee_pct)` evita adelantar un principal que después no se pueda recuperar cuando se suma el costo.

Ejemplo H001, temporada normal:

```text
P10 futuro = ARS 11.800.000
retención = 28%
fee = 10%

monto_maximo = 11.800.000 * 0.28 / 1.10
monto_maximo = ARS 3.003.636
```

Si el host pide ARS 2.800.000:

```text
monto_recomendado = min(monto_pedido, monto_maximo)
monto_recomendado = ARS 2.800.000
```

Ejemplo H001, temporada -30%:

```text
P10 ajustado = 11.800.000 * 0.70 = ARS 8.260.000
retención = 28%
fee = 10%

monto_maximo = 8.260.000 * 0.28 / 1.10
monto_maximo = ARS 2.102.545
```

Si pide ARS 2.800.000:

```text
monto_recomendado = ARS 2.102.545
decisión = aprobación parcial
```

## 6. Decisión aceptado/rechazado

Luego del score y del monto máximo, el MVP clasifica la decisión así:

```text
score < 50
  -> rechazado

monto_recomendado >= 95% del monto solicitado
  -> aprobado

monto_recomendado >= 45% del monto solicitado
  -> aprobación parcial

monto_recomendado > 0
  -> línea piloto

caso contrario
  -> rechazado
```

Interpretación:

- `aprobado`: el modelo puede cubrir casi todo lo que pidió el host.
- `aprobación parcial`: el host es viable, pero el pedido es demasiado alto para el escenario conservador.
- `línea piloto`: hay algo de capacidad de recuperación, pero el riesgo pide un monto chico.
- `rechazado`: el score o la recuperabilidad no alcanzan.

## 7. Recuperación visible con reservas futuras

Además del monto máximo basado en P10, la demo calcula cuánto se podría cobrar usando solo reservas futuras ya visibles.

Para cada reserva:

```text
reserva_ajustada =
  valor_reserva *
  (1 - riesgo_cancelacion_pct) *
  (1 - caida_temporada_pct)
```

Luego:

```text
cobro_retenible =
  reserva_ajustada * retencion_pct
```

Y el objetivo de recuperación es:

```text
objetivo_recuperacion =
  monto_recomendado * (1 + fee_pct)
```

Si la suma de cobros retenibles visibles supera el objetivo, la recuperación está cubierta con reservas ya confirmadas. Si no, el modelo asume que se requerirá flujo adicional futuro no confirmado.

Esto es importante para el pitch:

> El adelanto no depende solo de reservas futuras confirmadas. Las reservas confirmadas son la parte más segura de la recuperación. El resto se respalda con historial, P10 y control de payouts.

## 8. Stress testing

El stress test contesta:

```text
¿Qué pasa si la temporada cae 30% o 50%?
```

La UI permite mover `Caída de temporada`. Al subirlo, baja el ingreso futuro ajustado, baja el monto máximo y puede cambiar la decisión.

Ejemplo H002, Mar del Plata:

```text
score = 75.4
P10 futuro = ARS 5.200.000
retención = 32%
fee = 14%
monto pedido = ARS 1.800.000
```

Temporada -50%:

```text
P10 ajustado = 5.200.000 * 0.50
P10 ajustado = ARS 2.600.000

monto_maximo = 2.600.000 * 0.32 / 1.14
monto_maximo = ARS 729.825
```

Como ARS 729.825 es menos del 45% de ARS 1.800.000, la decisión baja a `línea piloto`.

## 9. Por qué dos buenos hosts reciben montos distintos

El score decide riesgo, pero el monto decide capacidad.

Ejemplo:

```text
H001 Bariloche:
score alto + alta necesidad estacional + reservas fuertes -> monto alto

H005 Buenos Aires:
score bueno + ingresos estables + menor estacionalidad -> monto chico
```

Esto es defendible porque el producto no busca simplemente premiar buenos hosts. Busca estabilizar ingresos estacionales sin sobreexponer al host ni convertir la plataforma en prestamista abierto.

## 10. Cómo justificar un rechazo

Caso H004:

```text
score = 38.8
antigüedad = 0.8 años
reservas completadas = 19
permiso = pendiente
cancelación = alta
reservas futuras = pocas
```

Decisión:

```text
score < 50 -> rechazado
```

Aunque tenga una reserva futura, el historial no alcanza para convertir ese flujo en adelanto responsable. En una versión real, podría recibir una línea piloto después de más reservas, permiso validado o mejora de reputación.

## 11. Pseudocódigo de `ofrecer_adelanto`

```python
def ofrecer_adelanto(host, monto_solicitado, caida_temporada_pct):
    score = (
        host.host_solidity * 0.15 +
        host.property_quality * 0.15 +
        host.income_history * 0.25 +
        host.reputation_ops * 0.15 +
        host.future_bookings * 0.20 +
        host.market_risk * 0.10
    )

    if score < 50 or host.tiene_regla_excluyente:
        return rechazar(score)

    ingreso_ajustado = host.expected_future_revenue_p10 * (1 - caida_temporada_pct)

    monto_maximo = (
        ingreso_ajustado *
        host.holdback_pct /
        (1 + host.fee_pct)
    )

    monto_recomendado = min(monto_solicitado, monto_maximo)

    if monto_recomendado >= monto_solicitado * 0.95:
        decision = "aprobado"
    elif monto_recomendado >= monto_solicitado * 0.45:
        decision = "aprobación parcial"
    elif monto_recomendado > 0:
        decision = "línea piloto"
    else:
        decision = "rechazado"

    return {
        "decision": decision,
        "score": score,
        "monto_maximo": monto_maximo,
        "monto_recomendado": monto_recomendado,
    }
```

Nota: en el código real del MVP, `holdback_pct` y `fee_pct` se expresan como porcentajes, por eso se dividen por 100 antes de operar.

## 12. Limitaciones del MVP

El MVP simplifica varias cosas:

- Los scores por cluster están precalculados.
- No se recalculan automáticamente las variables internas.
- El ingreso P10 es un dato cargado, no estimado por modelo estadístico.
- No hay costo de fondeo ni pérdida esperada por mora.
- No hay implementación de KYC, contratos, reporting regulatorio ni contabilidad.
- La recuperación se estima solo con reservas visibles y P10 futuro.

Estas simplificaciones son razonables para hackathon porque el objetivo es demostrar la lógica de underwriting y la propuesta de valor. En una versión productiva, el siguiente paso sería estimar P10/P50/P90 con series históricas reales, medir performance de recuperación y calibrar thresholds con datos.
