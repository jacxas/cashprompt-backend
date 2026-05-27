# Plan de evolución a Web Desktop Environment (WDE)

## 1) Alcance real del producto

El sistema objetivo no se trata como “página web”, sino como un **Web Desktop Environment** con runtime local (Electron o Tauri), modelo de procesos, shell de escritorio y apps aisladas.

## 2) Restricción de tamaño por módulo

Regla de diseño para mantenibilidad:
- Máximo absoluto por módulo: **1200 líneas**.
- Rango recomendado: **300–700 líneas**.
- Umbral de refactor: al superar 700 líneas, dividir módulo por responsabilidad.

Aplicación práctica:
- `core/kernel_virtual/*`
- `core/window_manager/*`
- `cli/*`
- `storage/*`
- `server/*`

## 3) Stack técnico recomendado (alineado a comentarios)

### Frontend
- React
- Vite
- Tailwind
- Zustand
- Framer Motion

### Runtime desktop local
- Electron **o** Tauri

### Backend local
- Node.js, Bun **o** Rust

### Persistencia
- IndexedDB
- SQLite WASM
- (Opcional por entorno) Supabase

## 4) Arquitectura por capas (siguiente evolución)

## CAPA 1 — Kernel Web
Responsable de:
- ventanas,
- procesos virtuales,
- memoria lógica,
- bus de eventos,
- virtual filesystem.

Módulos sugeridos:
- `core/kernel_virtual/process_registry.*`
- `core/kernel_virtual/scheduler.*`
- `core/kernel_virtual/memory_manager.*`
- `core/kernel_virtual/event_bus.*`
- `storage/vfs.*`

## CAPA 2 — Shell/Desktop
Responsable de:
- taskbar,
- start menu,
- temas,
- notificaciones,
- workspaces.

Módulos sugeridos:
- `desktop/shell/taskbar.*`
- `desktop/shell/start_menu.*`
- `desktop/shell/theme_manager.*`
- `desktop/shell/notification_center.*`
- `desktop/shell/workspace_manager.*`

## CAPA 3 — Apps
Responsable de:
- ejecución de apps aisladas,
- ciclo de vida por app,
- permisos por capacidades.

Módulos sugeridos:
- `apps/runtime/app_host.*`
- `apps/runtime/app_sandbox.*`
- `apps/runtime/app_permissions.*`

## CAPA 4 — SDK
Responsable de:
- instalar apps externas,
- validar manifiestos,
- versionado y actualización.

Módulos sugeridos:
- `sdk/manifest_schema.*`
- `sdk/installer.*`
- `sdk/registry.*`
- `sdk/update_manager.*`

## 5) Integración con estado actual del repo

Para no romper el MVP existente:
1. Mantener `cli/terminal_app.js` y flujo `models/run/jobs` como vía primaria.
2. Introducir Kernel Web y Shell en paralelo como subsistema nuevo.
3. Reusar `storage/migrations/0001_init.sql` para jobs/eventos mientras se añade estado de desktop.
4. Añadir contratos de capacidades para apps antes de abrir SDK externo.

## 6) Hoja de ruta propuesta

### Fase A (base WDE)
- Implementar `event_bus`, `process_registry`, `window_registry`.
- Exponer métricas básicas de procesos/ventanas.

### Fase B (shell)
- Taskbar + launcher + notificaciones mínimas.
- Persistencia de layout y ventanas.

### Fase C (apps aisladas)
- Carga de apps con manifiesto.
- Sandbox lógico y permisos mínimos.

### Fase D (SDK)
- Instalador, registro y actualización de apps.
- Validación de firma/compatibilidad de manifiesto.

## 7) Decisiones para evitar complejidad temprana

- Elegir **un** runtime desktop (Electron o Tauri) en v0.1 y no mantener ambos.
- Mantener un único backend local para MVP (Node.js o Rust), evitando duplicidad.
- Tratar Supabase como opcional/no obligatorio para no romper enfoque local/offline.
