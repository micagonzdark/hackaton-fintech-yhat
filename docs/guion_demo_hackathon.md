# Guion integrado de pitch y demo

Duración objetivo: **4 minutos**.

## 0:00–0:35 — Slides 1 y 2: tesis y oportunidad general

> Los negocios estacionales no son negocios impredecibles. Son negocios con ciclos que pueden entenderse.

> El capital suele ser más útil antes de la temporada alta, mientras que los ingresos fuertes llegan después. FlowRent convierte los datos de plataformas en adelantos adaptados a ese ciclo.

## 0:35–1:05 — Slide 3: ventaja embebida

> Las plataformas ya observan ventas, estacionalidad, reputación, cancelaciones y cobros futuros. FlowRent transforma ese contexto, con autorización del usuario, en ofertas personalizadas y explicables dentro de la misma plataforma.

> No necesitamos asumir cómo evalúa un banco. Nuestra ventaja son los datos y el flujo de cobros que la plataforma ya controla.

## 1:05–1:25 — Slide 4: por qué Airbnb

> Empezamos con Airbnb porque demuestra especialmente bien la tesis: hosts turísticos con ciclos marcados, reservas futuras visibles y recuperación posible mediante payouts.

> Cuando la moneda de fondeo y payout puede alinearse en moneda dura, también se reduce el riesgo cambiario. Esto depende del país y del método de cobro.

## 1:25–2:20 — Demo: experiencia de Martín

Abrir:

```text
http://127.0.0.1:4173/frontend/host.html
```

Mostrar:

- capital disponible hoy: `USD 1.500`;
- costo total;
- retención temporal: `28%`;
- recuperación estimada;
- motivos de la oferta;
- consentimiento y aceptación.

> Martín recibe capital antes de la temporada. No paga una cuota fija: se retiene temporalmente una parte de sus próximos cobros hasta completar el total informado.

## 2:20–3:05 — Demo: decisión responsable

Entrar a **Consola de riesgo**.

### Botón `2 · Temporada −30%`

> Si empeora el escenario, la oferta baja automáticamente de aprobación total a aprobación parcial.

### Botón `3 · Rechazo explicable`

> Una habilitación pendiente activa una regla excluyente. El monto recomendado es cero.

## 3:05–3:35 — Slide 6: modelo de capital y negocio

> FlowRent separa tres funciones. El VC puede financiar la empresa, su tecnología y crecimiento. Un fondo de deuda, vehículo o inversores profesionales pueden fondear la cartera y recibir el rendimiento acordado. La plataforma aporta datos, distribución y coordinación con sus cobros.

> FlowRent opera la infraestructura y cobra una comisión por operación y, más adelante, una licencia de integración.

## 3:35–4:00 — Slide 7: piloto y cierre

> El próximo paso es un piloto controlado con hosts estacionales para validar aceptación, recuperación, desempeño del modelo y economía por operación. Luego, la misma infraestructura puede integrarse en otras plataformas con comercios estacionales.

> No financiamos a pesar de la estacionalidad. Financiamos entendiéndola.

## Preguntas difíciles

### ¿FlowRent es solamente para Airbnb?

> No. FlowRent es infraestructura para plataformas con comercios estacionales. Airbnb es el primer caso ideal porque combina estacionalidad, información futura visible y control del payout.

### ¿Airbnb paga siempre en dólares?

> No. La moneda disponible depende del país y del método de payout. La oportunidad aparece cuando podemos alinear fondeo, oferta y recuperación en la misma moneda, especialmente si es moneda dura.

### ¿Quién aporta el dinero?

> El piloto puede fondearse mediante deuda privada, un vehículo o inversores profesionales. Quien aporta capital a la cartera recibe el rendimiento acordado. La estructura exacta debe validarse legalmente por jurisdicción.

### ¿Entonces el inversor es un VC?

> No necesariamente. Un VC tradicional invierte equity en FlowRent. El inversor que fondea adelantos actúa como aportante de deuda o capital de cartera, aunque una misma organización podría cumplir ambos roles mediante vehículos separados.

### ¿Es un préstamo?

> El caso más conservador es un adelanto opt-in sobre cobros confirmados y recuperado mediante payouts. Adelantar ingresos todavía no confirmados aumenta el riesgo financiero y regulatorio, por lo que requiere una estructura específica validada por jurisdicción.

### ¿La PD es real?

> Hoy es una proxy experta para validar el flujo de producto y los unit economics. Una PD real requiere operaciones maduras y resultados suficientes para entrenar y calibrar.

## Checklist

- Preparar manualmente las slides según `docs/guia_slides_manual.md`.
- Levantar el servidor local.
- Abrir `frontend/host.html` con Martín como caso inicial.
- Confirmar consentimiento y aceptación.
- Confirmar los botones `2 · Temporada −30%` y `3 · Rechazo explicable`.
- No presentar a Airbnb como partner.
- No afirmar que todos los payouts son en USD.
- No llamar VC al fondeador de cartera.
- No llamar “modelo entrenado” a la PD proxy.
