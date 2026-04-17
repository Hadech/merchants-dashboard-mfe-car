# Merchants Dashboard MFE

Monorepo del nuevo dashboard de comerciantes de Wompi, construido con Nuxt 4, Vue 3, Nuxt UI, Tailwind CSS y Module Federation.

## Requisitos

- **Node.js** 20 LTS (ver `.nvmrc`)
- **pnpm** 9.x (`npm install -g pnpm@9`)

## Setup rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/Hadech/merchants-dashboard-mfe-car.git
cd merchants-dashboard-mfe-car

# 2. Usar la versión correcta de Node
nvm use

# 3. Instalar dependencias
pnpm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores de tu ambiente (Cognito, API Gateway, etc.)
# También copiar el .env a apps/shell/.env
cp .env apps/shell/.env
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_API_GW_BASE_URL` | URL base del API Gateway (producción) |
| `VITE_API_GW_BASE_URL_SANDBOX` | URL base del API Gateway (sandbox) |
| `VITE_DASHBOARD_USER_POOL_ID` | Cognito User Pool ID |
| `VITE_DASHBOARD_CLIENT_ID` | Cognito App Client ID |
| `VITE_I18N_LOCALE` | Locale por defecto (ej: `es_CO`) |

## Levantar el proyecto

```bash
# Levantar solo el Shell (app principal)
pnpm run dev --filter @wompi/shell

# Levantar todo el monorepo (shell + MFEs)
pnpm run dev
```

El Shell se levanta en **http://localhost:3000**

## Build

```bash
# Build de todo el monorepo
pnpm run build

# Build solo del Shell
pnpm run build --filter @wompi/shell
```

## Estructura del monorepo

```
merchants-dashboard-mfe-car/
├── apps/
│   ├── shell/              # Host principal (Nuxt 4)
│   │   ├── app/
│   │   │   ├── assets/     # CSS global, fuentes, iconos
│   │   │   ├── components/ # Componentes Vue (AppSidebar, WStatusBadge, etc.)
│   │   │   ├── composables/# Lógica reutilizable (useWompiToast, useMerchantContext)
│   │   │   ├── layouts/    # Layouts (default, login)
│   │   │   ├── middleware/  # Auth middleware
│   │   │   ├── pages/      # Rutas (transactions, login, etc.)
│   │   │   └── stores/     # Pinia stores
│   │   ├── public/         # Assets estáticos (imágenes)
│   │   ├── app.config.ts   # Nuxt UI theme overrides
│   │   ├── tailwind.config.ts # Design tokens del legacy
│   │   └── nuxt.config.ts
│   ├── mfe-transactions/   # MFE de transacciones
│   ├── mfe-payouts/        # MFE de pagos a terceros
│   └── mfe-settings/       # MFE de configuración
├── packages/
│   ├── api-client/         # @wompi/api-client — ofetch + interceptors
│   ├── auth/               # @wompi/auth — Cognito composable
│   ├── event-bus/          # @wompi/event-bus — comunicación cross-MFE
│   ├── i18n/               # @wompi/i18n — traducciones
│   ├── types/              # @wompi/types — interfaces TypeScript
│   └── ui/                 # @wompi/ui — componentes compartidos
├── .env.example
├── pnpm-workspace.yaml
└── turbo.json
```

## Stack tecnológico

| Tecnología | Uso |
|-----------|-----|
| Nuxt 4 | Framework principal (SPA mode) |
| Vue 3 | UI framework |
| Nuxt UI | Componentes base |
| Tailwind CSS | Utilidades CSS |
| Pinia | State management |
| Cognito | Autenticación |
| ofetch | HTTP client |
| Turborepo | Build orchestration |
| pnpm | Package manager |

## Login

La autenticación usa **Amazon Cognito** con flujo `USER_PASSWORD_AUTH`. El login requiere **nombre de usuario** y **contraseña** (no email).

Después del login, el sistema obtiene el `userPrincipalID` del merchant asociado al usuario, necesario para las llamadas al API.
