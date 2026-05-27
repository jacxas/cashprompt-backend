# 1. Resumen ejecutivo

- Se definió una arquitectura modular con cinco capas: interfaz, orquestación, modelos, inferencia y almacenamiento local.
- La CLI queda como interfaz principal; el modo servidor HTTP local y una UI futura consumen el mismo núcleo.
- El núcleo de inferencia separa ejecución GGUF (LLM) y ONNX (visión/multimedia) con selección de dispositivo `auto/cpu/gpu` y fallback a CPU.
- El gestor de modelos cubre búsqueda, resolución, descarga, verificación, conversión y registro local de variantes/cuants.
- El almacenamiento combina SQLite para metadatos transaccionales y filesystem para artefactos y salidas.
- El sistema de jobs mantiene colas, prioridades, reintentos y trazabilidad completa por proyecto/sesión/job.
- Se definió un árbol CLI completo con comandos para modelos, ejecución multimodal, proyectos, sesiones, jobs y servidor local.
- Se estandarizó salida reproducible mediante sidecar JSON por resultado con parámetros de inferencia y contexto.

# 2. Decisiones principales

1. **Núcleo y CLI en Rust** para binario único, control de recursos y concurrencia segura.
2. **Interfaz unificada de casos de uso (`core/api`)** para evitar divergencia entre CLI, servidor y UI futura.
3. **Runtimes integrados por tipo de carga**:
   - GGUF para chat/LLM,
   - ONNX para imagen/vídeo.
4. **Gestión de modelos por contrato `search/resolve/download`** para permitir múltiples proveedores sin acoplar comandos.
5. **Persistencia híbrida**:
   - SQLite para entidades y estados,
   - filesystem para pesos, outputs, logs y cachés.
6. **Job orchestration explícita** (queue + scheduler + planner) para controlar prioridades y dispositivos.
7. **Reproducibilidad por defecto**: `job_specs`, sidecars y rerun con overrides.
8. **Selección nativa Linux de dispositivo** con política determinista: preferencia GPU disponible, fallback CPU, registro del resultado.

# 3. Arquitectura / CLI / estructura

## Arquitectura
- **Capa interfaz**: parsea entrada, valida opciones y serializa salida (`human/json`); no contiene reglas de dominio.
- **Capa orquestación**: crea jobs, gestiona estados, asigna recursos y controla ejecución/reintentos.
- **Capa modelos**: administra índice local, descarga/actualización, integridad y conversiones de formato.
- **Capa inferencia**: inicializa runtime y ejecuta pipelines `chat`, `t2i`, `i2i`, `t2v`, `i2v`.
- **Capa almacenamiento**: centraliza consistencia de metadatos y localización física de artefactos.

## CLI
- Estructura principal:
  - `models` (list/search/add/update/remove/info/verify/convert),
  - `run` (chat/text-to-image/image-to-image/text-to-video/image-to-video/batch),
  - `projects`, `sessions`, `jobs`, `server`, `config`, `cache`.
- Flags operativas transversales:
  - `--model`, `--quant`, `--device`, `--project`, `--session`, `--json`, `--verbose`, `--quiet`.
- Salida automatizable:
  - tablas legibles por defecto,
  - JSON estable para pipelines y CI local.

## Estructura de proyecto
- `/apps/cli`: comandos, parser y formatos de salida.
- `/apps/server`: endpoints HTTP locales y streaming.
- `/core/orchestration`: manager de jobs, colas y scheduler.
- `/core/inference`: device manager, runtimes, pipelines y media encoding.
- `/core/models`: providers, downloader, registro e integridad.
- `/core/storage`: repositorios SQLite + stores filesystem.
- `/packaging`: `.desktop`, icono y empaquetado Linux.

# 4. Riesgos

1. **Fragmentación de aceleración GPU en Linux** (drivers/runtime): requiere matriz clara de compatibilidad por build.
2. **Coste de conversión de formatos** en primera instalación: puede elevar tiempos de `models add`.
3. **Crecimiento del almacenamiento local** por variantes y outputs multimedia: necesita políticas de limpieza/prioridad.
4. **Contención de recursos en jobs largos** (vídeo): riesgo de starvation sin colas separadas por tipo de carga.
5. **Consistencia de metadatos** si se interrumpe una instalación: requiere staging + commit atómico.
6. **Evolución de contratos CLI/JSON**: cambios no compatibles impactan scripts; se requiere versionado explícito.

# 5. Próximos pasos

1. Congelar contrato CLI v0 (`nombres`, `flags`, códigos de salida, JSON schema por comando).
2. Definir `schema.sql` inicial y migraciones para modelos/proyectos/sesiones/jobs/events.
3. Implementar `core/api` con casos de uso mínimos: `models.search/add/info`, `run.chat`, `jobs.list/rerun`.
4. Construir scheduler básico con cola FIFO + prioridad y selección de dispositivo `auto`.
5. Implementar sidecar JSON unificado y validación de reproducibilidad de `jobs rerun`.
6. Preparar empaquetado Linux con ejecutable, `.desktop` e integración de rutas estándar XDG.
