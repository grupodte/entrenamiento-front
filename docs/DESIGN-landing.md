# DESIGN — /landing-page (VSL DemicheriFitness)

Dirección: **híbrido hero oscuro**. El hero y el video viven en carbón cinematográfico;
el contenido desbloqueado corta a un lienzo claro editorial. El corte de fondo es en sí mismo
la recompensa del gate: al desbloquear, la página cambia de mundo.

Género base: editorial (skill `editorial-web`), adaptado de serif-sobre-papel a
**condensada-atlética**, porque la marca es fitness y el spec pide tipografía condensada,
alto contraste y sensación intensa pero profesional.

## Ejes de variación

| Eje | Elección | Razón |
|---|---|---|
| Mood | Hero carbón cinematográfico → cuerpo claro editorial | El gate del video necesita foco oscuro; el método necesita legibilidad larga |
| Voz display | Condensada atlética (Anton), no serif | La marca es deportiva; el serif romántico contradiría "intenso y atlético" |
| Alineación hero | Left-set asimétrico, titular a 3 líneas | Rompe el centrado monótono de la versión anterior |
| Forma de placa | Redondeadas 20 px (video) / 16 px (cards) | Tokens del spec, hairline interior en vez de sombra dura |
| Entrega del acento | Un solo panel lila a sangre + hairlines lila; el resto neutro | Evita que el lila se diluya por aparecer en todos lados |
| Rail | `CasesSection` se conserva tal cual, a sangre dentro del lienzo claro | Ya funciona y es la prueba visual principal |
| Chapter break | Panel lila full-bleed con línea Anton grande | El corte de capítulo antes del CTA principal |
| Textura | Grano de película solo sobre el hero carbón + halo lila tras el video | Da profundidad al bloque oscuro sin ensuciar el cuerpo claro |

## Gramática de secciones

1. Nav mínima flotante sobre el hero (logo invertido + píldora fantasma, oculta en mobile)
2. Hero carbón: eyebrow → titular display 3 líneas → subtítulo <46ch → curiosity gap
3. Placa de video 20 px con halo lila, barra de progreso hairline
4. **Corte a claro**
5. Tira de datos con separadores hairline (+500 / 60 / 1:1), con conteo animado
6. El método: 5 filas alternadas placa-numeral ↔ texto (reemplaza la lista de bullets)
7. Manifiesto: pull-quote grande + la historia de Dani a dos columnas
8. Resultados: `CasesSection`
9. Chapter break lila a sangre + CTA píldora
10. Cómo empieza: 3 cards hairline
11. FAQ sobre carbón, a dos columnas
12. Cierre claro + CTA píldora lila

## Efectos (4, todos con `prefers-reduced-motion`)

1. **Revelado por línea desde máscara** en todos los titulares display (`yPercent 112 → 0`, `power4.out`) — el movimiento de mayor valor del género
2. **Clip-path** que abre la placa de video en la entrada del hero
3. **Conteo** del dato +500 al entrar en viewport
4. **Hairline de progreso de scroll** lila en el borde superior

Movimiento total ≈ 5/10 según el spec: entradas breves que ordenan la lectura, sin scroll secuestrado.

## Tipografía

- Display: **Anton** (Google Fonts), mayúsculas, `line-height .88`, `clamp(40px, 9.5vw, 104px)` en hero
- Cuerpo: **DM Sans** (ya en el proyecto)
- Dos familias, nunca más

## Tokens

Todo el theming vive en el bloque `.ln { --ln-* }` al final de `src/styles/index.css`.
No agregar colores hardcodeados fuera de ese bloque.

## Sin verificar

No hay extensión de Chrome ni Playwright en este entorno: **el diseño no fue verificado
visualmente**. Falta revisión a 390 px y 1440 px, chequeo de contraste real y consola limpia.

## Pendiente respecto del spec

- `src/assets/campaign/` sigue vacío: no hay retrato de Dani ni captura de teléfonos.
  Las filas del método usan placas numerales tipográficas como sustituto.
- El desbloqueo sigue al 75%, no al 50% (es comportamiento, no diseño).
