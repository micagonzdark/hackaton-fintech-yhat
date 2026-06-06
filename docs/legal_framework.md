# Marco legal: adelanto de cobros futuros para anfitriones

> Nota: esto no es asesoramiento legal. Es un encuadre de producto para pitch y MVP. Antes de salir a producción hay que validarlo con abogados por jurisdicción, entidad operadora, fuente de fondos y contrato.

## Resumen ejecutivo

La formulación original, "Airbnb le presta plata al host", es riesgosa. Airbnb no es un banco y, si ofrece financiamiento habitual al público, puede quedar alcanzada por regulaciones financieras aunque no capte depósitos.

La reformulación recomendada para el pitch es:

> Renta Estable no es un préstamo abierto. Es un adelanto opt-in sobre cobros futuros que la plataforma ya procesa, recuperado mediante retención transparente de próximos payouts.

La diferencia no es sólo semántica. El producto deja de prometer crédito general y se apoya en tres ideas defendibles:

- El adelanto se calcula sobre flujo observable de la plataforma.
- La recuperación ocurre dentro del flujo de pagos de reservas, no mediante cobranza externa.
- El host no paga cuotas: acepta que una parte de sus futuros cobros se compense hasta cubrir adelanto + fee.

## Riesgo de la versión "línea de crédito"

### 1. Actividad bancaria o intermediación financiera

En Argentina, la Ley 21.526 comprende a quienes realizan intermediación habitual entre oferta y demanda de recursos financieros. Si Airbnb financiara préstamos con fondos captados de usuarios, inversores o terceros y los colocara en hosts, el riesgo regulatorio sería alto.

Regla de diseño: no captar fondos del público, no usar lenguaje de banco, no vender "cuentas", "depósitos", "plazo fijo" ni "préstamos" emitidos por Airbnb Marketplace.

### 2. Proveedor no financiero de crédito

Aunque una empresa no sea banco, si ofrece créditos o financiaciones de forma habitual puede quedar dentro del régimen de Proveedores No Financieros de Crédito del BCRA. El BCRA describe el registro para personas jurídicas que, sin ser entidades financieras, hacen oferta habitual de crédito al público como actividad principal o accesoria.

Implicancia: si el producto queda como crédito directo de Airbnb al host, hay que contemplar registro, régimen informativo, responsable de atención a usuarios, transparencia de costo financiero y controles de cumplimiento.

### 3. Servicios de pago

Airbnb ya opera pagos y payouts mediante entidades de pago. Si Renta Estable toca saldos de usuarios, cuentas de pago o liquidaciones, debería correr por la entidad de pagos correspondiente y no por la entidad marketplace.

Regla de diseño: separar marketplace, pagos y financiamiento. Si hay cuentas de pago, los fondos de clientes deben estar segregados y disponibles según la normativa aplicable.

### 4. Transparencia, usuarios y MiPyMEs

Muchos anfitriones pueden ser personas humanas, monotributistas o MiPyMEs. Si la operación se considera crédito, deben mostrarse en forma clara monto financiado, tasa/costo, fee, total a devolver/descontar, periodicidad y cargos adicionales. En pitch conviene evitar una promesa de "tasa baja" si no está modelada.

### 5. Datos personales y scoring

El score usa datos de identidad, ingresos, reputación, comportamiento y reservas. Eso exige base legal/consentimiento, finalidad informada, minimización de datos, seguridad, explicabilidad y mecanismo de corrección. Para el pitch: el host opta por el producto y autoriza el uso de sus datos de plataforma para evaluar el adelanto.

### 6. Permisos locales y fiscalidad

El producto no debería financiar propiedades sin habilitación local cuando sea exigible. La retención de payouts también tiene efectos fiscales y contables: fee, IVA/impuestos locales, comprobantes y tratamiento de retenciones.

## Reformulación recomendada

### Producto: adelanto sobre reservas y payouts

Nombre sugerido:

```text
Renta Estable: adelanto de cobros futuros
```

Mecánica:

1. El host solicita un adelanto dentro de la app.
2. La plataforma calcula un tope con reservas confirmadas, historial de ingresos y escenario P10.
3. El host ve adelanto, fee fijo, total a descontar, porcentaje de retención y calendario estimado.
4. Si acepta, Airbnb Payments o un partner regulado adelanta el monto.
5. Cada próximo payout se divide: una parte va al host y otra compensa el adelanto.
6. Al llegar al total pactado, la retención termina automáticamente.

Frase de pitch:

> No pedimos que Airbnb sea banco. Usamos la ventaja que sí tiene: ve reservas, cobra al huésped y liquida al host. Por eso puede adelantar parte de ingresos futuros y recuperarlos dentro del mismo flujo de pagos.

### Dos niveles de producto

#### Nivel 1: adelanto de reservas confirmadas

Este es el MVP más defendible. Se adelanta un porcentaje de cobros de reservas ya confirmadas y cobradas o autorizadas. Se parece más a una liquidación anticipada o descuento de cuentas por cobrar que a un préstamo de libre destino.

Guardrails:

- Sólo reservas confirmadas y con pago exitoso o altamente asegurado.
- Retención limitada al payout de esas reservas o reservas futuras dentro de la app.
- Sin débito automático externo como camino principal de cobro.
- Sin mora punitoria si el flujo baja por cancelaciones no fraudulentas.
- Reglas claras ante cancelaciones, refunds, chargebacks y suspensión.

#### Nivel 2: adelanto estacional sobre ingresos esperados

Este nivel usa P10 e historial para adelantar más que las reservas ya confirmadas. Es comercialmente más potente, pero regulatoriamente se parece más a financiamiento.

Guardrail para producción:

- Operarlo con banco, fintech o PNFC registrado, o validar registro propio.
- Mantener a Airbnb como originador de datos, canal y agente de retención de payouts.
- El partner regulado figura como acreedor si la jurisdicción lo requiere.

## Alternativas de estructura

| Opción | Cómo funciona | Riesgo legal | Cuándo usar |
|---|---|---:|---|
| Préstamo directo de Airbnb | Airbnb desembolsa dinero y cobra cuotas | Alto | No recomendado para MVP |
| Partner regulado | Banco/fintech presta, Airbnb aporta datos y retiene payouts | Medio | Producción y montos altos |
| Adelanto de reservas confirmadas | Anticipo de cobros ya visibles en la plataforma | Medio-bajo | MVP recomendado |
| Crédito cerrado en app | El monto sólo paga servicios de limpieza, mantenimiento o seguros dentro de la app | Medio | Si se quiere evitar cash-out |
| Marketplace P2P | Terceros financian hosts vía plataforma | Alto | Evitar salvo licencia específica |

## Reglas de diseño para reducir riesgo

- Cambiar "crédito" por "adelanto", "descuento de cobros" o "liquidación anticipada".
- Cambiar "repago" por "retención", "compensación" o "recuperación por payout".
- Mostrar siempre total a descontar, fee, porcentaje de retención y fecha estimada de fin.
- Requerir aceptación expresa del host para usar datos, adelantar fondos y retener payouts.
- Evitar cobranza fuera de la plataforma salvo fraude, error, chargeback o incumplimiento contractual grave.
- Poner límite de concentración: nunca retener 100% del payout; dejar flujo operativo mínimo al host.
- Excluir hosts sin identidad, datos fiscales, cuenta bancaria y permiso local cuando aplique.
- Incluir revisión manual y derecho a corregir datos que afecten el score.
- Separar contractualmente: marketplace, entidad de pagos y entidad financiadora.

## Impacto en el pitch

La slide legal debería decir:

```text
Legal-first product design

Riesgo: Airbnb no puede presentarse como banco ni otorgar crédito abierto sin encuadre regulatorio.

Solución: estructuramos Renta Estable como adelanto opt-in de cobros futuros dentro de la plataforma. El host no paga cuotas; autoriza una retención limitada de próximos payouts hasta cubrir adelanto + fee transparente.

Para montos mayores o adelantos sobre ingresos no confirmados, Airbnb opera con un partner regulado y conserva su ventaja diferencial: datos de underwriting y control de liquidación.
```

## Fuentes revisadas

- [Ley 21.526 de Entidades Financieras](https://www.argentina.gob.ar/normativa/nacional/ley-21526-16071/texto)
- [BCRA: Registro de Otros Proveedores No Financieros de Crédito](https://www.bcra.gob.ar/solicitar-inscripcion-actualizacion-o-dar-de-baja-para-otros-proveedores-no-financieros-de-credito/)
- [BCRA: Texto ordenado de Proveedores No Financieros de Crédito](https://www.bcra.gob.ar/archivos/pdfs/texord/t-apnf.pdf)
- [BCRA: Texto ordenado de Proveedores de Servicios de Pago](https://www.bcra.gob.ar/archivos/Pdfs/Texord/t-snp-psp.pdf)
- [Ley 24.240 de Defensa del Consumidor](https://www.argentina.gob.ar/normativa/nacional/638/actualizacion)
- [Ley 25.326 de Protección de Datos Personales](https://www.argentina.gob.ar/normativa/nacional/64790/actualizacion)
- [Airbnb Payments Terms of Service](https://www.airbnb.com/help/article/2909)
