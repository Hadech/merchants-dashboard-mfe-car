# Implementation Plan: UI Fidelity — Acoplar MFE al Dashboard Legacy

## Overview

Implementar la capa de estilos y componentes visuales que replican fielmente la apariencia del merchants-dashboard legacy (Nuxt 1, Element UI, SASS) en el nuevo MFE (Nuxt 4, Nuxt UI, Tailwind CSS), incluyendo el layout de login. El enfoque es foundation-first: tokens → CSS global → componentes → layouts → páginas específicas.

Todos los archivos se crean dentro de `apps/shell/` siguiendo la estructura Nuxt 4 (`app/` directory).

## Tasks

- [x] 1. Design Tokens y Configuración Base
  - [x] 1.1 Crear `tailwind.config.ts` con todos los design tokens del legacy
    - Definir colores primarios, secundarios, semánticos, de fondo, texto, borde y badges
    - Definir paleta extendida de login (primary, secondaryA, secondaryB, tertiary, success, warning, issue, gray)
    - Definir font families (sans, open-sans, cib-bold, mono)
    - Definir font sizes (xs, sm, md, lg, xl) con line-heights calculados
    - Definir spacing custom (sidebar, topbar, sandbox-bar)
    - Definir maxWidth (container, login), borderRadius, boxShadow, screens/breakpoints
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 13.1, 14.1, 14.2, 14.3, 14.4, 20.1, 20.2, 20.3, 20.4, 20.5_

  - [x] 1.2 Crear `app.config.ts` con Nuxt UI theme overrides
    - Configurar button (rounded, font, color variants primary/secondary)
    - Configurar input (rounded, size, color outline con focus secondary)
    - Configurar select, modal, table, notification, pagination
    - _Requirements: 1.6, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.4, 7.1, 7.2, 7.4, 8.1, 8.2, 8.3, 9.5_

  - [ ]* 1.3 Write unit tests for tailwind.config.ts token values
    - Importar el config y verificar que cada token de color, font, spacing, shadow tiene el valor exacto del legacy
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 2. Fuentes e Iconos — Assets y CSS Global
  - [x] 2.1 Copiar archivos de fuentes del legacy al MFE
    - Copiar Wompi-Icons (.eot, .ttf, .woff, .svg) a `app/assets/fonts/`
    - Copiar waybox-icons (.eot, .ttf, .woff, .svg) a `app/assets/fonts/`
    - Copiar CIBFontSans-Bold (.woff2, .woff) a `app/assets/fonts/`
    - Copiar OpenSans (Regular, SemiBold, Bold .ttf) a `app/assets/fonts/`
    - _Requirements: 2.1, 2.2, 10.1, 10.4, 18.1_

  - [x] 2.2 Crear `app/assets/css/global.css` con reset, font-face y estilos base
    - Definir `@font-face` para CIBFontSans Bold, Open Sans (400, 600, 700)
    - Configurar html (font-size 16px, font-weight 400, word-spacing 1px, font-smoothing)
    - Configurar body (font-family Source Sans Pro stack, bg #f9f9f9, color #252525)
    - Agregar clase `.dashboard-body` con padding-left sidebar y responsive
    - _Requirements: 2.1, 2.3, 2.5, 4.1_

  - [x] 2.3 Crear `app/assets/css/wompi-icons.css` con todas las clases de iconos
    - Definir `@font-face` para Wompi-Icons
    - Crear clase base `.ic` (font-family, font-style, font-weight, etc.)
    - Crear clases `.ic_{nombre}:before` con content unicode para cada icono del legacy
    - Crear clases de tamaño: `.ic-sm` (24px), `.ic-md` (28px), `.ic-lg` (44px), `.ic-b` (56px), `.ic-xb` (72px)
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 2.4 Crear `app/assets/css/waybox-icons.css` con clases waybox-icon
    - Definir `@font-face` para waybox-icons
    - Crear clases `.waybox-icon` y `.waybox-icon-{nombre}:before`
    - _Requirements: 10.4_

  - [x] 2.5 Crear `app/assets/css/legacy-overrides.css` con estilos legacy globales
    - Definir `.content-box` (border-radius 20px, shadow, border, padding responsive)
    - Definir `.details-table` con filas, labels y values estilizados
    - Definir estilos de view-content con padding responsive
    - _Requirements: 4.3, 4.4, 15.1, 15.2_

  - [ ]* 2.6 Write property test for Wompi-Icons CSS class mapping
    - **Property 6: Wompi-Icons CSS class mapping**
    - Para cada icon name del set legacy, verificar que la clase CSS `.ic_{name}:before` tiene el content correcto
    - **Validates: Requirements 10.2**

- [x] 3. Checkpoint — Verificar tokens, fuentes e iconos
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar que `tailwind.config.ts` compila sin errores
  - Verificar que las fuentes cargan correctamente en el navegador
  - Verificar que los iconos Wompi-Icons renderizan correctamente

- [x] 4. Componentes UI Compartidos
  - [x] 4.1 Crear componente `WContentBox.vue`
    - Wrapper con clase `.content-box` (border-radius 20px, shadow, border #eee, bg white)
    - Slot default para contenido
    - Padding responsive (0.9rem mobile, 1.1rem desktop)
    - _Requirements: 4.3, 14.1, 14.2, 14.4_

  - [x] 4.2 Crear componente `WStatusBadge.vue`
    - Props: `status` (pending | success | danger | warning), `label`, `icon?`
    - Mapear cada status a colores exactos de fondo, texto e icono del design
    - Renderizar icono Wompi-Icons si se provee, con el color correspondiente
    - Border-radius 4px, font-size 12px, font-weight 400, text-transform capitalize, min-width 80px, height 20px
    - _Requirements: 6.2, 6.3, 11.1, 11.2, 11.3, 11.4_

  - [ ]* 4.3 Write property test for WStatusBadge color mapping
    - **Property 4: Status badge color mapping**
    - Para cada status type aleatorio del set válido, renderizar WStatusBadge y verificar colores exactos de bg, text e icon
    - **Validates: Requirements 6.2, 6.3, 11.1, 11.2, 11.3, 11.4**

  - [x] 4.4 Crear componente `WDetailsTable.vue`
    - Props: `rows` array de `{ name: string, value: string, isUrl?: boolean }`
    - Renderizar filas con borde inferior #eee, label en #555555, value en #252525 bold
    - Valores URL con font-family monospace, font-size 0.9em, word-break break-all
    - _Requirements: 15.1, 15.2_

  - [x] 4.5 Crear componente `WBalanceCard.vue`
    - Props: `icon`, `title`, `amount`, `currency?`
    - Fondo #F2FDF1, borde 1px solid #2C2A29, border-radius 16px, padding 24px, min-height 120px
    - Icono circular: fondo #2A2C29 de 3rem, icono en #DFFF61
    - Display flex con alineación centrada
    - _Requirements: 16.1, 16.2_

  - [x] 4.6 Crear componente `AppSandboxBar.vue`
    - Barra superior de 3rem de alto que desplaza contenido
    - Responsive: 2.55rem en mobile (< 48rem)
    - _Requirements: 12.1, 12.2_

  - [ ]* 4.7 Write unit tests for WContentBox, WDetailsTable, WBalanceCard
    - Snapshot tests verificando estructura DOM y clases CSS
    - Test de WBalanceCard verificando icono circular y colores
    - Test de WDetailsTable verificando renderizado de filas y estilo URL
    - _Requirements: 4.3, 15.1, 15.2, 16.1, 16.2_

- [x] 5. Componente AppSidebar — Navegación Principal
  - [x] 5.1 Crear componente `AppSidebar.vue` con estructura base
    - Props: `menuItems: MenuItem[]`, `isSandbox: boolean`, `isOpen: boolean`
    - Emits: `close`, `navigate`, `logout`
    - Ancho fijo 16.3rem, position fixed, fondo blanco, box-shadow inset
    - Header de 6.25rem con logo Wompi centrado
    - Sección inferior fija (position absolute, bottom 0) con borde superior #CACACA
    - _Requirements: 3.1, 3.2, 3.7_

  - [x] 5.2 Implementar renderizado de ítems de menú con iconos y texto
    - Icono Wompi-Icons (font-size 1.5rem, color #2A2C29) + texto (font-size 1rem)
    - Altura de ítem 2.5rem, padding 0.53125rem 5%
    - Hover: fondo #D8F9D7, border-radius 0.4rem
    - Seleccionado: fondo #2C2A29, texto/icono #DFFF61, border-radius 0.5rem
    - _Requirements: 3.3, 3.4, 3.5_

  - [ ]* 5.3 Write property test for menu item rendering
    - **Property 1: Menu item rendering preserves icon and text**
    - Generar arrays aleatorios de MenuItem con icon y name, verificar que cada item tiene `<i>` con clase `ic ic_{icon}` y `<span>` con el name
    - **Validates: Requirements 3.3**

  - [ ]* 5.4 Write property test for selected menu item visual state
    - **Property 2: Selected menu item applies correct visual state**
    - Generar array de menu items, seleccionar uno aleatorio como ruta activa, verificar que solo ese item tiene bg #2C2A29 y color #DFFF61
    - **Validates: Requirements 3.5**

  - [x] 5.5 Implementar submenús desplegables
    - Flecha indicadora (ángulo arriba/abajo) para ítems con subItems
    - Sub-ítems con indentación, línea vertical gris #CACACA, punto indicador #616161
    - Animación de apertura/cierre
    - _Requirements: 3.6_

  - [ ]* 5.6 Write property test for submenu dropdown rendering
    - **Property 3: Menu items with subItems render as dropdowns**
    - Generar menu items con subItems aleatorios, verificar que se renderizan como dropdowns con toggle arrow y nested elements
    - **Validates: Requirements 3.6**

  - [x] 5.7 Implementar responsive mobile del sidebar
    - Mobile (< 48rem): width 100%, overlay, transición margin-left -100vw
    - Cerrar automáticamente al navegar
    - Botón hamburguesa en toolbar mobile
    - _Requirements: 3.8, 13.2_

- [x] 6. Checkpoint — Verificar componentes y sidebar
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar que el sidebar renderiza correctamente con datos de prueba
  - Verificar que los componentes WStatusBadge, WBalanceCard, WContentBox se ven como el legacy

- [x] 7. Layout Dashboard — Default Layout
  - [x] 7.1 Crear `app/layouts/default.vue` con sidebar + header + content area
    - Integrar AppSidebar, AppHeader, AppSandboxBar
    - Content area con padding-left igual al sidebar (16.3rem)
    - Fondo #f9f9f9 para toda la zona de contenido
    - Max-width 74.25rem centrado horizontalmente
    - Padding de contenido: 1.5rem 1rem mobile, 2rem 2.375rem desktop
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 13.3_

  - [x] 7.2 Crear componente `AppHeader.vue`
    - Mostrar nombre del merchant, ambiente activo (sandbox/producción)
    - Controles de usuario
    - _Requirements: 4.1_

  - [ ]* 7.3 Write unit tests for default layout structure
    - Verificar que el layout incluye sidebar, header y content area
    - Verificar padding-left y max-width del contenido
    - Verificar responsive (sin padding-left en mobile)
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 13.3_

- [x] 8. Notificaciones y Alertas — Toast System
  - [x] 8.1 Crear composable `useWompiToast` que wrappea `useToast()` de Nuxt UI
    - Mapear tipos (success, error, warning, info) a colores exactos del legacy
    - Success: bg #cbe3dc, título #1A624C
    - Error: bg #FFEBEB, título #A01110
    - Warning: bg #FFF5E2, título #534B2C
    - Info: bg #EBF6FE, título #27587D
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [ ]* 8.2 Write property test for notification type-to-color mapping
    - **Property 5: Notification type-to-color mapping**
    - Para cada notification type aleatorio, verificar que los colores de fondo y título coinciden con el mapa
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 22.1, 22.2, 22.3**

- [x] 9. Login Layout y Estilos
  - [x] 9.1 Crear `app/assets/css/login.css` con estilos específicos del login
    - Tipografía login: headings con CIBFontSans Bold, body con Open Sans
    - Escala de headings: h1 2rem, h2 1.75rem, h3 1.5rem, h4 1.25rem, h5 1.125rem (todos bold)
    - Letter-spacing negativo: h1 -0.006em, h2 -0.006em, h3 -0.0045em, h4 -0.0038em
    - Color de texto #2C2A29 para headings y body
    - Botón primario login: bg #B0F2AE, text #2C2A29, border-radius 25px, min-width 146px, height 48px
    - Botón hover: bg #72C571, box-shadow 0px 1px 3px rgba(0,0,0,0.3), 0px 1px 6px rgba(0,0,0,0.15)
    - Botón disabled: bg #CACACA, text #616161
    - Botón secundario: bg transparente, borde 1px solid #2C2A29, border-radius 25px
    - Links: color #2C2A29, text-decoration underline
    - Input gap: 25px entre campos (15px en modo nickname)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

  - [ ]* 9.2 Write property test for login heading typography scale
    - **Property 7: Login heading typography scale**
    - Para cada heading level (h1-h5), verificar font-size, font-weight y letter-spacing correctos
    - **Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5**

  - [x] 9.3 Crear `app/layouts/login.vue` con grid 12 columnas
    - Columnas 1-5: imagen banner con border-radius 32px
    - Columnas 7-12: formulario de login
    - Centrado vertical, max-width 1140px
    - Mobile (< 768px): solo formulario centrado, sin imagen
    - Logo Wompi 160×51px, margin-bottom 53px
    - Fondo blanco #FFFFFF
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

  - [x] 9.4 Crear componente de Login Footer
    - Height 70px desktop, 218px mobile
    - Sticky bottom, fondo blanco, borde superior 1px solid #616161
    - Logo 120×40px, margin-right 50px
    - Enlaces de términos y copyright
    - Flex-row desktop, flex-column mobile, padding 16px, gap 20px desktop / 15px mobile
    - _Requirements: 21.1, 21.2, 21.3_

  - [x] 9.5 Crear componente `WInfoCard.vue` para alertas del login
    - Min-height 82px, ancho 328px mobile / 360px desktop
    - Margin 0 0 24px, icono a la izquierda, texto en font-size 0.75rem
    - Sombra base 0px 1px 4px rgba(0,0,0,0.102751)
    - _Requirements: 23.1, 23.2_

  - [ ]* 9.6 Write unit tests for login layout and footer
    - Verificar grid structure (12 columnas, imagen cols 1-5, form cols 7-12)
    - Verificar footer dimensions y responsive
    - Verificar logo placement y dimensiones
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 21.1, 21.2, 21.3_

- [x] 10. Login — Toast Notifications
  - [x] 10.1 Extender `useWompiToast` para soportar estilos de login
    - Toast error login: fondo derivado de #F7C8C8, texto #A01110
    - Toast warning login: fondo derivado de #F8F1D4, texto #534B2C
    - Toast success login: fondo derivado de #CBE3DC, texto #1A624C
    - _Requirements: 22.1, 22.2, 22.3_

- [x] 11. Registrar CSS global en `nuxt.config.ts`
  - [x] 11.1 Actualizar `nuxt.config.ts` para importar todos los CSS globales
    - Agregar global.css, wompi-icons.css, waybox-icons.css, legacy-overrides.css a `css` array
    - Agregar Google Fonts (Source Sans Pro) via link o @import
    - Verificar que Tailwind config se aplica correctamente
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 10.1, 10.4_

- [x] 12. Tarjeta de Nota Destacada del Home
  - [x] 12.1 Crear componente `WHighlightCard.vue`
    - Fondo #DFFF61 (secondary-light), borde 1px solid #2C2A29, border-radius 16px
    - Padding 16px 28px, título font-size 14px font-weight 700
    - _Requirements: 16.3_

- [x] 13. Formularios — Estilos Adicionales
  - [x] 13.1 Crear `app/assets/css/forms-overrides.css` para estilos de formulario no cubiertos por Nuxt UI theme
    - Input disabled: fondo #f9fafd, color #999
    - Placeholder color: #c0c4cc
    - Select options: altura 34px, hover fondo #f5f7fa
    - Date picker: color primario #2A2C29 para fecha seleccionada
    - _Requirements: 7.3, 7.4, 7.5_

- [x] 14. Final checkpoint — Verificar fidelidad visual completa
  - Ensure all tests pass, ask the user if questions arise.
  - Comparar visualmente sidebar, content-box, tablas, formularios, modales y login con el legacy
  - Verificar responsive en mobile y desktop
  - Verificar que todos los 23 requerimientos están cubiertos

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design (7 properties)
- Unit tests validate specific examples and edge cases
- Prioridad hackathon: Tasks 1-7 tienen el mayor impacto visual (tokens + CSS + sidebar + layout)
- Los archivos de fuentes deben copiarse del legacy (`merchants-dashboard/assets/fonts/` y `merchants-dashboard/element-theme/`)
- Usar `fast-check` como librería de property-based testing para Vue/TypeScript
