# MVP de hackathon: FlowRent

## 1. Tesis del producto

**FlowRent** es infraestructura de adelantos embebidos para comercios con ingresos estacionales que operan dentro de plataformas digitales.

Los comercios estacionales no son necesariamente impredecibles. Sus ciclos pueden entenderse usando datos que la plataforma ya observa: ventas, cobros, reputación, cancelaciones, recurrencia y actividad futura visible.

FlowRent convierte esas señales en ofertas de adelanto personalizadas. La oferta aparece dentro de la plataforma y se recupera reteniendo una parte transparente de los próximos cobros.

> No financiamos a pesar de la estacionalidad. Financiamos entendiéndola.

## 2. Problema y oportunidad

Un comercio puede ser saludable durante el ciclo completo y, aun así, necesitar liquidez antes de su temporada fuerte:

```text
la inversión y los gastos llegan antes;
los ingresos principales llegan después.
```

La oportunidad no depende de asumir cómo evalúan el riesgo los bancos. Depende de una ventaja concreta: las plataformas poseen información transaccional y controlan el flujo de liquidación que otros actores no suelen tener.

## 3. Actores y propuesta de valor

| Actor | Valor |
|---|---|
| Comercio estacional | Accede a liquidez adaptada a su ciclo, sin una cuota fija desconectada de sus cobros |
| Plataforma | Mejora retención, actividad y calidad de su ecosistema sin construir todo el producto financiero |
| Inversor de cartera | Accede a operaciones evaluadas con datos transaccionales y recuperación integrada |
| FlowRent | Opera scoring, ofertas, administración de riesgo e integración con cobros |

## 4. Cómo funciona

```text
Datos autorizados de la plataforma
  -> reglas de elegibilidad
  -> score y riesgo
  -> estimación conservadora de ingresos
  -> monto y costo transparentes
  -> oferta embebida
  -> retención sobre próximos cobros
```

FlowRent no necesita ser una app financiera separada. Se integra dentro de la plataforma donde el comercio ya opera.

## 5. Por qué Airbnb es el caso ideal inicial

Airbnb es el primer caso de uso del MVP, no la definición del producto.

Resulta atractivo para demostrar la tesis porque:

- los hosts de destinos turísticos suelen tener ingresos marcadamente estacionales;
- para muchos hosts profesionales, la actividad de alquiler representa una parte material de sus ingresos;
- la plataforma observa historial, reputación, cancelaciones y reservas futuras;
- las reservas confirmadas permiten mostrar parte del flujo que respaldará la recuperación;
- Airbnb procesa los payouts, lo que habilita una retención integrada;
- existe una oportunidad de reducir riesgo cambiario cuando fondeo, oferta y payouts pueden alinearse en moneda dura.

La moneda de payout disponible depende del país y del método de cobro. El pitch no debe afirmar que todos los hosts cobran en dólares.

## 6. Caso de demo: María

María es anfitriona en una zona turística de Argentina. Antes de la temporada necesita capital para preparar su propiedad.

La demo muestra:

- oferta de `ARS 2.800.000`;
- fee y total a recuperar;
- retención temporal sobre próximos payouts;
- motivos explicables de la decisión;
- cobertura visible mediante reservas futuras;
- consentimiento y aceptación simulados.

En un escenario de temporada `-30%`, la oferta baja a aproximadamente `ARS 2.046.969`. Si existe una regla excluyente, como una habilitación pendiente, la oferta se rechaza.

## 7. Producto MVP construido

### Experiencia del comercio

Implementada como experiencia host en `frontend/host.html`:

- muestra la oferta y su costo total;
- explica el porcentaje de retención y duración estimada;
- informa por qué califica;
- simula consentimiento y aceptación.

### Consola de plataforma y riesgo

Implementada en `frontend/index.html`:

- identifica quién califica;
- muestra score, PD proxy, P10 y cobertura;
- permite probar escenarios adversos;
- calcula monto, pricing y unit economics;
- presenta una cartera demo.

### Motor reproducible

Implementado en JavaScript, Python y SQLite:

- dataset sintético de seis perfiles;
- reglas duras de elegibilidad;
- score experto explicable;
- PD proxy y P10 precargados;
- simulación de stress y monto recuperable.

La PD y el P10 actuales son hipótesis de demo, no modelos calibrados con resultados reales.

## 8. Estructura de capital: tres funciones distintas

No conviene agrupar todo bajo el término “partner financiero”.

### Capital de la empresa

VCs, aceleradoras o inversores ángeles pueden invertir equity en FlowRent para financiar tecnología, equipo, integraciones y crecimiento.

### Capital de la cartera

Los adelantos pueden ser fondeados por un vehículo, fondo de deuda privada, family office u otros inversores profesionales. Estos aportantes reciben una parte del rendimiento generado por la cartera, según la estructura acordada.

Un VC tradicional normalmente no fondea cada adelanto ni cobra directamente una parte de sus intereses. Si lo hiciera, estaría actuando como inversor de deuda o de cartera, no solamente como VC.

### Estructura operativa y legal

La fuente de capital y la entidad legalmente habilitada para originar u operar el producto pueden ser actores distintos. El diseño definitivo requiere validar contratos, regulación financiera, pagos, protección de datos e impuestos en cada jurisdicción.

## 9. Economía del modelo

FlowRent puede cobrar:

- una comisión de originación o administración por operación;
- una licencia o fee de integración a la plataforma;
- una participación acordada en el rendimiento, si la estructura legal lo permite.

El inversor de cartera recibe el rendimiento acordado. La plataforma obtiene valor mediante retención, actividad y una nueva capacidad embebida; no necesita aportar capital en la primera etapa.

## 10. Alcance deliberado del MVP

### Construido

- oferta embebida;
- consola de riesgo;
- stress testing;
- cartera y unit economics;
- simulador y base reproducible;
- narrativa de producto y piloto.

### Fuera de alcance

- integración real con Airbnb u otra plataforma;
- transferencia y retención de fondos reales;
- KYC, contratos y reporting productivo;
- modelo entrenado con datos históricos reales;
- confirmación de estructura regulatoria;
- validación de moneda de payout por mercado.

## 11. Piloto propuesto

El piloto inicial se concentra en hosts estacionales con buen historial y reservas confirmadas o flujo altamente observable.

Debe medir:

- elegibilidad, apertura y aceptación de ofertas;
- monto promedio y uso declarado;
- tiempo y porcentaje de recuperación;
- cancelaciones, chargebacks y pérdidas;
- margen por operación y costo de fondeo;
- retención, actividad y calidad incremental para la plataforma.

Después de validar el caso Airbnb, la misma infraestructura puede adaptarse a comercios estacionales en otras plataformas.

## 12. Mensaje final

> FlowRent convierte los datos y el flujo de cobros de las plataformas en adelantos responsables para comercios estacionales.

Airbnb demuestra por qué funciona. La oportunidad es mucho más amplia.
