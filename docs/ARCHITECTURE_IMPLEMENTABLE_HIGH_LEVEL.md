# 1. Resumen arquitectónico

- La plataforma se organiza en capas desacopladas: **interfaces**, **orquestación**, **modelos**, **inferencia** y **persistencia**.
- El punto de entrada principal es la **CLI nativa**; el modo servidor local y una UI futura reutilizan el mismo núcleo.
- Toda ejecución de inferencia ocurre en local con runtimes integrados en el producto.
- El diseño separa claramente:
  - control de ciclo de vida de jobs,
  - gestión de catálogo/modelos,
  - ejecución de pipelines multimodales,
  - trazabilidad y reproducibilidad.
- Se prioriza una arquitectura simple para Linux: binario principal + almacenamiento local + metadatos transaccionales.

# 2. Módulos principales

## 2.1 Núcleo de inferencia
- Responsabilidad:
  - ejecutar modelos y pipelines (`chat`, `t2i`, `i2i`, `t2v`, `i2v`).
- Funciones:
  - inicialización de runtime por tipo de modelo,
  - carga de artefactos locales,
  - ejecución de inferencia y streaming de resultados cuando aplique.
- Límite:
  - no gestiona descargas ni estados de jobs; solo ejecución técnica.

## 2.2 Gestor de modelos
- Responsabilidad:
  - ciclo de vida de modelos (descubrir, resolver, descargar, verificar, convertir, registrar, eliminar).
- Funciones:
  - contrato de proveedores `search/resolve/download`,
  - gestión de variantes (versiones, cuants, revisiones),
  - metadatos de licencia y alineamiento.
- Límite:
  - no ejecuta inferencia, entrega artefactos listos al núcleo.

## 2.3 Sistema de jobs
- Responsabilidad:
  - orquestar ejecución reproducible y controlada de tareas.
- Funciones:
  - cola, prioridad, scheduler, reintentos,
  - transición de estados,
  - cancelación y reejecución.
- Límite:
  - no conoce detalles internos del runtime; invoca al núcleo mediante contratos.

## 2.4 Almacenamiento local
- Responsabilidad:
  - persistir estado y artefactos de forma consistente.
- Funciones:
  - base transaccional para entidades,
  - filesystem para modelos, outputs, sidecars, logs.
- Límite:
  - no contiene lógica de negocio de alto nivel.

## 2.5 CLI
- Responsabilidad:
  - interfaz primaria para operación humana y automatización.
- Funciones:
  - parseo de comandos,
  - validación de flags,
  - salida humana/JSON y códigos de retorno estables.
- Límite:
  - no implementa reglas de inferencia ni scheduling.

## 2.6 Modo servidor local
- Responsabilidad:
  - exponer API HTTP local reutilizando casos de uso del núcleo.
- Funciones:
  - endpoint de chat compatible con cliente OpenAI-like,
  - streaming opcional,
  - mapeo de alias de modelo API -> modelo local.
- Límite:
  - no crea rutas separadas de dominio; usa la misma capa de aplicación que CLI.

## 2.7 Futura capa UI
- Responsabilidad:
  - experiencia visual opcional para usuarios de escritorio Linux.
- Funciones:
  - consumir API interna/servidor local,
  - visualizar jobs/modelos/salidas.
- Límite:
  - no duplica reglas de negocio.

# 3. Diagrama textual de arquitectura

```text
┌────────────────────────────────────────────────────────────────────┐
│                        CAPA DE INTERFAZ                           │
│  CLI nativa           Servidor HTTP local           UI futura      │
└───────────────────────────────┬────────────────────────────────────┘
                                │ casos de uso
┌───────────────────────────────▼────────────────────────────────────┐
│                      CAPA DE APLICACIÓN                            │
│  Command Handlers / Use Cases / Validación de políticas            │
└───────────────┬───────────────────────────────┬────────────────────┘
                │                               │
                │ orchestration                 │ model lifecycle
┌───────────────▼──────────────────┐   ┌────────▼────────────────────┐
│         SISTEMA DE JOBS          │   │      GESTOR DE MODELOS      │
│ queue + scheduler + retry + logs │   │ providers + download + conv │
└───────────────┬──────────────────┘   └────────┬────────────────────┘
                │ invoca inferencia             │ entrega artefactos
                └───────────────┬───────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────┐
│                     NÚCLEO DE INFERENCIA                           │
│ runtime GGUF | runtime ONNX | media pipeline | device manager      │
└───────────────────────────────┬────────────────────────────────────┘
                                │ read/write
┌───────────────────────────────▼────────────────────────────────────┐
│                    ALMACENAMIENTO LOCAL                            │
│ SQLite (metadatos) + Filesystem (modelos/salidas/logs/sidecars)   │
└────────────────────────────────────────────────────────────────────┘
```

# 4. Flujos críticos del sistema

## 4.1 Descargar y registrar un modelo
1. CLI recibe `models add` con referencia + variante (`quant/revision`).
2. Caso de uso solicita al gestor de modelos `resolve`.
3. Provider remoto responde artefacto exacto (URI, hash, formato).
4. Descarga a staging local con verificación de integridad.
5. Si es necesario, conversión local al formato de ejecución.
6. Registro en catálogo local (metadatos, licencia, alignment, backend compatible).
7. Publicación de evento local `model.installed`.

**Tradeoff:** validar/verificar todo artefacto aumenta tiempo de alta, pero evita corrupción y mejora reproducibilidad.

## 4.2 Ejecutar texto→imagen
1. CLI crea `JobSpec` con prompt, seed, steps, cfg, resolución, modelo, dispositivo.
2. Job manager persiste `queued` y encola.
3. Scheduler asigna worker y dispositivo efectivo.
4. Núcleo de inferencia ejecuta pipeline t2i con runtime ONNX.
5. Se escribe output (`png/jpg`) + sidecar JSON + logs.
6. Estado final `completed/failed` con métricas y error explícito.

**Tradeoff:** mantener sidecar por cada output consume disco adicional, pero habilita auditoría exacta.

## 4.3 Ejecutar texto→vídeo
1. CLI crea `JobSpec` de vídeo (`fps`, `duration`, `codec`, `resolution`, etc.).
2. Scheduler deriva a cola/pool multimedia.
3. Planner compone etapas (generación de frames, refinado, ensamblado).
4. Runtime ejecuta inferencia por etapas; encoder genera MP4/WebM.
5. Persistencia de vídeo final, frames opcionales y sidecar completo.
6. Registro de tiempos por etapa y consumo de recursos.

**Tradeoff:** separar cola multimedia reduce interferencia con chat/imágenes, pero aumenta complejidad operativa.

## 4.4 Reejecutar un job desde histórico
1. CLI solicita `jobs rerun <id> [overrides]`.
2. Se recupera `JobSpec` histórico y su contexto de modelo/versión.
3. Se aplican overrides permitidos (ej. seed/steps/resolución).
4. Se crea nuevo job con referencia `parent_job_id`.
5. Flujo normal de encolado, ejecución y persistencia.

**Tradeoff:** mantener historial completo incrementa tamaño de base/logs, pero simplifica reproducibilidad y debugging.

# 5. Decisiones de stack

- **Lenguaje base:** Rust para core, CLI y servidor local.
  - motivo: binario nativo Linux, control de memoria/recursos, concurrencia segura.
- **Persistencia:** SQLite + filesystem.
  - motivo: mínimo operativo local sin dependencias de servicios externos.
- **Runtimes de inferencia integrados:**
  - GGUF para LLM,
  - ONNX para visión/multimedia.
- **Empaquetado Linux:** AppImage + DEB/RPM como línea principal.
  - Flatpak opcional según distribución objetivo.

**Tradeoff global:** un binario/plataforma más autocontenida simplifica instalación, pero aumenta peso del paquete.

# 6. Almacenamiento y metadatos

- **Metadatos transaccionales (SQLite):**
  - modelos, variantes, instalaciones,
  - proyectos, sesiones,
  - jobs, outputs, eventos.
- **Artefactos en filesystem:**
  - modelos por hash,
  - outputs por job,
  - logs y sidecars JSON.
- **Metadatos mínimos por output:**
  - modelo + variante/quant,
  - prompt/negative prompt,
  - seed/steps/cfg,
  - backend/dispositivo usados,
  - versión de app y timestamp.
- **Política de consistencia:**
  - staging + commit atómico para altas de modelo,
  - estado de job persistido antes y después de ejecución.

# 7. Gestión de GPU, CPU y backends

- Política de selección de dispositivo:
  - `--device auto`: prioriza GPU compatible, fallback a CPU,
  - `--device cpu`: fuerza ejecución CPU,
  - `--device <gpu:id>`: fuerza dispositivo concreto.
- Registro obligatorio por job:
  - dispositivo solicitado,
  - dispositivo real usado,
  - backend seleccionado,
  - motivo de fallback si ocurrió.
- Aislamiento de recursos:
  - pools separados para cargas ligeras y multimedia,
  - límites de concurrencia configurables por perfil de hardware.
- Objetivo operativo:
  - evitar fallo total por ausencia de GPU,
  - mantener comportamiento predecible en hosts heterogéneos.

# 8. Extensibilidad futura

- **Nuevos providers de modelos:** añadir adaptador al contrato `search/resolve/download`.
- **Nuevos formatos:** añadir etapa de conversión al formato ejecutable del runtime.
- **Nuevos backends de inferencia:** implementar adaptador de runtime sin alterar CLI.
- **Nueva UI:** consumir casos de uso existentes sin duplicar lógica.
- **Nuevas APIs locales:** ampliar servidor manteniendo versión explícita de contrato.

Tradeoff:
- contratos estrictos reducen flexibilidad puntual, pero estabilizan evolución y compatibilidad.

# 9. Riesgos técnicos

- Fragmentación de drivers/aceleración por distribución Linux.
- Consumo de almacenamiento por variantes/cuants y outputs de vídeo.
- Tiempos altos de primera ejecución en pipelines multimedia.
- Complejidad en compatibilidad de versiones de modelos y conversores.
- Riesgo de divergencia entre salida humana y `--json` si no se versiona contrato.

Mitigaciones prioritarias:
- matriz de compatibilidad por build,
- políticas de limpieza y cuotas,
- versionado de esquemas JSON,
- tests de integración por flujo crítico.

# 10. Recomendación final de arquitectura

- Adoptar una arquitectura **modular por capas** con núcleo único de casos de uso compartido por CLI y servidor local.
- Implementar primero el camino crítico mínimo:
  1. `models search/add/info`,
  2. `run chat` y `run text-to-image`,
  3. persistencia completa de jobs + sidecars,
  4. `jobs rerun`.
- Mantener multimedia de vídeo en una cola específica desde el inicio para evitar bloqueo del resto de cargas.
- Formalizar pronto contratos estables de:
  - metadata de modelos,
  - `JobSpec`,
  - JSON de salida.
- Esta opción es la más simple y mantenible en Linux porque evita componentes externos obligatorios y concentra toda la lógica en un núcleo local consistente.
