# Guía simple para entender el modelo

Esta guía está pensada para explicar Renta Estable sin asumir conocimientos de economía o finanzas. La idea es que puedas mirar la demo, entender qué está calculando y defender el modelo en un pitch.

## Resumen en un minuto

Renta Estable no propone que Airbnb se convierta en banco. Propone un **adelanto opt-in de cobros futuros** para anfitriones de alquiler temporario.

El host tiene un problema simple:

```text
gasta todo el año,
pero cobra mucho en temporada alta
y poco en temporada baja.
```

El producto suaviza ese ingreso:

```text
la plataforma adelanta una parte conservadora de futuros cobros
y después recupera ese adelanto reteniendo una parte de próximos payouts.
```

El modelo responde tres preguntas:

```text
1. ¿Este host es suficientemente confiable?
2. ¿Cuánto flujo futuro se puede adelantar sin pasarse de riesgo?
3. ¿La operación deja margen bajo supuestos razonables?
```

## La idea más importante

Hay que separar dos cosas:

```text
Score = qué tan confiable y predecible es el host.
Monto = cuánto se puede recuperar con ingresos futuros.
```

Un host puede tener muy buen score y recibir un monto chico si no tiene estacionalidad fuerte o si no tiene suficiente flujo futuro. También puede pedir mucho dinero y recibir sólo una aprobación parcial.

La frase para recordar:

> El score decide si conviene ofrecer. El flujo futuro decide cuánto conviene ofrecer.

## Cómo funciona el score

El score final va de 0 a 100. Se calcula combinando seis clusters:

| Cluster | Peso | Pregunta que responde |
|---|---:|---|
| Solidez del host | 15% | ¿Hace cuánto opera y qué tan verificable es? |
| Calidad de la propiedad | 15% | ¿El inmueble puede generar ingresos sostenibles? |
| Historial de ingresos | 25% | ¿Tiene ingresos repetibles y predecibles? |
| Reputación y operación | 15% | ¿Cancela poco, responde bien y mantiene buena reputación? |
| Reservas futuras | 20% | ¿Ya hay cobros futuros visibles? |
| Riesgo del mercado | 10% | ¿El destino depende de clima, regulación o demanda muy volátil? |

Fórmula:

```text
score_final =
  Solidez del host * 0.15 +
  Calidad de la propiedad * 0.15 +
  Historial de ingresos * 0.25 +
  Reputación y operación * 0.15 +
  Reservas futuras * 0.20 +
  Riesgo del mercado * 0.10
```

Interpretación rápida:

```text
85 o más      riesgo bajo
75 a 84       riesgo medio bajo
65 a 74       riesgo medio
50 a 64       riesgo medio alto
menos de 50   riesgo alto
```

En el MVP, si el score es menor a 50, se rechaza.

## Por qué los clusters tienen esos pesos

El mayor peso lo tiene **Historial de ingresos** porque es la mejor evidencia de capacidad económica real. No alcanza con que el host sea simpático o tenga buen rating: tiene que haber generado ingresos de forma repetible.

El segundo peso más alto lo tiene **Reservas futuras** porque es la ventaja diferencial de una plataforma tipo Airbnb. Un banco no ve con el mismo detalle reservas, cancelaciones, fechas de cobro y reputación operativa.

Los otros clusters ayudan a evitar errores:

- Solidez del host: reduce riesgo de fraude o comportamiento oportunista.
- Calidad de la propiedad: estima si el activo puede seguir generando ingresos.
- Reputación y operación: anticipa cancelaciones, reclamos y deterioro del ranking.
- Riesgo del mercado: ajusta por destinos de playa, montaña, nieve, regulación o clima.

## Cómo se calcula el monto

El monto no sale directamente del score. Sale de una fórmula de recuperabilidad:

```text
monto_máximo =
  ingreso_futuro_ajustado * retención / (1 + fee)
```

Donde:

```text
ingreso_futuro_ajustado = ingreso futuro P10 después del stress de temporada
retención = porcentaje de futuros cobros que la plataforma puede retener
fee = costo total que paga el host por el adelanto
```

En la fórmula, los porcentajes se usan como decimales:

```text
28% de retención = 0.28
10% de fee = 0.10
```

Después:

```text
monto_recomendado = min(monto_solicitado, monto_máximo)
```

Esto significa que el modelo nunca ofrece más de lo que cree recuperable en un escenario conservador.

## Qué es P10

P10 es una estimación conservadora de ingresos futuros.

Una forma simple de pensarlo:

```text
P50 = escenario típico o medio
P90 = escenario optimista
P10 = escenario conservador
```

Usamos P10 porque la pregunta no es:

```text
¿Cuánto podría ganar el host si todo sale bien?
```

La pregunta correcta es:

```text
Si la temporada sale peor que lo normal, ¿todavía podemos recuperar el adelanto?
```

Por eso la demo permite mover la **caída de temporada**. Si ponés 30%, el modelo reduce el ingreso futuro estimado y recalcula el monto.

## Cómo se decide aprobado, parcial, piloto o rechazado

El MVP usa estas reglas:

```text
score < 50
  -> rechazado

monto_recomendado >= 95% del monto solicitado
  -> aprobado

monto_recomendado >= 45% del monto solicitado
  -> aprobación parcial

monto_recomendado > 0
  -> línea piloto

si no hay monto recuperable
  -> rechazado
```

Interpretación:

- Aprobado: el modelo puede cubrir casi todo lo que pidió el host.
- Aprobación parcial: el host parece viable, pero pidió más de lo prudente.
- Línea piloto: hay algo de capacidad, pero conviene probar con poco monto.
- Rechazado: el riesgo o el flujo futuro no alcanzan.

## Ejemplo simple: Lucía en Bariloche

Lucía tiene:

```text
score = 89
P10 futuro = ARS 11.800.000
retención = 28%
fee = 10%
monto pedido = ARS 2.800.000
```

Sin stress adicional:

```text
monto_máximo = 11.800.000 * 0.28 / 1.10
monto_máximo = ARS 3.003.636
```

Como pidió ARS 2.800.000 y el máximo calculado es mayor, puede aprobarse.

Con caída de temporada de 30%:

```text
P10 ajustado = 11.800.000 * 0.70
P10 ajustado = ARS 8.260.000

monto_máximo = 8.260.000 * 0.28 / 1.10
monto_máximo = ARS 2.102.545
```

Si en ese escenario pide ARS 2.500.000, el sistema recomienda ARS 2.102.545. Eso es una aprobación parcial.

## Qué significa recuperación visible

La recuperación visible mira sólo reservas futuras ya confirmadas en la plataforma.

Para cada reserva:

```text
reserva_ajustada =
  valor de la reserva *
  (1 - riesgo de cancelación) *
  (1 - caída de temporada)
```

Después:

```text
cobro retenible = reserva_ajustada * retención
```

Si eso alcanza para cubrir:

```text
adelanto + fee
```

la recuperación visible es alta.

Si no alcanza, no significa automáticamente que el adelanto sea malo. Significa que parte de la recuperación depende de ingresos futuros todavía no confirmados, respaldados por historial, P10 y control de payouts.

## Métricas de cartera

La demo no muestra sólo casos individuales. También muestra una mini cartera de 6 hosts ficticios.

Con los datos base:

```text
Hosts analizados: 6
Hosts con oferta positiva: 5
Hosts rechazados: 1
Capital recomendado: ARS 5.270.000
Fee esperado: ARS 625.600
Fee ponderado: 11,9%
Advance / P10: 19,4%
Retención promedio: 27,7%
Plazo promedio: 3,2 meses
Score promedio: 76,8
```

Cómo interpretar cada métrica:

| Métrica | Qué significa | Cómo leerla |
|---|---|---|
| Capital recomendado | Suma de todos los adelantos ofrecidos | Tamaño de la cartera piloto |
| Fee esperado | Ingreso bruto por fees | No es ganancia neta |
| Fee ponderado | Fee promedio, ponderado por monto | Mide precio promedio del adelanto |
| Advance / P10 | Cuánto se adelanta contra ingreso futuro conservador | Mientras más bajo, más prudente |
| Retención promedio | Porcentaje promedio de payout retenido | Debe ser suficiente pero no asfixiar al host |
| Plazo promedio | Tiempo esperado de recuperación | Plazos cortos reducen costo financiero |
| Score promedio | Calidad media de hosts con oferta | Resume riesgo de la cartera |

La métrica más defendible para pitch es:

```text
Advance / P10 = 19,4%
```

Esto dice:

> Estamos adelantando menos del 20% del escenario conservador de ingresos futuros. No estamos adelantando contra un caso optimista.

## Unit economics sin jerga

Los unit economics responden:

```text
¿Esta operación gana o pierde plata después de costos y riesgo?
```

La fórmula es:

```text
contribución neta =
  ingreso por fee
  - costo de fondeo
  - pérdida esperada
  - costo operativo
```

Traducción:

| Concepto | Qué significa |
|---|---|
| Ingreso por fee | Lo que paga el host por recibir el adelanto |
| Costo de fondeo | Lo que cuesta conseguir el dinero que se adelanta |
| Pérdida esperada | Lo que esperamos perder por defaults |
| Costo operativo | Costos de originar, monitorear y administrar la operación |
| Contribución neta | Lo que queda después de todo eso |

Con los supuestos base de la UI:

```text
Costo de fondeo anual: 35%
Probabilidad de default: 6%
Pérdida dado default: 35%
Costo operativo: 1%
```

La cartera demo queda así:

```text
Ingreso por fee:      ARS 625.600
Costo de fondeo:     -ARS 492.333
Pérdida esperada:    -ARS 110.670
Costo operativo:      -ARS 52.700
Contribución neta:    -ARS 30.103
Margen:                    -0,6%
```

Esto no significa que el producto no sirva. Significa que, con esos supuestos, está casi en equilibrio pero todavía levemente negativo.

La lectura de negocio es:

> El producto se vuelve más viable si consigue fondeo más barato, reduce default con mejor scoring, baja pérdidas gracias a la retención de payouts o ajusta el fee.

## Qué son PD y LGD

Estos dos términos aparecen en la sección de margen.

```text
PD = Probability of Default = probabilidad de default
LGD = Loss Given Default = pérdida dado default
```

Ejemplo:

```text
Principal = ARS 1.000.000
PD = 6%
LGD = 35%
```

La pérdida esperada es:

```text
1.000.000 * 0.06 * 0.35 = ARS 21.000
```

Interpretación:

```text
No esperamos perder ARS 1.000.000.
Esperamos que exista una probabilidad de default.
Y si ocurre default, no necesariamente se pierde todo.
```

La retención de payouts ayuda justamente a bajar la pérdida dado default.

## Qué es costo de fondeo

El costo de fondeo es el costo de conseguir el dinero que se adelanta.

Si el producto adelanta ARS 1.000.000, ese dinero tiene que salir de algún lado:

- caja propia
- banco
- fintech partner
- inversores
- línea de capital de trabajo

Ese capital tiene costo.

Ejemplo:

```text
Principal = ARS 1.000.000
costo de fondeo anual = 35%
plazo = 3 meses
```

Como 3 meses es un cuarto de año:

```text
costo de fondeo = 1.000.000 * 0.35 * 3 / 12
costo de fondeo = ARS 87.500
```

Por eso el plazo corto importa tanto. Si se recupera en 3 meses, el costo de fondeo pesa mucho menos que si se recupera en 12 meses.

## Qué es sensibilidad

La sensibilidad muestra qué pasa si cambian los supuestos.

La UI compara tres escenarios:

| Escenario | Qué representa |
|---|---|
| Optimista | Fondeo bajo, defaults bajos y pérdidas bajas |
| Base | Los supuestos que elegís con los sliders |
| Stress | Fondeo caro, defaults altos y pérdidas altas |

Esto sirve para decir:

> El modelo no promete margen mágico. Muestra bajo qué condiciones el negocio funciona y bajo cuáles se vuelve riesgoso.

## Cómo mirar la UI

En la parte superior:

- Decisión: aprobado, parcial, piloto o rechazado.
- Score: calidad/riesgo del host.
- Adelanto recomendado: monto que el modelo ofrecería.
- Recuperación visible: cuánto se puede recuperar con reservas futuras ya visibles.

En los parámetros:

- Adelanto solicitado: cuánto pide el host.
- Ingreso futuro P10: estimación conservadora de ingresos futuros.
- Caída de temporada: stress adicional.
- Retención de cobros: porcentaje retenido de futuros payouts.
- Fee: costo que paga el host.

En los supuestos de margen:

- Costo de fondeo anual: cuánto cuesta conseguir el capital.
- Probabilidad de default: chance de que haya incumplimiento.
- Pérdida dado default: cuánto se pierde si ocurre incumplimiento.
- Costo operativo: costo administrativo.

En la parte baja:

- Métricas de cartera: foto agregada del piloto.
- Unit economics: si el producto gana o pierde plata.
- Sensibilidad: cómo cambia el margen en escenarios optimista, base y stress.

## Demo sugerida para el pitch

Podés mostrar tres momentos:

1. Lucía, Bariloche:

```text
Caso ideal: host histórica, destino estacional, reservas fuertes.
El modelo aprueba un adelanto alto.
```

2. Subir caída de temporada a 30%:

```text
El monto baja automáticamente.
Mensaje: no adelantamos contra optimismo, ajustamos por stress.
```

3. Nicolás, Villa Gesell:

```text
Caso rechazado: poco historial, permiso pendiente, cancelaciones altas.
Mensaje: el modelo también sabe decir que no.
```

Después cerrar con cartera:

```text
5 de 6 hosts reciben oferta.
Advance / P10 de 19,4%.
Margen base de -0,6%, muy sensible a fondeo y riesgo.
```

## Preguntas difíciles y respuestas simples

### ¿Esto es un préstamo?

Respuesta:

> Para el MVP lo presentamos como adelanto de cobros futuros, no como préstamo abierto. El host autoriza que una parte de sus próximos payouts se retenga hasta cubrir adelanto + fee. Para producción o montos mayores, se puede operar con un partner regulado.

### ¿Por qué Airbnb no lo haría solo?

Respuesta:

> Podría hacerlo, pero la propuesta no es competir como marketplace. Es una capa de scoring, simulación y originación que una plataforma o partner financiero puede integrar. El valor está en convertir datos operativos en una oferta explicable, con reglas de riesgo y métricas de margen.

### ¿Por qué usar P10 y no el promedio?

Respuesta:

> Porque el promedio puede esconder temporadas malas. P10 es una forma de no ofrecer de más: adelanta contra un escenario conservador, no contra el mejor caso.

### ¿Por qué el margen base da negativo?

Respuesta:

> Porque usamos supuestos exigentes: fondeo anual 35%, default 6%, LGD 35% y costo operativo 1%. Con esos valores, la cartera queda casi en punto de equilibrio. La demo muestra justamente qué palancas hacen viable el producto: fondeo más barato, menor pérdida por control de payouts, mejor fee o plazos más cortos.

### ¿Qué pasa si el host cancela reservas?

Respuesta:

> El modelo descuenta riesgo de cancelación en la recuperación visible. Además, no depende sólo de una reserva: combina reservas confirmadas, historial, P10, reputación y retención de futuros payouts.

### ¿Qué pasa si el host se va de la plataforma?

Respuesta:

> Ese es uno de los riesgos principales. Por eso pesan antigüedad, reputación, reservas completadas y dependencia de la plataforma. En producción habría límites, retención contractual, monitoreo y posiblemente partner regulado.

## Errores conceptuales a evitar

- No decir que el fee es ganancia pura. Hay que restar fondeo, pérdidas esperadas y operación.
- No decir que P10 garantiza ingresos. Es una estimación conservadora, no una garantía.
- No decir que el score define el monto. El score define riesgo, el flujo futuro define capacidad.
- No decir que recuperación visible es toda la recuperación. Es sólo la parte respaldada por reservas futuras confirmadas.
- No prometer que la plataforma no tiene riesgo. El valor del modelo es medirlo, limitarlo y hacerlo explicable.

## Frase final para el pitch

> Renta Estable convierte datos que la plataforma ya tiene en adelantos responsables para hosts estacionales. No adelanta contra optimismo: usa P10, retención de payouts, stress testing y unit economics para decidir cuánto ofrecer y bajo qué condiciones el producto es viable.
