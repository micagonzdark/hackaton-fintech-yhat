# Sistema híbrido de underwriting y adelantos

> El motor está diseñado para comercios estacionales dentro de plataformas. El MVP usa variables de hosts, reservas y payouts porque Airbnb es el caso demostrativo inicial. En otra integración, esas señales se reemplazan por comercios, órdenes, ventas futuras visibles y liquidaciones.

## Decisión de diseño

FlowRent combina dos enfoques complementarios:

1. Un **scorecard experto explicable**, útil desde el primer día para ordenar señales, aplicar reglas y defender decisiones.
2. Una arquitectura predictiva progresiva, que convierte el score en una **PD individual**, estima ingresos conservadores y mejora con resultados reales.

El sistema no presenta una fórmula experta como si fuera un modelo entrenado. Hasta contar con datos suficientes, la probabilidad de default se etiqueta explícitamente como **PD proxy**.

## Flujo completo

```text
Datos de plataforma
  -> reglas duras
  -> score experto por clusters
  -> PD proxy 12 meses
  -> P10 de ingresos futuros + stress
  -> tope recuperable por retención
  -> ajuste del tope por PD
  -> decisión y monto
  -> pricing explicable
  -> monitoreo y resultados reales
```

Cada capa responde una pregunta diferente:

| Capa | Pregunta |
|---|---|
| Reglas duras | ¿Existe una condición que impide ofrecer? |
| Score experto | ¿Qué tan sólido y predecible parece el host? |
| PD | ¿Cuál es la probabilidad estimada de incumplimiento? |
| P10 y retención | ¿Cuánto puede recuperarse en un escenario conservador? |
| Pricing | ¿Qué precio cubre fondeo, riesgo, operación y margen? |

## 1. Reglas duras

Las reglas duras se ejecutan antes de aprobar una oferta. Una buena media de ingresos no compensa riesgos de otra naturaleza.

La demo rechaza cuando encuentra:

- alerta de fraude;
- cuenta suspendida;
- identidad no verificada;
- cuenta bancaria no verificada;
- habilitación legal pendiente.

En producción también deben contemplarse control de payouts, consentimiento, KYC, disputas graves y restricciones regulatorias.

## 2. Scorecard experto

El score actual se mantiene porque es explicable, visual y útil cuando todavía no existen resultados históricos suficientes.

```text
score =
  15% solidez del host +
  15% calidad de la propiedad +
  25% historial de ingresos +
  15% reputación y operación +
  20% reservas futuras +
  10% riesgo del mercado
```

Los pesos son hipótesis expertas. Deben versionarse, documentarse y reemplazarse o recalibrarse cuando exista evidencia real.

## 3. PD proxy y futura PD calibrada

### Etapa actual

Para hacer visible el vínculo entre score, pérdida esperada y pricing, la demo transforma el score en una PD proxy:

```text
PD_proxy_pct =
  clamp(
    50 * exp(-0,06 * (score - 40)),
    mínimo 1,5%,
    máximo 45%
  )
```

La función es deliberadamente monotónica: un score mayor produce una PD menor. No fue entrenada ni debe presentarse como evidencia estadística.

La UI permite aplicar un stress proporcional sobre cada PD individual:

```text
PD_stress = PD_proxy * (1 + stress_pct)
```

### Etapa futura

Cuando existan suficientes operaciones resueltas y defaults, la PD proxy se reemplaza por una regresión logística calibrada.

La etiqueta propuesta es:

```text
default_120d = 1
si no se recuperó al menos 95% del total contractual
120 días después de la fecha estimada de finalización
```

Los casos todavía no maduros no deben etiquetarse como pagados. Los coeficientes deben entrenarse con variables normalizadas y valores monetarios ajustados por inflación.

## 4. Ingreso futuro conservador

El monto no se predice directamente con una regresión de “monto repagado”. Ese enfoque excluiría defaults y aprendería de una variable limitada por decisiones anteriores.

La variable central es el ingreso futuro conservador:

```text
P10 = percentil conservador de ingresos futuros netos
```

En la demo el P10 está precargado. En producción debe estimarse con un modelo de cuantiles o series temporales y validarse midiendo cuántas veces el ingreso real queda por debajo de P10.

```text
P10_ajustado = P10 * (1 - caída_temporada_pct)
```

## 5. Monto híbrido

Primero se calcula cuánto principal puede recuperarse mediante retención de payouts, incluyendo el fee contractual:

```text
tope_recuperable =
  P10_ajustado * retención_pct / (1 + fee_contractual_pct)
```

Después se agrega un buffer de riesgo individual:

```text
tope_ajustado_por_PD =
  tope_recuperable * (1 - PD)
```

Finalmente:

```text
monto_recomendado =
  min(monto_solicitado, tope_ajustado_por_PD, límite_de_política)
```

Las reservas confirmadas se muestran como **cobertura visible**. No sustituyen el P10, pero permiten distinguir cuánto de la recuperación ya es observable.

## 6. Decisión

La política actual de la demo es:

```text
regla dura, score < 50 o PD >= 35%
  -> rechazado

score < 65 o PD >= 15%
  -> línea piloto

monto recomendado >= 95% del solicitado
  -> aprobado

monto recomendado >= 45% del solicitado
  -> aprobación parcial

monto positivo
  -> línea piloto
```

Los thresholds son parámetros de política, no verdades estadísticas. Deben calibrarse mediante backtesting y apetito de riesgo.

## 7. Pricing explicable

El precio sugerido se calcula y se compara con el fee contractual. La demo no cambia automáticamente el contrato.

```text
prima_riesgo_anual = (PD * LGD) / (1 - PD)

tasa_anual_sugerida =
  costo_fondeo_anual +
  margen_objetivo_anual +
  prima_riesgo_anual

fee_sugerido =
  tasa_anual_sugerida * meses / 12 +
  costo_operativo_por_operación
```

Esta separación evita confundir tasa anual con fee total de una operación corta.

## 8. Unit economics

Cada host aporta su propia PD a la pérdida esperada:

```text
pérdida_esperada_host = principal * PD_host * LGD
```

La contribución esperada es:

```text
fee contractual
- costo de fondeo por plazo
- pérdida esperada individual
- costo operativo
```

Esto reemplaza el supuesto anterior de usar una misma PD para toda la cartera.

## 9. Evolución por madurez de datos

El avance depende de cantidad y calidad de resultados, no solamente de meses transcurridos.

| Etapa | Condición | Enfoque |
|---|---|---|
| MVP | Sin defaults suficientes | Scorecard experto + PD proxy + P10 precargado |
| Calibración | Suficientes operaciones maduras y eventos | Regresión logística, calibración y backtesting |
| Forecast | Series históricas suficientes | Modelo de cuantiles P10/P50/P90 |
| Optimización | Volumen, defaults y variación de ofertas | Optimización de límites y pricing |

No se recomienda implementar XGBoost o price optimization hasta contar con una base que permita validación fuera de muestra.

## 10. Validación mínima

### PD

- calibración por bandas y curva de confiabilidad;
- Brier score;
- discriminación mediante AUC/Gini o KS;
- estabilidad de variables y PSI;
- performance fuera de muestra y por período.

### P10

- proporción de ingresos reales por debajo de P10;
- error por mercado, temporada y tipo de propiedad;
- desempeño bajo stress climático y cancelaciones.

### Negocio y gobernanza

- pérdida real frente a pérdida esperada;
- cobertura visible y tiempo de recuperación;
- rentabilidad por cohorte;
- tasa de overrides manuales y sus resultados;
- versionado de modelos, variables, thresholds y razones de decisión.

## Qué incorpora cada enfoque

Del modelo original de FlowRent se conservan:

- narrativa de adelanto de cobros futuros;
- separación entre score y monto;
- P10, retención y stress testing;
- cobertura visible;
- reglas duras y unit economics.

Del documento de modelos predictivos se incorporan:

- PD individual;
- evolución hacia regresión logística explicable;
- pricing basado en fondeo, PD y LGD;
- roadmap de aprendizaje con resultados propios.

La combinación permite una demo honesta hoy y una ruta técnicamente defendible hacia producción.
