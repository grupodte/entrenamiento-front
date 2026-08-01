# Rediseño de landing VSL DemicheriFitness

## Objetivo

Transformar `/landing-page` en una VSL más visual, breve y directa que convierta tráfico proveniente de la campaña en llamadas de diagnóstico. La página conservará el video como pieza central y desbloqueará el contenido completo cuando el visitante haya visto el 50%.

## Alcance

- Se conserva la ruta, el logo, el reproductor Mux, el destino `/pre-call`, el almacenamiento local del desbloqueo y los eventos existentes.
- Se reestructura la landing, se reduce el copy y se actualiza su dirección visual.
- Se incorporan fotografías y capturas reales de la campaña compartida por el usuario.
- No se modifican formularios, rutas del embudo, textos legales ni la página principal.

## Dirección de diseño

La landing adopta el lenguaje de la campaña: negro carbón, blanco, lila DemicheriFitness, tipografía condensada para titulares y fotografías de alto contraste. El resultado debe sentirse intenso y atlético, pero también profesional y confiable.

Configuración:

- Variación visual: 7/10. Composición asimétrica y bloques con escalas distintas.
- Movimiento: 5/10. Entradas breves para ordenar la lectura, sin scroll secuestrado.
- Densidad: 4/10. Mensajes cortos, espacios amplios y pocas ideas por sección.
- Tema: oscuro en toda la landing.
- Acento principal: lila de marca.
- Verde profundo: solamente para indicar progreso completado o confirmación positiva.
- Radios: 16 px para contenedores, botones tipo píldora.

## Propuesta de valor y voz

Marco principal: AIDA con elementos de StoryBrand. El visitante es la persona que intenta sostener un cambio en una vida real. Dani y el equipo son el guía que reduce decisiones, adapta el plan y acompaña.

Mensajes centrales:

- Hero: "Tu plan no falló. Falló el seguimiento."
- Apoyo: "Entrenamiento, alimentación y hábitos ajustados a tu vida. Con un equipo que no te deja solo."
- Prueba: "+500 personas entrenadas. Ninguna con el mismo plan."
- Diferencial: "Si algo no funciona, lo ajustamos. Si una semana se complica, la trabajamos."
- CTA único: "Quiero hablar con Dani".

No se agregan métricas, garantías, urgencia ni testimonios que no estén respaldados por el material existente.

## Arquitectura de la página

### 1. Navegación mínima

Logo sobre fondo oscuro y un CTA discreto visible en desktop. En mobile se conserva solamente el logo para priorizar el video.

### 2. Hero y video

Hero asimétrico con titular corto, subtexto y una fotografía de Dani derivada de la campaña. El video ocupa un bloque ancho inmediatamente debajo o integrado en la composición. El reproductor mantiene reproducción, pausa, pantalla completa y bloqueo de adelantado.

Antes del 50%, se muestra una sola frase de curiosidad. La barra explica de forma clara que el método se desbloquea al llegar a la mitad del video.

### 3. Prueba inmediata

Al desbloquearse, aparece el dato "+500 personas" junto a una imagen real de Dani. Este bloque conecta la promesa del hero con evidencia de escala sin inventar resultados.

### 4. El método

Cuatro beneficios breves en una composición asimétrica:

- Entrenamiento organizado con videos.
- Alimentación con horarios y porciones reales.
- Progreso visible y registrado.
- Ajustes y seguimiento directo por WhatsApp.

Se usará la captura de teléfonos de la campaña como visual real del producto.

### 5. Resultados reales

Se conserva `CasesSection`, integrada en el nuevo tema. Esta sección será el principal bloque de prueba visual.

### 6. Diferencial humano

Una fotografía de Dani y una cita breve explican que el conocimiento no es el problema. El valor está en tener a alguien presente cuando la semana se complica. Se elimina la historia larga en cuatro párrafos.

### 7. Cómo empieza

Tres acciones sin numeración decorativa:

- Contanos tu situación.
- Hablá con Dani.
- Empezá con un plan propio.

### 8. Preguntas frecuentes

FAQ compacta con cuatro objeciones prioritarias: tiempo, gimnasio, precio y qué ocurre cuando no se puede sostener el ritmo.

### 9. Cierre

Bloque final de alto contraste con el mensaje: "+500 personas. Ninguna con el mismo plan." CTA único hacia `/pre-call`.

## Interacción y accesibilidad

- El contenido se desbloquea al 50% y persiste mediante la clave local existente.
- No habrá indicación flotante para hacer scroll.
- Las animaciones usarán GSAP con limpieza y se desactivarán con `prefers-reduced-motion`.
- Se eliminará el listener manual de scroll.
- Controles de video accesibles por teclado y con foco visible.
- Contraste WCAG AA para textos y botones.
- En menos de 768 px, todas las composiciones pasan a una columna.

## Activos de campaña

Se seleccionarán y optimizarán los siguientes recursos:

- Retrato de Dani para hero y bloque humano.
- Captura de tres teléfonos para explicar el método.
- Una composición tipográfica como apoyo visual, solamente si permanece legible y no duplica el copy HTML.

Los archivos se copiarán al proyecto con nombres semánticos. Las imágenes serán contenido real, no fondos indispensables para comprender el texto.

## SEO y analítica

- Se conserva el canonical actual.
- Se actualizan título y descripción para reflejar el acompañamiento personalizado y las ocho semanas.
- No se cambian rutas ni identificadores del embudo.
- Los CTA conservarán el destino `/pre-call`.

## Validación

- Build de producción sin errores.
- Revisión visual conjunta en 390 px y 1440 px.
- Prueba del desbloqueo al 50% y persistencia tras recargar.
- Verificación de reproducción, pausa, pantalla completa y navegación a `/pre-call`.
- Revisión de contraste, foco, desbordes y movimiento reducido.

