# Skill: Migrar Nuxt 4 a Nuxt 5

## Descripción
Migra las aplicaciones Nuxt 4 de este monorepo a Nuxt 5 (futuro LTS). Cubre nuxt.config.ts, packages compartidos, TypeScript config, deprecaciones, Vite Environment API, Nitro v3, y validación post-migración. Dado que Nuxt 5 está en desarrollo activo, el skill obliga a consultar documentación oficial antes de cada paso.

## Cuándo usarlo
- "Migra a Nuxt 5"
- "Actualiza el monorepo a Nuxt 5"
- "Habilita compatibilityVersion 5"
- "Prepara el proyecto para Nuxt 5"
- "Testea los breaking changes de Nuxt 5"
- "Migra el shell/mfe-transactions/mfe-payouts/mfe-settings a Nuxt 5"

## Instrucciones

### Entrada
El usuario indica qué apps migrar (una, varias, o todas). Si no especifica, migrar todas: `apps/shell`, `apps/mfe-transactions`, `apps/mfe-payouts`, `apps/mfe-settings`.

### REGLA CRÍTICA: Documentación en Tiempo Real

**ANTES de ejecutar CUALQUIER paso de migración**, el agente DEBE:

1. Consultar la documentación oficial vigente en este orden de prioridad:
   - https://nuxt.com/docs/4.x/getting-started/upgrade (sección "Testing Nuxt 5")
   - https://nuxt.com/llms.txt (índice de documentación v5)
   - https://nuxt.com/raw/docs/5.x/getting-started/upgrade.md (documentación raw de upgrade)
   - Blog oficial de Nuxt para release notes recientes

2. Comparar lo encontrado contra los patrones de este skill
3. **Si hay discrepancias, PRIORIZAR SIEMPRE la documentación oficial**
4. Informar al usuario de cualquier cambio detectado respecto a lo documentado aquí

Esta regla existe porque Nuxt 5 está en desarrollo activo y los breaking changes pueden cambiar entre versiones.

### Estado actual del proyecto (referencia rápida)

| App | compatibilityVersion | compatibilityDate | ssr | Module Federation |
|-----|---------------------|--------------------|-----|-------------------|
| `apps/shell` | 4 | 2026-04-17 | false | Host (comentado) |
| `apps/mfe-transactions` | no definido | no definido | false | Remote (comentado) |
| `apps/mfe-payouts` | no definido | no definido | false | Remote (comentado) |
| `apps/mfe-settings` | no definido | no definido | false | Remote (comentado) |

Dependencias clave: `nuxt: ^3.16.0`, `vue: ^3.5.0`, `pinia: ^3.0.0`, `@nuxt/ui`, `@module-federation/vite` (comentado), `pnpm@9.15.0`, `turbo: ^2.5.0`.

No hay código server-side (sin `server/api`, `server/routes`, ni `server/middleware`).
No se usa `createError`, `callHook`, `extendViteConfig`, `#app` imports, ni componentes `.client.vue`.
Se usa `defineNuxtRouteMiddleware` en `apps/shell/app/middleware/auth.global.ts`.
Se usa `import.meta.server` en el middleware de auth.
Se usan imports con `~/` extensivamente en todas las apps (stores, composables).
Todos los tsconfig extienden de `./.nuxt/tsconfig.json`.

### Proceso

#### Paso 0: Consultar documentación actual

1. Usar `remote_web_search` y `webFetch` para obtener la documentación más reciente de Nuxt 5
2. Buscar: "Nuxt 5 migration guide", "Nuxt 5 breaking changes", "Nuxt compatibilityVersion 5"
3. Leer https://nuxt.com/docs/4.x/getting-started/upgrade y extraer la sección "Testing Nuxt 5"
4. Leer https://nuxt.com/llms.txt para identificar páginas de documentación v5 relevantes
5. Intentar leer https://nuxt.com/raw/docs/5.x/getting-started/upgrade.md para obtener la guía raw
6. Compilar una lista actualizada de breaking changes y compararla con los patrones de este skill
7. Informar al usuario si hay cambios nuevos no cubiertos aquí
8. **Si la documentación no está disponible o falla el fetch**, informar al usuario y proceder con cautela usando los patrones de este skill como fallback

#### Paso 1: Auditoría del estado actual

1. **Verificar versiones actuales** en el root `package.json` y en cada app:
   - `nuxt` (requerido: ≥4.2 para compatibilityVersion 5, verificar versión mínima exacta en docs)
   - `vue`, `pinia`, `@module-federation/vite`, `@nuxt/ui`, `@pinia/nuxt`
   - Cualquier otra dependencia que Nuxt 5 requiera actualizar según la documentación consultada

2. **Verificar compatibilityVersion actual** en cada `nuxt.config.ts` (ver tabla de referencia arriba)

3. **Escanear código por patrones que romperán en Nuxt 5**:
   - `defineNuxtRouteMiddleware` → verificar si cambia de nombre o firma en Nuxt 5 (usado en `apps/shell/app/middleware/auth.global.ts`)
   - `import.meta.server` → verificar si sigue soportado (usado en auth middleware)
   - Imports con `~/` → verificar si el alias cambia en Nuxt 5 (usado extensivamente en todas las apps)
   - `navigateTo()` → verificar si la API cambia (usado en múltiples páginas de settings, transactions, shell)
   - `useRoute()` / `useRouter()` → verificar compatibilidad
   - `definePageMeta()` → verificar si hay cambios
   - `createError` con `statusCode`/`statusMessage` → buscar en todo el monorepo (actualmente no se usa, pero verificar packages)
   - `callHook` con `.then()`/`.catch()` → buscar (actualmente no se usa)
   - `extendViteConfig()` → buscar (actualmente no se usa)
   - Componentes `.client.vue` → buscar (actualmente no existen)

4. **Escanear packages compartidos** (`packages/*`) por incompatibilidades:
   - `@wompi/api-client` — usa `createApiClient` y `useApiClient`, verificar contra H3 v2
   - `@wompi/auth` — verificar composables contra lifecycle de Nuxt 5
   - `@wompi/event-bus` — verificar si usa APIs internas de Nuxt
   - `@wompi/types` — verificar interfaces que referencien tipos de Nuxt/Nitro/H3
   - `@wompi/i18n` — verificar compatibilidad vue-i18n con Nuxt 5
   - `@wompi/ui` — verificar componentes contra Nuxt UI 3 + Nuxt 5

#### Paso 2: Actualizar dependencias

1. **Verificar en la documentación** la versión mínima exacta de Nuxt requerida para `compatibilityVersion: 5`

2. **Actualizar Nuxt** en todas las apps:
   ```bash
   pnpm update nuxt --filter @wompi/shell --filter @wompi/mfe-transactions --filter @wompi/mfe-payouts --filter @wompi/mfe-settings
   ```

3. **Actualizar dependencias relacionadas** según lo que indique la documentación:
   - `nitropack` (si se usa explícitamente)
   - `h3` (si se importa directamente)
   - `@nuxt/ui` (verificar compatibilidad con Nuxt 5)
   - `@pinia/nuxt` (verificar compatibilidad)
   - `@module-federation/vite` (verificar compatibilidad con Vite 6 Environment API)
   - `vue-i18n` / `@nuxtjs/i18n` (si se usa)

4. **Estrategia**: NO actualizar a `nuxt@5.x` directamente. Primero testear con `compatibilityVersion: 5` en Nuxt 4.2+.

5. **Después de actualizar**, ejecutar `pnpm install` y verificar que no haya conflictos de peer dependencies.

#### Paso 3: Migrar nuxt.config.ts

Para cada app, en este orden: MFEs simples primero (`mfe-payouts`, `mfe-settings`, `mfe-transactions`), shell al final.

1. **Agregar `compatibilityDate`** a las apps que no lo tienen (solo shell lo tiene actualmente):
   ```typescript
   export default defineNuxtConfig({
     compatibilityDate: '2026-04-17', // o la fecha que la documentación recomiende
     // ...
   })
   ```

2. **Habilitar compatibilityVersion 5**:
   ```typescript
   export default defineNuxtConfig({
     future: {
       compatibilityVersion: 5,
     },
     // ... resto de config
   })
   ```

3. **Migrar Vite Environment API** (si la documentación lo confirma como requerido):
   - Verificar que los plugins de Vite (especialmente Module Federation cuando se descomente) sean compatibles
   - Si `extendViteConfig()` se usa en algún módulo, reemplazar por el nuevo patrón `applyToEnvironment()`
   - Actualmente no se usa `extendViteConfig()` directamente, pero verificar que los módulos (`@nuxt/ui`, `@pinia/nuxt`) no lo usen internamente

4. **Verificar Module Federation** (actualmente comentado en todas las apps):
   - `@module-federation/vite` puede necesitar actualización para Vite 6
   - Verificar compatibilidad ANTES de descomentar la configuración
   - Si no es compatible, documentar como blocker y continuar con el resto de la migración

5. **Verificar configuración de módulos**:
   - `@nuxt/ui` — verificar si requiere cambios de config para Nuxt 5
   - `@pinia/nuxt` — verificar compatibilidad

#### Paso 4: Migrar TypeScript config

1. **Verificar si Nuxt 5 cambia la generación de `.nuxt/tsconfig.json`**:
   - Actualmente todos los tsconfig extienden de `./.nuxt/tsconfig.json`
   - Nuxt 5 puede generar tsconfig separados por contexto (app, server, node, shared) con project references
   - Si cambia, actualizar el `extends` en cada `tsconfig.json`

2. **Regenerar tipos** después de habilitar compatibilityVersion 5:
   ```bash
   pnpm --filter @wompi/shell exec nuxt prepare
   pnpm --filter @wompi/mfe-transactions exec nuxt prepare
   pnpm --filter @wompi/mfe-payouts exec nuxt prepare
   pnpm --filter @wompi/mfe-settings exec nuxt prepare
   ```

3. **Verificar que los auto-imports sigan funcionando** (ref, computed, watch, navigateTo, useRoute, etc.)

4. **Nota SPA**: Como todas las apps usan `ssr: false`, el tsconfig de server puede no generarse, pero verificar igualmente

#### Paso 5: Migrar deprecaciones de código

Basado en la auditoría del Paso 1, migrar solo lo que realmente existe en el código:

1. **`defineNuxtRouteMiddleware`** (`apps/shell/app/middleware/auth.global.ts`):
   - Verificar en la documentación si cambia de nombre o firma en Nuxt 5
   - Si cambia, actualizar el middleware de auth

2. **`import.meta.server`** (usado en auth middleware):
   - Verificar si sigue soportado o si hay un reemplazo

3. **Imports `~/`** (usado extensivamente):
   - Verificar si el alias `~` sigue apuntando a `app/` en Nuxt 5
   - Si cambia, hacer find-and-replace en todas las apps

4. **`navigateTo()`** (usado en múltiples páginas):
   - Verificar si la API cambia (parámetros, return type, etc.)

5. **`createError` — statusCode/statusMessage → status/statusText**:
   - Actualmente NO se usa en el código, pero verificar si se introduce en el futuro
   - Si se encuentra en packages, migrar:
   ```typescript
   // ANTES
   throw createError({ statusCode: 404, statusMessage: 'Not Found' })
   // DESPUÉS
   throw createError({ status: 404, statusText: 'Not Found' })
   ```

6. **hookable v6 — callHook retorna void**:
   - Actualmente NO se usa en el código
   - Si se encuentra, migrar `.then()`/`.catch()` a `await`

7. **Verificar otros breaking changes** que la documentación actual liste y que no estén cubiertos aquí

#### Paso 6: Migrar packages compartidos

Para cada package en `packages/`:

1. **@wompi/api-client**:
   - Verificar que `ofetch` siga siendo compatible con Nuxt 5
   - Verificar `createApiClient` y `useApiClient` contra cambios en H3 v2
   - Verificar interceptors y error handling

2. **@wompi/auth**:
   - Verificar composables contra cambios en el lifecycle de Nuxt 5
   - Verificar que `useAuth` siga funcionando con el nuevo runtime

3. **@wompi/event-bus**:
   - Verificar que la comunicación cross-MFE siga funcionando
   - Si usa hookable internamente, migrar a v6

4. **@wompi/types**:
   - Actualizar interfaces que referencien tipos de Nuxt/Nitro/H3 si cambiaron
   - Verificar que los tipos de error usen la nueva nomenclatura si aplica

5. **@wompi/i18n**:
   - Verificar compatibilidad de vue-i18n con Nuxt 5
   - Verificar que `@nuxtjs/i18n` (si se usa) sea compatible

6. **@wompi/ui**:
   - Verificar componentes contra cambios en Vue 3.5+ / Nuxt 5
   - Verificar que Nuxt UI 3 sea compatible con Nuxt 5
   - Verificar que los componentes `W*` (WDataTable, WFilterPanel, WStatusBadge, WCopyButton, etc.) sigan funcionando

#### Paso 7: Validación post-migración

1. **Regenerar tipos** en cada app:
   ```bash
   pnpm --filter @wompi/shell exec nuxt prepare
   pnpm --filter @wompi/mfe-transactions exec nuxt prepare
   pnpm --filter @wompi/mfe-payouts exec nuxt prepare
   pnpm --filter @wompi/mfe-settings exec nuxt prepare
   ```

2. **Type check** en cada app:
   ```bash
   pnpm --filter @wompi/shell exec nuxt typecheck
   pnpm --filter @wompi/mfe-transactions exec nuxt typecheck
   pnpm --filter @wompi/mfe-payouts exec nuxt typecheck
   pnpm --filter @wompi/mfe-settings exec nuxt typecheck
   ```

3. **Build** de todo el monorepo:
   ```bash
   pnpm turbo run build
   ```

4. **Dev server** — indicar al usuario que arranque cada app manualmente y verificar:
   ```bash
   pnpm dev --filter @wompi/shell
   pnpm dev --filter @wompi/mfe-transactions
   pnpm dev --filter @wompi/mfe-payouts
   pnpm dev --filter @wompi/mfe-settings
   ```

5. **Checklist de funcionalidad crítica** (verificar manualmente en el navegador):
   - [ ] Login y auth flow (middleware de auth funciona)
   - [ ] Navegación entre páginas (navigateTo, useRouter)
   - [ ] Llamadas API (ofetch + interceptors via @wompi/api-client)
   - [ ] Estado compartido (Pinia stores cargan datos)
   - [ ] Componentes UI (Nuxt UI 3 renderiza correctamente)
   - [ ] Imports con `~/` resuelven correctamente
   - [ ] Auto-imports de Nuxt funcionan (ref, computed, etc.)
   - [ ] Comunicación Shell ↔ MFEs (si Module Federation está habilitado)
   - [ ] i18n (si está configurado)

6. **Verificar consola del navegador** por warnings de deprecación restantes

7. **Si todo pasa**: El proyecto está listo para actualizar a `nuxt@5.x` cuando se publique la versión estable

### Rollback

Si la migración causa problemas irrecuperables:

1. Revertir `compatibilityVersion` a `4` (o eliminar la propiedad `future`)
2. Revertir versiones de dependencias en `package.json`
3. Ejecutar `pnpm install`
4. Ejecutar `nuxt prepare` en cada app
5. Verificar que todo funcione como antes

Recomendación: hacer commit ANTES de empezar la migración para tener un punto de rollback limpio.

### Reglas

- **OBLIGATORIO**: Consultar documentación oficial ANTES de cada paso. Nuxt 5 está en desarrollo activo.
- **NUNCA** actualizar directamente a `nuxt@5.x` sin primero testear con `compatibilityVersion: 5`
- **NUNCA** asumir que un breaking change documentado aquí sigue vigente sin verificar contra la documentación actual
- **SIEMPRE** informar al usuario si la documentación actual difiere de este skill
- **SIEMPRE** hacer la migración app por app, no todas a la vez. Orden: MFEs simples → shell.
- **SIEMPRE** ejecutar `nuxt prepare` después de cambiar compatibilityVersion para regenerar tipos
- **SIEMPRE** verificar que el build pase después de cada cambio significativo
- **SIEMPRE** mantener `ssr: false` — este proyecto es SPA, no migrar a SSR
- **NUNCA** modificar la configuración de Module Federation sin verificar compatibilidad con Vite 6
- **SIEMPRE** usar `pnpm` como package manager, nunca npm ni yarn
- **SIEMPRE** respetar la estructura del monorepo: apps dependen de packages, nunca al revés
- **SIEMPRE** usar imports por nombre de package (`@wompi/types`) nunca rutas relativas entre workspaces
- **SIEMPRE** recomendar un commit antes de iniciar la migración
- Si un paso falla y no se resuelve en 15 minutos, documentar el problema y continuar con el siguiente paso
- Si la documentación online no está disponible, informar al usuario y proceder con cautela

### Consideraciones específicas de este monorepo

- **SPA mode**: Todas las apps usan `ssr: false`. Los cambios de SSR (comment placeholders, server rendering, Nitro server routes) no aplican directamente, pero verificar que el modo SPA siga funcionando igual.
- **No hay server code**: No existen directorios `server/` en ninguna app. La migración de Nitro v3 / H3 v2 solo aplica si se importan tipos o utilidades de estos packages en el código cliente o en packages compartidos.
- **Module Federation**: `@module-federation/vite` está comentado en todas las apps. La migración a Vite 6 Environment API es relevante para cuando se descomente. Verificar compatibilidad pero no bloquear la migración por esto.
- **Pinia 3**: Ya estamos en Pinia 3 con setup stores (Composition API). Verificar que `@pinia/nuxt` sea compatible con Nuxt 5.
- **Nuxt UI 3 + Tailwind CSS 4**: Verificar que `@nuxt/ui` v3 soporte Nuxt 5. Si no, puede ser un blocker.
- **Shell como HOST**: El shell es la app más compleja (layouts, middleware auth, componentes compartidos, stores, composables, Module Federation host). Migrar al final.
- **Packages @wompi/***: Son la base de todo. Si un package rompe, todas las apps rompen. Migrar y validar primero.
- **Turborepo**: El build order (`turbo run build`) debe seguir respetando el grafo de dependencias post-migración.
- **`defineNuxtRouteMiddleware`**: Usado en el auth middleware del shell. Es un punto crítico — si esta API cambia, el login se rompe.
- **Alias `~/`**: Usado extensivamente en todas las apps para importar stores y composables. Si Nuxt 5 cambia cómo resuelve este alias, requiere un find-and-replace masivo.
- **`compatibilityDate`**: Solo el shell lo tiene definido. Los MFEs necesitan agregarlo antes o durante la migración.
