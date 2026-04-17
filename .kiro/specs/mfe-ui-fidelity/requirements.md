# Requirements Document — UI Fidelity: Acoplar MFE al Dashboard Legacy

## Introducción

El nuevo merchants-dashboard-mfe (Nuxt 4, Vue 3, Nuxt UI, Tailwind CSS) debe replicar fielmente la apariencia visual del merchants-dashboard legacy (Nuxt 1, Vue 2, Element UI, SASS). Este documento define los requerimientos para cerrar la brecha visual entre ambos dashboards, cubriendo: paleta de colores, tipografía, layout (sidebar + header + contenido), componentes UI (tablas, formularios, botones, tags, modales), espaciados y responsive. El objetivo es que un usuario del dashboard legacy no perciba diferencias significativas al usar el MFE nuevo.

## Glosario

- **Legacy_Dashboard**: Aplicación merchants-dashboard existente construida con Nuxt 1.0.0, Vue 2.7, Element UI 2 y SASS. Usa la paleta de colores Wompi con primary `#2A2C29` (casi negro), secondary `#BDF4BC` (verde claro) y secondary-light `#DFFF61` (verde lima).
- **MFE_Dashboard**: Nuevo merchants-dashboard-mfe construido con Nuxt 4, Vue 3, Nuxt UI y Tailwind CSS. Debe replicar la apariencia visual del Legacy_Dashboard.
- **Shell**: Aplicación host del MFE_Dashboard que provee el layout global (sidebar, header, área de contenido).
- **Sidebar**: Panel de navegación lateral fijo de 16.3rem (261px) de ancho con fondo blanco, logo Wompi centrado en el header, ítems de menú con iconos Wompi-Icons y texto, y sección inferior fija con "Aprende con Wompi" y "Salir".
- **Header**: Barra superior dentro del área de contenido que muestra el nombre del merchant, el ambiente activo (sandbox/producción) y controles del usuario.
- **Content_Area**: Zona principal a la derecha del Sidebar donde se renderizan las páginas, con padding `2rem 2.375rem` en desktop y `1.5rem 1rem` en mobile.
- **Content_Box**: Contenedor principal de contenido con border-radius 20px, box-shadow `0px 1px 4px rgba(0, 0, 0, 0.102751)`, borde `1px solid #eee`, fondo blanco y padding `1.1rem` en desktop.
- **Tailwind_Config**: Archivo `tailwind.config.ts` del MFE_Dashboard donde se definen los design tokens (colores, tipografía, espaciados) que replican las variables SASS del Legacy_Dashboard.
- **Nuxt_UI_Theme**: Configuración de `app.config.ts` del MFE_Dashboard donde se personalizan los componentes de Nuxt UI para que coincidan visualmente con Element UI del Legacy_Dashboard.
- **Wompi_Icons**: Fuente de iconos custom del Legacy_Dashboard con prefijo `.ic_` que contiene ~200 iconos usados en sidebar, tablas, formularios y acciones.
- **Login_App**: Aplicación merchants-dashboard-login construida con Next.js, Chakra UI y TypeScript. Maneja login, recuperación de contraseña, confirmación de código y MFA. Usa la fuente CIBFontSans Bold como heading y Open Sans como body.
- **Login_Layout**: Layout de la Login_App con estructura de grid 12 columnas: imagen de banner a la izquierda (columnas 1-5) y formulario a la derecha (columnas 7-12), centrado vertical, max-width `1140px`.
- **Login_Footer**: Barra inferior sticky de `70px` en desktop y `218px` en mobile, con borde superior `1px solid #616161`, fondo blanco, logo Wompi, enlaces de términos y copyright.

## Requerimientos

### Requerimiento 1: Paleta de Colores — Design Tokens

**User Story:** Como comerciante de Wompi, quiero que el nuevo dashboard use los mismos colores que el dashboard actual, para que la experiencia visual sea consistente y reconocible.

#### Criterios de Aceptación

1. THE Tailwind_Config SHALL definir los siguientes colores primarios del Legacy_Dashboard: `primary: #2A2C29`, `primary-text: #2C2A29`, `secondary: #BDF4BC`, `secondary-light: #DFFF61`, `secondary-hard: #00825A`, `secondary-soft: #E5FBE4`, `secondary-background: #F2FDF1`.
2. THE Tailwind_Config SHALL definir los colores de fondo del Legacy_Dashboard: `bg-primary: #f9f9f9`, `bg-secondary: #fff`, `bg-tertiary: #f1f1f1`, `bg-soft: #E5E5E5`.
3. THE Tailwind_Config SHALL definir los colores de texto del Legacy_Dashboard: `text-dark: #0a0a0a`, `text: #252525`, `text-light: #555555`, `text-lighter: #999`, `text-lightest: #ccc`.
4. THE Tailwind_Config SHALL definir los colores semánticos del Legacy_Dashboard: `success: #B0F2AE`, `warning: #ff9c1b`, `danger: #f64d79`, `info: #4376ff`, `voided: #409eff`.
5. THE Tailwind_Config SHALL definir los colores de borde del Legacy_Dashboard: `border: #eee`, `border-hover: #B4C8FF`.
6. THE Nuxt_UI_Theme SHALL configurar el color primario de Nuxt UI para que los componentes (botones, inputs, selects, switches) usen `#2A2C29` como color primario en lugar del azul por defecto.

---

### Requerimiento 2: Tipografía — Fuentes y Tamaños

**User Story:** Como comerciante de Wompi, quiero que el nuevo dashboard use la misma tipografía que el dashboard actual, para que los textos se vean idénticos.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL cargar y usar la familia tipográfica principal del Legacy_Dashboard: `"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
2. THE MFE_Dashboard SHALL cargar las fuentes Open Sans (Regular, SemiBold, Bold) usadas en el Legacy_Dashboard para elementos específicos como badges, etiquetas y menú.
3. THE MFE_Dashboard SHALL usar un tamaño de fuente base de `16px` con `font-weight: 400` y `word-spacing: 1px`, replicando el `html` del Legacy_Dashboard.
4. THE Tailwind_Config SHALL definir las escalas de tamaño de fuente del Legacy_Dashboard: `xs: 0.625rem`, `sm: 0.75rem`, `md: 0.875rem`, `lg: 1rem`, `xl: 1.25rem`.
5. THE MFE_Dashboard SHALL aplicar `-webkit-font-smoothing: antialiased` y `-moz-osx-font-smoothing: grayscale` al elemento raíz para replicar el rendering de fuentes del Legacy_Dashboard.

---

### Requerimiento 3: Layout — Sidebar de Navegación

**User Story:** Como comerciante de Wompi, quiero que el sidebar del nuevo dashboard se vea y funcione igual que el del dashboard actual, para que pueda navegar sin confusión.

#### Criterios de Aceptación

1. THE Sidebar SHALL tener un ancho fijo de `16.3rem` (261px), posición fija (`position: fixed`), fondo blanco (`#fff`), y un box-shadow interior sutil (`-0.063rem 0rem 0.375rem 0rem rgba(0,0,0,0.1) inset`).
2. THE Sidebar SHALL mostrar el logo de Wompi centrado en la zona superior (header de `6.25rem` de alto), replicando el componente WayLogo del Legacy_Dashboard.
3. THE Sidebar SHALL renderizar los ítems de menú con: icono Wompi-Icons a la izquierda (font-size `1.5rem`, color `#2A2C29`), texto a la derecha (font-size `1rem`), altura de ítem `2.5rem`, padding `0.53125rem 5%`.
4. WHEN el usuario pasa el cursor sobre un ítem del menú, THE Sidebar SHALL aplicar fondo `#D8F9D7` (verde claro) con border-radius `0.4rem`.
5. WHEN un ítem del menú está seleccionado, THE Sidebar SHALL aplicar fondo `#2C2A29` (primary-text) con texto e icono en color `#DFFF61` (secondary-light) y border-radius `0.5rem`.
6. THE Sidebar SHALL agrupar los ítems de menú con submenús desplegables que muestren una flecha indicadora (ángulo arriba/abajo) y sub-ítems con indentación, línea vertical gris (`#CACACA`) y punto indicador (`#616161`).
7. THE Sidebar SHALL mostrar una sección inferior fija (position absolute, bottom 0) con borde superior `1px solid #CACACA`, fondo blanco, conteniendo los enlaces "Aprende con Wompi" y "Salir".
8. WHILE la pantalla tiene un ancho menor a `48rem` (768px), THE Sidebar SHALL ocupar el 100% del ancho, posicionarse como overlay y ocultarse con transición `margin-left: -100vw` cuando no está activo.

---

### Requerimiento 4: Layout — Área de Contenido y Content Box

**User Story:** Como comerciante de Wompi, quiero que el área de contenido del nuevo dashboard tenga el mismo espaciado y estilo de contenedores que el dashboard actual, para que las páginas se vean iguales.

#### Criterios de Aceptación

1. THE Content_Area SHALL aplicar un padding-left igual al ancho del Sidebar (`16.3rem`) al body, replicando el layout del Legacy_Dashboard donde el contenido se desplaza a la derecha del sidebar fijo.
2. THE Content_Area SHALL usar un fondo de `#f9f9f9` (bg-primary) para toda la zona de contenido, replicando el fondo gris claro del Legacy_Dashboard.
3. THE Content_Box SHALL aplicar los estilos del Legacy_Dashboard: border-radius `20px`, box-shadow `0px 1px 4px rgba(0, 0, 0, 0.102751)`, borde `1px solid #eee`, fondo blanco, padding `0.9rem` en mobile y `1.1rem` en desktop, margin-bottom `1.4rem`.
4. THE Content_Area SHALL aplicar padding de `1.5rem 1rem` en mobile (< 768px) y `2rem 2.375rem` en desktop (≥ 768px) al contenido de las vistas, replicando las variables `$viewContentVerticalPadding` y `$viewContentHorizontalPadding` del Legacy_Dashboard.
5. THE Content_Area SHALL limitar el ancho máximo del contenido a `74.25rem` (1188px) centrado horizontalmente, replicando la variable `$containerMaxWidth` del Legacy_Dashboard.

---

### Requerimiento 5: Botones — Estilo Wompi

**User Story:** Como comerciante de Wompi, quiero que los botones del nuevo dashboard se vean iguales a los del dashboard actual, para que la interacción sea familiar.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL estilizar los botones primarios con: fondo `#BDF4BC` (secondary), color de texto `#2C2A29` (buttonTextColor), border-radius `20px`, borde `1px solid #BDF4BC`.
2. WHEN el usuario pasa el cursor sobre un botón primario, THE MFE_Dashboard SHALL aclarar el fondo un 8% (lighten), manteniendo el color de texto `#2C2A29`.
3. WHEN un botón primario está deshabilitado, THE MFE_Dashboard SHALL aplicar opacidad `0.4` manteniendo los colores base.
4. THE MFE_Dashboard SHALL estilizar los botones secundarios con: fondo blanco, borde `1px solid #2C2A29`, color de texto `#2C2A29`, border-radius `20px`.
5. THE MFE_Dashboard SHALL usar font-size `0.875rem` (14px) para todos los botones, replicando el override del Legacy_Dashboard.

---

### Requerimiento 6: Tablas — Estilo de Datos

**User Story:** Como comerciante de Wompi, quiero que las tablas de transacciones, usuarios y otros listados se vean iguales a las del dashboard actual, para que pueda leer los datos con la misma facilidad.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL estilizar las tablas con: filas separadas por borde inferior `1px solid #eee`, padding de celda `0.5rem 0`, texto de header en color `#909399` (secondary text), texto de cuerpo en color `#606266` (regular text).
2. THE MFE_Dashboard SHALL estilizar los tags de estado en tablas con: border-radius `4px`, font-size `12px`, font-weight `400`, text-transform `capitalize`, ancho mínimo `80px`, altura `20px`, sin borde visible.
3. THE MFE_Dashboard SHALL usar los colores de tags del Legacy_Dashboard: success `#B0F2AE` con texto `#0a0a0a`, danger `#F03232` con texto blanco, warning `#F6E8AD` con texto `#0a0a0a`, info `#fff2df` con texto `#0a0a0a`, voided `#ebf4ff` con texto `#0a0a0a`, error `#FFDFDF` con texto `#0a0a0a`.
4. THE MFE_Dashboard SHALL estilizar la paginación de tablas con: font-size `13px`, botones de `35.5px × 28px`, color de hover `#2A2C29` con texto blanco.

---

### Requerimiento 7: Formularios e Inputs

**User Story:** Como comerciante de Wompi, quiero que los formularios del nuevo dashboard se vean iguales a los del dashboard actual, para que la experiencia de ingreso de datos sea consistente.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL estilizar los inputs con: altura `2.5rem` (40px), font-size `0.875rem` (14px), borde `1px solid #dcdfe6`, border-radius `4px`, color de placeholder `#c0c4cc`.
2. WHEN un input recibe foco, THE MFE_Dashboard SHALL cambiar el borde a `1px solid #BDF4BC` (secondary), replicando el override del Legacy_Dashboard.
3. WHEN un input está deshabilitado, THE MFE_Dashboard SHALL aplicar fondo `#f9fafd` y color de texto `#999`.
4. THE MFE_Dashboard SHALL estilizar los selects con la misma apariencia que los inputs, incluyendo opciones con altura `34px`, hover con fondo `#f5f7fa`.
5. THE MFE_Dashboard SHALL estilizar los date pickers con la misma apariencia visual del Legacy_Dashboard, usando el color primario `#2A2C29` para la fecha seleccionada.

---

### Requerimiento 8: Modales y Diálogos

**User Story:** Como comerciante de Wompi, quiero que los modales del nuevo dashboard se vean iguales a los del dashboard actual, para que las acciones de confirmación sean familiares.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL estilizar los modales con: border-radius `16px`, padding `40px`, centrado vertical y horizontal en la pantalla (display grid, place-items center).
2. THE MFE_Dashboard SHALL estilizar el botón de cierre del modal con font-size `32px`.
3. THE MFE_Dashboard SHALL eliminar el padding por defecto del header, body y footer del modal, aplicando margin-top `32px` solo al footer.

---

### Requerimiento 9: Notificaciones y Alertas

**User Story:** Como comerciante de Wompi, quiero que las notificaciones del nuevo dashboard se vean iguales a las del dashboard actual, para que pueda identificar rápidamente el tipo de mensaje.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL estilizar las notificaciones de éxito con: fondo `#cbe3dc`, título en color `#1A624C`.
2. THE MFE_Dashboard SHALL estilizar las notificaciones de error con: fondo `#FFEBEB`, título en color `#A01110`.
3. THE MFE_Dashboard SHALL estilizar las notificaciones de advertencia con: fondo `#FFF5E2`, título en color `#534B2C`.
4. THE MFE_Dashboard SHALL estilizar las notificaciones de información con: fondo `#EBF6FE`, título en color `#27587D`.
5. THE MFE_Dashboard SHALL estilizar las alertas con: font-size de título `0.85rem`, font-size de descripción `0.8rem`, padding `8px 16px`, border-radius `4px`.

---

### Requerimiento 10: Iconografía — Wompi Icons

**User Story:** Como comerciante de Wompi, quiero que el nuevo dashboard use los mismos iconos que el dashboard actual, para que los elementos visuales sean reconocibles.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL cargar la fuente Wompi-Icons (archivos .eot, .ttf, .woff, .svg) del Legacy_Dashboard y registrarla como `@font-face` con la familia `Wompi-Icons`.
2. THE MFE_Dashboard SHALL proveer las clases CSS `.ic` (base) y `.ic_{nombre}` (específicas) para todos los iconos usados en el sidebar, tablas y acciones del Legacy_Dashboard.
3. THE MFE_Dashboard SHALL soportar los tamaños de icono del Legacy_Dashboard: `sm` (24px), `md` (28px), `lg` (44px), `b` (56px), `xb` (72px).
4. THE MFE_Dashboard SHALL cargar la fuente waybox-icons del Legacy_Dashboard y registrar las clases `.waybox-icon` con los iconos usados en el sidebar de navegación.

---

### Requerimiento 11: Badges de Estado y Tags

**User Story:** Como comerciante de Wompi, quiero que los badges de estado (pendiente, aprobado, rechazado, etc.) del nuevo dashboard se vean iguales a los del dashboard actual, para que pueda identificar estados rápidamente.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL estilizar los badges de estado "pendiente" con: fondo `#EBF6FE`, color de texto `#27587D`, icono en color `#44769D`.
2. THE MFE_Dashboard SHALL estilizar los badges de estado "aprobado/éxito" con: fondo `#E5FBE4` (secondary-soft), color de texto `#1A624C`, icono en color `#40A940`.
3. THE MFE_Dashboard SHALL estilizar los badges de estado "rechazado/error" con: fondo `#FFEBEB` (danger-light), color de texto `#A01110`, icono en color `#F03232`.
4. THE MFE_Dashboard SHALL estilizar los badges de estado "advertencia" con: fondo `rgba(#f6c643, 0.32)`, color de texto `#ff9c1b`, icono en color `#FFA41C`.

---

### Requerimiento 12: Sandbox Mode — Indicador Visual

**User Story:** Como comerciante de Wompi, quiero que el indicador de modo sandbox del nuevo dashboard se vea igual al del dashboard actual, para que sepa claramente cuándo estoy en modo de pruebas.

#### Criterios de Aceptación

1. WHILE el usuario está en modo sandbox, THE Shell SHALL mostrar una barra superior de `3rem` de alto que desplace todo el contenido hacia abajo, replicando el comportamiento del Legacy_Dashboard.
2. WHILE la pantalla tiene un ancho menor a `48rem`, THE Shell SHALL reducir la altura de la barra sandbox a `3rem × 0.85` (2.55rem).

---

### Requerimiento 13: Responsive — Breakpoints y Adaptación Mobile

**User Story:** Como comerciante de Wompi, quiero que el nuevo dashboard se adapte a diferentes tamaños de pantalla de la misma forma que el dashboard actual, para que pueda usarlo en cualquier dispositivo.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL usar los mismos breakpoints del Legacy_Dashboard: `small: 30rem` (480px), `medium: 48rem` (768px), `large: 64rem` (1024px), `extra-large: 85rem` (1360px).
2. WHILE la pantalla tiene un ancho menor a `48rem`, THE MFE_Dashboard SHALL ocultar el sidebar y mostrar un toolbar mobile con botón hamburguesa para abrir el menú.
3. WHILE la pantalla tiene un ancho menor a `48rem`, THE MFE_Dashboard SHALL eliminar el padding-left del body y ajustar el padding del contenido a `1.5rem 1rem`.

---

### Requerimiento 14: Sombras, Bordes y Esquinas

**User Story:** Como comerciante de Wompi, quiero que las tarjetas, contenedores y elementos del nuevo dashboard tengan las mismas sombras y bordes que el dashboard actual, para que la profundidad visual sea consistente.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL usar la sombra principal del Legacy_Dashboard para content boxes: `0px 1px 4px rgba(0, 0, 0, 0.102751)`.
2. THE MFE_Dashboard SHALL usar border-radius `20px` para content boxes y `4px` para inputs, tags y elementos pequeños, replicando los valores del Legacy_Dashboard.
3. THE MFE_Dashboard SHALL usar border-radius `20px` para botones, replicando el override global del Legacy_Dashboard sobre Element UI.
4. THE MFE_Dashboard SHALL usar el color de borde base `#eee` para separadores y contenedores, y `#dcdfe6` para inputs y controles de formulario.

---

### Requerimiento 15: Detalles de Transacción — Vista de Detalle

**User Story:** Como comerciante de Wompi, quiero que la vista de detalle de transacciones del nuevo dashboard se vea igual a la del dashboard actual, para que pueda revisar la información con la misma claridad.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL estilizar las filas de detalle con: borde inferior `1px solid #eee`, padding `0.4rem 0`, font-size `0.85rem`, line-height `2.2em`, label en color `#555555` (text-light) a la izquierda y valor en color `#252525` (text) con font-weight bold a la derecha.
2. THE MFE_Dashboard SHALL estilizar los valores de tipo URL con: font-family `monospace`, font-size `0.9em`, word-break `break-all`.

---

### Requerimiento 16: Home Dashboard — Tarjetas de Balance

**User Story:** Como comerciante de Wompi, quiero que las tarjetas de balance del home del nuevo dashboard se vean iguales a las del dashboard actual, para que pueda ver mis saldos con la misma presentación.

#### Criterios de Aceptación

1. THE MFE_Dashboard SHALL estilizar las tarjetas de balance con: fondo `#F2FDF1` (secondary-background), borde `1px solid #2C2A29`, border-radius `16px`, padding `24px`, min-height `120px`, display flex con alineación centrada.
2. THE MFE_Dashboard SHALL estilizar el icono de balance con: fondo circular `#2A2C29` (primary) de `3rem` de diámetro, icono en color `#DFFF61` (secondary-light).
3. THE MFE_Dashboard SHALL estilizar la tarjeta de nota destacada con: fondo `#DFFF61` (secondary-light), borde `1px solid #2C2A29`, border-radius `16px`, padding `16px 28px`, título en font-size `14px` font-weight `700`.


---

### Requerimiento 17: Login — Layout y Estructura Visual

**User Story:** Como comerciante de Wompi, quiero que la página de login del nuevo dashboard se vea igual a la del login actual, para que la experiencia de inicio de sesión sea familiar y confiable.

#### Criterios de Aceptación

1. THE Login_Layout SHALL usar una estructura de grid de 12 columnas con: imagen de banner con border-radius `32px` en las columnas 1-5 (lado izquierdo) y formulario de login en las columnas 7-12 (lado derecho), centrado vertical, max-width `1140px`.
2. WHILE la pantalla tiene un ancho menor a `768px` (breakpoint md), THE Login_Layout SHALL ocultar la imagen de banner y mostrar solo el formulario centrado.
3. THE Login_Layout SHALL mostrar el logo de Wompi (imagen `wompi-logo-black.png`) con dimensiones `160×51px` y margin-bottom `53px` (o `35px` en modo nickname) sobre el formulario.
4. THE Login_Layout SHALL usar fondo blanco (`#FFFFFF`) para toda la página, replicando el estilo de la Login_App actual.

---

### Requerimiento 18: Login — Tipografía y Headings

**User Story:** Como comerciante de Wompi, quiero que los títulos y textos de la página de login se vean iguales a los del login actual, para que la identidad visual sea consistente.

#### Criterios de Aceptación

1. THE Login_Layout SHALL usar la fuente `CIBFontSans Bold` (wompi-font) para headings, cargada desde archivos .woff2 y .woff.
2. THE Login_Layout SHALL usar la fuente `Open Sans, sans-serif` para el body text.
3. THE Login_Layout SHALL usar las siguientes escalas de heading: h1 `2rem` (32px) bold, h2 `1.75rem` (28px) bold, h3 `1.5rem` (24px) bold, h4 `1.25rem` (20px) bold, h5 `1.125rem` (18px) bold.
4. THE Login_Layout SHALL usar color de texto `#2C2A29` (black) para todos los headings y textos del body.
5. THE Login_Layout SHALL usar letter-spacing negativo para headings: h1 `-0.006em`, h2 `-0.006em`, h3 `-0.0045em`, h4 `-0.0038em`.

---

### Requerimiento 19: Login — Botones y Formulario

**User Story:** Como comerciante de Wompi, quiero que los botones y campos del formulario de login se vean iguales a los del login actual, para que la interacción sea intuitiva.

#### Criterios de Aceptación

1. THE Login_Layout SHALL estilizar el botón primario de login con: fondo `#B0F2AE` (primary.500), color de texto `#2C2A29` (black), border-radius `25px`, min-width `146px`, altura `48px` para el botón principal de submit, font-weight `600` (semibold).
2. WHEN el usuario pasa el cursor sobre el botón primario, THE Login_Layout SHALL cambiar el fondo a `#72C571` (primary.600) y agregar box-shadow `0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 6px rgba(0, 0, 0, 0.15)`.
3. WHEN el botón primario está deshabilitado, THE Login_Layout SHALL cambiar el fondo a `#CACACA` (gray.400) y el color de texto a `#616161` (gray.600).
4. THE Login_Layout SHALL estilizar el botón secundario ("Crear cuenta") con: fondo transparente, borde `1px solid #2C2A29`, color de texto `#2C2A29`, border-radius `25px`.
5. THE Login_Layout SHALL estilizar los enlaces tipo link ("¿Olvidaste tu contraseña?") con: color `#2C2A29`, text-decoration underline, sin borde ni fondo.
6. THE Login_Layout SHALL estilizar los campos de input del formulario con: gap de `25px` entre campos (o `15px` en modo nickname), iconos a la izquierda del input usando Wompi-Icons.

---

### Requerimiento 20: Login — Paleta de Colores Extendida

**User Story:** Como comerciante de Wompi, quiero que los colores del login del nuevo dashboard sigan la paleta oficial de Wompi, para que la marca sea consistente en toda la experiencia.

#### Criterios de Aceptación

1. THE Tailwind_Config SHALL incluir la paleta de colores extendida de la Login_App: primary scale (900: `#006600`, 800: `#339933`, 700: `#40A940`, 600: `#72C571`, 500: `#B0F2AE`, 400: `#BDF4BC`, 300: `#D8F9D7`, 200: `#E5FBE4`, 100: `#F2FDF1`).
2. THE Tailwind_Config SHALL incluir la escala secondaryA (verde oscuro): 900: `#233C33`, 800: `#1A4D3D`, 700: `#125F46`, 600: `#097050`, 500: `#00825A`, 400: `#329A7A`, 300: `#64B29A`, 200: `#96CABA`, 100: `#C8E2DA`.
3. THE Tailwind_Config SHALL incluir la escala secondaryB (azul): 900: `#27587D`, 800: `#44769D`, 700: `#6094BD`, 600: `#7CB3DC`, 500: `#99D1FC`, 400: `#ADDAFD`, 300: `#C2E3FD`, 200: `#D6EDFE`, 100: `#EBF6FE`.
4. THE Tailwind_Config SHALL incluir la escala tertiary (verde lima): 500: `#DFFF61`, 400: `#E5FF81`, 300: `#ECFFA0`, 200: `#F2FFC0`, 100: `#F9FFDF`.
5. THE Tailwind_Config SHALL incluir las escalas semánticas: success (500: `#0E8763`), warning (500: `#F0CE3A`), issue (500: `#ED0000`, 700: `#A01110`), gray (700: `#464646`, 600: `#616161`, 500: `#969696`, 400: `#CACACA`, 300: `#E4E4E4`, 200: `#F2F2F2`).

---

### Requerimiento 21: Login — Footer

**User Story:** Como comerciante de Wompi, quiero que el footer de la página de login se vea igual al del login actual, para que la información legal y de marca sea visible.

#### Criterios de Aceptación

1. THE Login_Footer SHALL tener una altura de `70px` en desktop y `218px` en mobile, posición sticky en bottom, fondo blanco, borde superior `1px solid #616161` (gray.600).
2. THE Login_Footer SHALL mostrar: logo Wompi (120×40px) con margin-right `50px`, enlaces de "Términos y condiciones" y "Política de privacidad" como links con estilo underline en color `#2C2A29`, y texto de copyright alineado a la derecha en desktop.
3. THE Login_Footer SHALL usar layout flex-column en mobile (< 768px) y flex-row en desktop, con padding `16px`, gap de `20px` entre elementos en desktop y `15px` en mobile.

---

### Requerimiento 22: Login — Notificaciones Toast

**User Story:** Como comerciante de Wompi, quiero que las notificaciones de error y éxito en el login se vean iguales a las del login actual, para que pueda identificar rápidamente el resultado de mis acciones.

#### Criterios de Aceptación

1. THE Login_Layout SHALL mostrar notificaciones toast de error con: tipo `error`, título y descripción traducidos, usando los colores de issue (fondo derivado de `#F7C8C8`, texto `#A01110`).
2. THE Login_Layout SHALL mostrar notificaciones toast de warning con: tipo `warning`, usando los colores de warning (fondo derivado de `#F8F1D4`, texto `#534B2C`).
3. THE Login_Layout SHALL mostrar notificaciones toast de éxito con: tipo `success`, usando los colores de success (fondo derivado de `#CBE3DC`, texto `#1A624C`).

---

### Requerimiento 23: Login — InfoCard y Alertas

**User Story:** Como comerciante de Wompi, quiero que las tarjetas informativas del login se vean iguales a las del login actual, para que los mensajes importantes sean claros.

#### Criterios de Aceptación

1. THE Login_Layout SHALL estilizar las InfoCards con: min-height `82px`, ancho `328px` en mobile y `360px` en desktop, margin `0 0 24px`, con icono a la izquierda y texto descriptivo en font-size `0.75rem` (xs).
2. THE Login_Layout SHALL usar la sombra base `0px 1px 4px rgba(0, 0, 0, 0.102751)` para las InfoCards, replicando el token de sombra de la Login_App.
