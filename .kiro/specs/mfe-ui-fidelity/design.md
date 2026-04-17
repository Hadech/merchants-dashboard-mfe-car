# Design Document — UI Fidelity: Acoplar MFE al Dashboard Legacy

## Overview

Este diseño define cómo replicar fielmente la apariencia visual del merchants-dashboard legacy (Nuxt 1, Vue 2, Element UI, SASS) en el nuevo merchants-dashboard-mfe (Nuxt 4, Vue 3, Nuxt UI, Tailwind CSS), incluyendo la página de login (Next.js, Chakra UI).

La estrategia se basa en tres pilares:
1. **Design Tokens en Tailwind**: Migrar todas las variables SASS del legacy a `tailwind.config.ts`
2. **Nuxt UI Theme Override**: Personalizar componentes Nuxt UI via `app.config.ts` para que coincidan con Element UI
3. **CSS Global Overrides**: Estilos globales para fuentes, iconos y overrides que no se pueden lograr solo con Tailwind/Nuxt UI

### Decisiones de Diseño Clave

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| Sistema de tokens | Tailwind `extend` | Permite usar clases utilitarias con los colores exactos del legacy |
| Componentes UI | Nuxt UI + theme override | Nuxt UI ya está en el stack; personalizar es más rápido que crear desde cero |
| Iconos | Copiar font files + CSS global | Los ~200 iconos Wompi-Icons son una fuente custom, no hay alternativa SVG |
| Fuentes | Google Fonts + archivos locales | Source Sans Pro via Google Fonts; CIBFontSans y Open Sans como archivos locales |
| Layout sidebar | Componente Vue custom | El sidebar tiene lógica compleja de menú que no mapea a ningún componente Nuxt UI |
| Login styles | CSS scoped en layout de login | El login tiene su propia paleta extendida y tipografía diferente |

## Architecture

### Diagrama de Capas de Estilo

```mermaid
graph TD
    A[tailwind.config.ts] -->|Design Tokens| B[Clases Utilitarias Tailwind]
    C[app.config.ts] -->|Nuxt UI Theme| D[Componentes Nuxt UI]
    E[assets/css/global.css] -->|@font-face, .ic classes| F[Fuentes e Iconos]
    G[assets/css/legacy-overrides.css] -->|Overrides globales| H[Estilos Legacy]
    
    B --> I[Componentes Vue]
    D --> I
    F --> I
    H --> I
    
    J[assets/css/login.css] -->|Login-specific| K[Login Layout]
```

### Estructura de Archivos

```
apps/shell/
├── app/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── global.css          # Reset, font-face, font-smoothing
│   │   │   ├── wompi-icons.css     # .ic classes (~200 iconos)
│   │   │   ├── waybox-icons.css    # .waybox-icon classes
│   │   │   ├── legacy-overrides.css # Content-box, details-table, tags
│   │   │   └── login.css           # Login-specific styles
│   │   └── fonts/
│   │       ├── Wompi-Icons.{eot,ttf,woff,svg}
│   │       ├── waybox-icons.{eot,ttf,woff,svg}
│   │       ├── CIBFontSans-Bold.{woff2,woff}
│   │       ├── OpenSans-Regular.ttf
│   │       ├── OpenSans-SemiBold.ttf
│   │       └── OpenSans-Bold.ttf
│   ├── components/
│   │   ├── AppSidebar.vue          # Sidebar de navegación
│   │   ├── AppHeader.vue           # Header con merchant name + env
│   │   ├── AppSandboxBar.vue       # Barra indicadora de sandbox
│   │   ├── WContentBox.vue         # Contenedor con sombra y bordes
│   │   ├── WStatusBadge.vue        # Badges de estado
│   │   ├── WDetailsTable.vue       # Tabla de detalle key-value
│   │   └── WBalanceCard.vue        # Tarjetas de balance del home
│   └── layouts/
│       ├── default.vue             # Layout dashboard (sidebar + header + content)
│       └── login.vue               # Layout login (grid 12 cols + footer)
├── tailwind.config.ts              # Design tokens
├── app.config.ts                   # Nuxt UI theme
└── nuxt.config.ts
```

## Components and Interfaces

### 1. Design Tokens — `tailwind.config.ts`

Extiende la configuración de Tailwind con todos los tokens del legacy:

```typescript
import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        // === Core Wompi Palette ===
        primary: {
          DEFAULT: '#2A2C29',
          text: '#2C2A29',
          light: '#e4ddff',
        },
        secondary: {
          DEFAULT: '#BDF4BC',
          light: '#DFFF61',
          hard: '#00825A',
          soft: '#E5FBE4',
          background: '#F2FDF1',
          text: '#38805B',
        },
        
        // === Background Colors ===
        surface: {
          primary: '#f9f9f9',
          secondary: '#fff',
          tertiary: '#f1f1f1',
          soft: '#E5E5E5',
        },
        
        // === Text Colors ===
        content: {
          DEFAULT: '#252525',
          dark: '#0a0a0a',
          light: '#555555',
          lighter: '#999',
          lightest: '#ccc',
        },
        
        // === Semantic Colors ===
        success: {
          DEFAULT: '#B0F2AE',
          light: '#e8f8ee',
          icon: '#40A940',
        },
        warning: {
          DEFAULT: '#ff9c1b',
          light: '#fff2df',
          icon: '#FFA41C',
        },
        danger: {
          DEFAULT: '#f64d79',
          light: '#FFEBEB',
          icon: '#F03232',
        },
        info: {
          DEFAULT: '#4376ff',
          dark: '#3662d9',
          light: '#d6e1ff',
        },
        voided: {
          DEFAULT: '#409eff',
          light: '#ebf4ff',
        },
        
        // === Border Colors ===
        border: {
          DEFAULT: '#eee',
          hover: '#B4C8FF',
          input: '#dcdfe6',
        },
        
        // === Badge Colors ===
        badge: {
          pending: { bg: '#EBF6FE', text: '#27587D', icon: '#44769D' },
          success: { bg: '#E5FBE4', text: '#1A624C', icon: '#40A940' },
          danger: { bg: '#FFEBEB', text: '#A01110', icon: '#F03232' },
          warning: { bg: 'rgba(246, 198, 67, 0.32)', text: '#ff9c1b', icon: '#FFA41C' },
        },
        
        // === Notification Colors ===
        notify: {
          success: { bg: '#cbe3dc', text: '#1A624C' },
          error: { bg: '#FFEBEB', text: '#A01110' },
          warning: { bg: '#FFF5E2', text: '#534B2C' },
          info: { bg: '#EBF6FE', text: '#27587D' },
        },
        
        // === Login Extended Palette ===
        'login-primary': {
          900: '#006600', 800: '#339933', 700: '#40A940',
          600: '#72C571', 500: '#B0F2AE', 400: '#BDF4BC',
          300: '#D8F9D7', 200: '#E5FBE4', 100: '#F2FDF1',
        },
        'login-secondaryA': {
          900: '#233C33', 800: '#1A4D3D', 700: '#125F46',
          600: '#097050', 500: '#00825A', 400: '#329A7A',
          300: '#64B29A', 200: '#96CABA', 100: '#C8E2DA',
        },
        'login-secondaryB': {
          900: '#27587D', 800: '#44769D', 700: '#6094BD',
          600: '#7CB3DC', 500: '#99D1FC', 400: '#ADDAFD',
          300: '#C2E3FD', 200: '#D6EDFE', 100: '#EBF6FE',
        },
        'login-tertiary': {
          500: '#DFFF61', 400: '#E5FF81', 300: '#ECFFA0',
          200: '#F2FFC0', 100: '#F9FFDF',
        },
        'login-success': { 500: '#0E8763' },
        'login-warning': { 500: '#F0CE3A' },
        'login-issue': { 500: '#ED0000', 700: '#A01110' },
        'login-gray': {
          700: '#464646', 600: '#616161', 500: '#969696',
          400: '#CACACA', 300: '#E4E4E4', 200: '#F2F2F2',
        },
      },
      
      fontFamily: {
        sans: ['"Source Sans Pro"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'open-sans': ['"Open Sans"', 'sans-serif'],
        'cib-bold': ['"CIBFontSans Bold"', 'sans-serif'],
        mono: ['monospace'],
      },
      
      fontSize: {
        'xs': ['0.625rem', { lineHeight: 'calc(0.625rem + 4px)' }],
        'sm': ['0.75rem', { lineHeight: 'calc(0.75rem + 4px)' }],
        'md': ['0.875rem', { lineHeight: 'calc(0.875rem + 4px)' }],
        'lg': ['1rem', { lineHeight: 'calc(1rem + 4px)' }],
        'xl': ['1.25rem', { lineHeight: 'calc(1.25rem + 4px)' }],
      },
      
      spacing: {
        'sidebar': '16.3rem',       // 261px
        'topbar': '6.25rem',        // 100px
        'sandbox-bar': '3rem',      // 48px
      },
      
      maxWidth: {
        'container': '74.25rem',    // 1188px
        'login': '1140px',
      },
      
      borderRadius: {
        'content': '20px',
        'button': '20px',
        'input': '4px',
        'tag': '4px',
        'modal': '16px',
        'card': '16px',
        'login-image': '32px',
        'login-button': '25px',
      },
      
      boxShadow: {
        'content': '0px 1px 4px rgba(0, 0, 0, 0.102751)',
        'sidebar': '-0.063rem 0rem 0.375rem 0rem rgba(0,0,0,0.1) inset',
        'login-hover': '0px 1px 3px rgba(0, 0, 0, 0.3), 0px 1px 6px rgba(0, 0, 0, 0.15)',
      },
      
      screens: {
        'sm': '30rem',    // 480px
        'md': '48rem',    // 768px
        'lg': '64rem',    // 1024px
        'xl': '85rem',    // 1360px
      },
    },
  },
}
```

### 2. Nuxt UI Theme — `app.config.ts`

```typescript
export default defineAppConfig({
  ui: {
    primary: 'primary',
    gray: 'neutral',
    
    button: {
      rounded: 'rounded-button',
      font: 'font-semibold text-md',
      default: {
        size: 'md',
      },
      color: {
        primary: {
          solid: 'bg-secondary text-primary-text border border-secondary hover:bg-secondary/90 disabled:opacity-40',
        },
        secondary: {
          outline: 'bg-white text-primary-text border border-primary-text hover:bg-gray-50',
        },
      },
    },
    
    input: {
      rounded: 'rounded-input',
      size: { md: 'h-10' },  // 40px = 2.5rem
      color: {
        white: {
          outline: 'border-border-input focus:border-secondary focus:ring-secondary/20',
        },
      },
      default: { size: 'md' },
    },
    
    select: {
      rounded: 'rounded-input',
      default: { size: 'md' },
    },
    
    modal: {
      rounded: 'rounded-modal',
      padding: 'p-10',  // 40px
      overlay: { background: 'bg-black/50' },
    },
    
    table: {
      th: { color: 'text-[#909399]', font: 'font-normal' },
      td: { color: 'text-[#606266]', padding: 'py-2 px-0' },
      divide: 'divide-border',
    },
    
    notification: {
      rounded: 'rounded-lg',
    },
    
    pagination: {
      rounded: 'rounded',
      default: { size: 'sm' },
    },
  },
})
```

### 3. Global CSS — `assets/css/global.css`

```css
/* === Base Reset & Font Rendering === */
html {
  font-size: 16px;
  font-weight: 400;
  word-spacing: 1px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;
  background-color: #f9f9f9;
  color: #252525;
}

/* === Font Faces === */
@font-face {
  font-family: "CIBFontSans Bold";
  src: url("../fonts/CIBFontSans-Bold.woff2") format("woff2"),
       url("../fonts/CIBFontSans-Bold.woff") format("woff");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Open Sans";
  src: url("../fonts/OpenSans-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Open Sans";
  src: url("../fonts/OpenSans-SemiBold.ttf") format("truetype");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Open Sans";
  src: url("../fonts/OpenSans-Bold.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* === Dashboard Layout === */
.dashboard-body {
  padding-left: 16.3rem;
}

@media screen and (max-width: 48rem) {
  .dashboard-body {
    padding-left: 0;
  }
}

/* === Content Box (legacy .content-box) === */
.content-box {
  border-radius: 20px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.102751);
  background-color: #fff;
  border: 1px solid #eee;
  padding: 0.9rem;
  width: 100%;
  margin-bottom: 1.4rem;
}

@media screen and (min-width: 64rem) {
  .content-box {
    padding: 1.1rem;
  }
}

/* === Details Table (legacy .details-table) === */
.details-table .details-table__row {
  border-bottom: 1px solid #eee;
  padding: 0.4rem 0;
  font-size: 0.85rem;
  line-height: 2.2em;
  display: flex;
  justify-content: space-between;
}

.details-table .details-table__row .details-table__name {
  color: #555555;
  font-weight: 400;
}

.details-table .details-table__row .details-table__value {
  color: #252525;
  font-weight: bold;
  text-align: right;
}

.details-table .details-table__row .details-table__value.url {
  font-family: monospace;
  font-size: 0.9em;
  word-break: break-all;
}
```

### 4. Componente AppSidebar

Interfaz del componente principal de navegación:

```typescript
// Props
interface SidebarProps {
  menuItems: MenuItem[]
  isSandbox: boolean
  isOpen: boolean
}

interface MenuItem {
  id: string
  to: string
  name: string
  icon?: string          // Nombre del icono Wompi-Icons (sin prefijo ic_)
  isNew?: boolean
  subItems?: MenuItem[]
}

// Emits
interface SidebarEmits {
  (e: 'close'): void
  (e: 'navigate', path: string): void
  (e: 'logout'): void
}
```

Estilos clave del sidebar replicados del legacy:
- Ancho fijo: `16.3rem` (261px)
- `position: fixed`, fondo blanco
- Box-shadow: `-0.063rem 0rem 0.375rem 0rem rgba(0,0,0,0.1) inset`
- Header: `6.25rem` de alto con logo centrado
- Ítems: icono `1.5rem` + texto `1rem`, altura `2.5rem`, padding `0.53125rem 5%`
- Hover: fondo `#D8F9D7`, border-radius `0.4rem`
- Seleccionado: fondo `#2C2A29`, texto/icono `#DFFF61`, border-radius `0.5rem`
- Submenús: flecha arriba/abajo, línea vertical `#CACACA`, punto `#616161`
- Sección inferior: `position: absolute; bottom: 0`, borde superior `1px solid #CACACA`
- Mobile (< 768px): `width: 100%`, overlay, transición `margin-left: -100vw`

### 5. Componente WStatusBadge

```typescript
interface StatusBadgeProps {
  status: 'pending' | 'success' | 'danger' | 'warning'
  label: string
  icon?: string
}
```

Mapeo de colores por estado:
| Estado | Fondo | Texto | Icono |
|--------|-------|-------|-------|
| pending | `#EBF6FE` | `#27587D` | `#44769D` |
| success | `#E5FBE4` | `#1A624C` | `#40A940` |
| danger | `#FFEBEB` | `#A01110` | `#F03232` |
| warning | `rgba(246,198,67,0.32)` | `#ff9c1b` | `#FFA41C` |

### 6. Componente WBalanceCard

```typescript
interface BalanceCardProps {
  icon: string
  title: string
  amount: string | number
  currency?: string
}
```

Estilos: fondo `#F2FDF1`, borde `1px solid #2C2A29`, border-radius `16px`, padding `24px`, min-height `120px`. Icono circular: fondo `#2A2C29` de `3rem`, icono en `#DFFF61`.

### 7. Layout Login

Estructura de grid 12 columnas:
- Columnas 1-5: Imagen banner con `border-radius: 32px`
- Columnas 7-12: Formulario de login
- Centrado vertical, max-width `1140px`
- Mobile (< 768px): Solo formulario centrado, sin imagen
- Logo Wompi: `160×51px`, margin-bottom `53px`
- Fondo blanco `#FFFFFF`

Tipografía login:
- Headings: `CIBFontSans Bold` (wompi-font)
- Body: `Open Sans, sans-serif`
- h1: `2rem` bold, letter-spacing `-0.006em`
- h2: `1.75rem` bold, letter-spacing `-0.006em`
- h3: `1.5rem` bold, letter-spacing `-0.0045em`
- h4: `1.25rem` bold, letter-spacing `-0.0038em`
- h5: `1.125rem` bold
- Color texto: `#2C2A29`

Botón primario login:
- Fondo `#B0F2AE`, texto `#2C2A29`, border-radius `25px`, min-width `146px`, height `48px`, font-weight `600`
- Hover: fondo `#72C571`, box-shadow `0px 1px 3px rgba(0,0,0,0.3), 0px 1px 6px rgba(0,0,0,0.15)`
- Disabled: fondo `#CACACA`, texto `#616161`

Footer login:
- Height: `70px` desktop, `218px` mobile
- Sticky bottom, fondo blanco, borde superior `1px solid #616161`
- Logo `120×40px`, margin-right `50px`
- Flex-row desktop, flex-column mobile

## Data Models

### Design Token Map (SASS → Tailwind)

| Variable SASS Legacy | Tailwind Class | Valor |
|---------------------|----------------|-------|
| `$primary` | `primary` | `#2A2C29` |
| `$primary-text` | `primary-text` | `#2C2A29` |
| `$secondary` | `secondary` | `#BDF4BC` |
| `$secondary-light` | `secondary-light` | `#DFFF61` |
| `$secondary-hard` | `secondary-hard` | `#00825A` |
| `$secondary-soft` | `secondary-soft` | `#E5FBE4` |
| `$secondary-background` | `secondary-background` | `#F2FDF1` |
| `$bg-primary` | `surface-primary` | `#f9f9f9` |
| `$bg-secondary` | `surface-secondary` | `#fff` |
| `$bg-tertiary` | `surface-tertiary` | `#f1f1f1` |
| `$text-dark` | `content-dark` | `#0a0a0a` |
| `$text` | `content` | `#252525` |
| `$text-light` | `content-light` | `#555555` |
| `$text-lighter` | `content-lighter` | `#999` |
| `$success` | `success` | `#B0F2AE` |
| `$warning` | `warning` | `#ff9c1b` |
| `$danger` | `danger` | `#f64d79` |
| `$info` | `info` | `#4376ff` |
| `$border` | `border` | `#eee` |
| `$newShadowMainBox` | `shadow-content` | `0px 1px 4px rgba(0,0,0,0.102751)` |
| `$sideMenuWidth` | `spacing-sidebar` | `16.3rem` |
| `$containerMaxWidth` | `max-w-container` | `74.25rem` |

### Element UI → Nuxt UI Component Map

| Element UI | Nuxt UI | Override Necesario |
|-----------|---------|-------------------|
| `el-button--primary` | `UButton color="primary"` | bg secondary, text primary-text, rounded-20px |
| `el-input` | `UInput` | height 40px, border-color focus → secondary |
| `el-select` | `USelect` | Same as input |
| `el-dialog` | `UModal` | rounded-16px, padding 40px |
| `el-table` | `UTable` | header color #909399, row border #eee |
| `el-tag` | Custom `WStatusBadge` | Colores custom por estado |
| `el-notification` | `useToast()` | Colores custom por tipo |
| `el-pagination` | `UPagination` | font-size 13px, button 35.5×28px |
| `el-alert` | `UAlert` | font-size título 0.85rem, desc 0.8rem |
| `el-date-picker` | `UPopover` + date lib | Color primario #2A2C29 |
| `el-switch` | `UToggle` | on-color primary |

### Breakpoint Map

| Legacy Variable | Tailwind Screen | Valor |
|----------------|-----------------|-------|
| `$smallBreakPoint` | `sm` | `30rem` (480px) |
| `$mediumBreakPoint` | `md` | `48rem` (768px) |
| `$largeBreakPoint` | `lg` | `64rem` (1024px) |
| `$extraLargeBreakPoint` | `xl` | `85rem` (1360px) |


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Menu item rendering preserves icon and text

*For any* array of menu items where each item has an `icon` and `name`, rendering the AppSidebar should produce DOM elements where each menu item contains an `<i>` element with the correct icon class (`ic ic_{icon}`) and a `<span>` element with the item's `name` text.

**Validates: Requirements 3.3**

### Property 2: Selected menu item applies correct visual state

*For any* menu item marked as the currently selected route, the AppSidebar should render that item with background color `#2C2A29` (primary-text) and text/icon color `#DFFF61` (secondary-light), while all other items should NOT have the selected styling.

**Validates: Requirements 3.5**

### Property 3: Menu items with subItems render as dropdowns

*For any* menu item that has a non-empty `subItems` array, the AppSidebar should render it as a dropdown group containing a toggle arrow and all sub-items as nested elements, rather than as a direct navigation link.

**Validates: Requirements 3.6**

### Property 4: Status badge color mapping

*For any* valid status type (`pending`, `success`, `danger`, `warning`), the WStatusBadge component should render with the exact background color, text color, and icon color defined in the badge color map:
- pending: bg `#EBF6FE`, text `#27587D`, icon `#44769D`
- success: bg `#E5FBE4`, text `#1A624C`, icon `#40A940`
- danger: bg `#FFEBEB`, text `#A01110`, icon `#F03232`
- warning: bg `rgba(246,198,67,0.32)`, text `#ff9c1b`, icon `#FFA41C`

**Validates: Requirements 6.2, 6.3, 11.1, 11.2, 11.3, 11.4**

### Property 5: Notification type-to-color mapping

*For any* notification type (`success`, `error`, `warning`, `info`), the toast/notification system should apply the correct background and title colors:
- success: bg `#cbe3dc`, title `#1A624C`
- error: bg `#FFEBEB`, title `#A01110`
- warning: bg `#FFF5E2`, title `#534B2C`
- info: bg `#EBF6FE`, title `#27587D`

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 22.1, 22.2, 22.3**

### Property 6: Wompi-Icons CSS class mapping

*For any* icon name from the legacy Wompi-Icons set, the CSS should contain a `.ic_{name}:before` rule that maps to the correct unicode `content` value, ensuring visual parity with the legacy dashboard's icon rendering.

**Validates: Requirements 10.2**

### Property 7: Login heading typography scale

*For any* heading level (h1 through h5), the login layout should render the heading with the correct font-size, font-weight, and letter-spacing from the typography scale:
- h1: `2rem`, bold, `-0.006em`
- h2: `1.75rem`, bold, `-0.006em`
- h3: `1.5rem`, bold, `-0.0045em`
- h4: `1.25rem`, bold, `-0.0038em`
- h5: `1.125rem`, bold

**Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5**

## Error Handling

### Fuentes no cargadas
- Si las fuentes custom (Wompi-Icons, CIBFontSans, Open Sans) no cargan, el sistema debe degradar gracefully usando las fuentes fallback definidas en `font-family` (sans-serif para texto, sans-serif para iconos — los iconos mostrarán cuadrados vacíos).
- Usar `font-display: swap` en todas las `@font-face` para evitar FOIT (Flash of Invisible Text).

### Tokens de color faltantes
- Si un color token no está definido en Tailwind, los componentes deben usar el color por defecto de Nuxt UI en lugar de romper el layout.
- Los colores de badges y notificaciones deben tener fallbacks inline como respaldo.

### Responsive breakpoints
- Si el viewport no coincide con ningún breakpoint definido, el layout debe usar los estilos mobile-first (sin sidebar, padding reducido).
- El sidebar en mobile debe cerrarse automáticamente al navegar a una nueva ruta.

### Iconos no encontrados
- Si un icono Wompi-Icons no tiene clase CSS definida, el elemento `<i>` debe renderizar vacío sin romper el layout del menú.
- Considerar un componente `WIcon` wrapper que maneje el fallback.

## Testing Strategy

### Enfoque General

Este feature es predominantemente de **configuración visual y CSS** — la mayoría de los requerimientos son checks de configuración (SMOKE) o verificaciones de rendering específico (EXAMPLE). Sin embargo, hay propiedades universales testables para los componentes que mapean datos a estilos.

### Unit Tests (Example-based)

- **Tailwind Config**: Verificar que todos los tokens de color, tipografía, spacing, breakpoints y sombras están definidos con los valores exactos del legacy.
- **App Config**: Verificar que los overrides de Nuxt UI (button, input, modal, table, etc.) están configurados correctamente.
- **CSS Global**: Verificar que las clases `.content-box`, `.details-table`, `.view-content` tienen las propiedades CSS correctas.
- **Componentes**: Snapshot tests para AppSidebar, WStatusBadge, WBalanceCard, WContentBox verificando estructura DOM y clases CSS.
- **Responsive**: Tests con viewport mocking para verificar comportamiento en mobile vs desktop.
- **Login Layout**: Verificar grid structure, footer dimensions, logo placement.

### Property-Based Tests

Usar `fast-check` como librería de property-based testing para Vue/TypeScript.

Cada property test debe:
- Ejecutar mínimo **100 iteraciones**
- Referenciar la propiedad del diseño con un tag: `Feature: mfe-ui-fidelity, Property {N}: {title}`
- Generar inputs aleatorios (arrays de menu items, status types, icon names, heading levels)

**Tests a implementar:**

1. **Property 1**: Generar arrays aleatorios de `MenuItem` con icon y name, renderizar AppSidebar, verificar que cada item tiene el icono y texto correcto.
2. **Property 2**: Generar un array de menu items y seleccionar uno aleatorio como ruta activa, verificar que solo ese item tiene los estilos de selección.
3. **Property 3**: Generar menu items con subItems aleatorios, verificar que se renderizan como dropdowns.
4. **Property 4**: Para cada status type aleatorio del set válido, renderizar WStatusBadge y verificar colores exactos.
5. **Property 5**: Para cada notification type aleatorio, verificar que los colores de fondo y título coinciden con el mapa.
6. **Property 6**: Para cada icon name aleatorio del set legacy, verificar que la clase CSS `.ic_{name}:before` tiene el content correcto.
7. **Property 7**: Para cada heading level aleatorio (h1-h5), verificar font-size, font-weight y letter-spacing.

### Visual Regression Tests (Recomendado post-hackathon)

- Capturar screenshots del legacy dashboard y compararlos con el MFE usando herramientas como Percy o Chromatic.
- Priorizar: sidebar, content-box, tablas con tags, formularios, modales, login page.
