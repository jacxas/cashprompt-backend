# Plan crítico: refactor total por dominios

## Objetivo

Reducir complejidad estructural antes de añadir nuevas features, separando responsabilidades por dominios estables.

## Estructura objetivo

```text
/kernel
  process/
  window/
  memory/
  events/
  vfs/

/desktop
  shell/
  taskbar/
  launcher/
  notifications/
  workspaces/

/apps
  ai-workspace/
  ide/
  browser/
  multimedia/
  terminal/

/services
  ai-runtime/
  model-registry/
  jobs/
  storage/
  package-service/

/sdk
  manifests/
  installer/
  permissions/
  lifecycle/

/themes
  default/
  dark/
  high-contrast/
```

## Reglas de refactor

- No agregar features nuevas durante el refactor estructural.
- Cada módulo debe tener API pública explícita (`index.js` o contrato equivalente).
- Máximo recomendado por archivo: 300–700 líneas; hard limit: 1200.
- Toda dependencia entre dominios pasa por contratos, no imports cruzados ad-hoc.

## Fases recomendadas

### Fase 1 — Congelación funcional
- Congelar comandos actuales del CLI v0.
- Congelar esquema de sidecar y migración base.

### Fase 2 — Reubicación estructural
- Mover `src/windowManager.js` a `kernel/window/`.
- Mover utilidades de FS a `services/storage/`.
- Mantener compatibilidad mediante adaptadores temporales.

### Fase 3 — Contratos por dominio
- Definir contrato de Kernel (`process`, `window`, `events`, `vfs`).
- Definir contrato de Desktop Shell.
- Definir contrato App Host/SDK.

### Fase 4 — Limpieza de legado
- Eliminar rutas antiguas una vez migrados imports.
- Activar checks de arquitectura (lint de boundaries).

## Criterio de salida del refactor

- Todas las rutas principales usan la nueva estructura por dominio.
- No quedan imports legacy entre capas fuera de contratos.
- CLI v0 y sidecar v0 siguen compatibles (sin breaking changes).
