# Arquitectura técnica de alto nivel — Plataforma local de IA para Linux

## 1) Diagrama textual de módulos

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE INTERFAZ                                  │
│                                                                              │
│  [CLI avanzada]      [Servidor HTTP local opcional]      [UI futura Qt/GTK] │
│  - comandos/jobs     - API OpenAI-like subset             - consume Core API │
│  - salida human/json - streaming SSE                       - sin lógica propia│
└───────────────────────────────┬──────────────────────────────────────────────┘
                                │ llamadas internas (Core API)
┌───────────────────────────────▼──────────────────────────────────────────────┐
│                         CAPA DE ORQUESTACIÓN                                 │
│                                                                              │
│  [Job Manager] [Queue Manager] [Scheduler] [Execution Planner] [Logger/Audit]│
│  - crea jobs    - prioridades   - asigna     - valida pipeline    - trazas    │
│  - estados      - concurrencia  - recursos   - resuelve artefactos - eventos  │
│  - retry/resume - backpressure  - CPU/GPU    - crea plan ejecución - métricas │
└───────────────┬───────────────────────────┬───────────────────────────────────┘
                │                           │
                │ lee/escribe               │ solicita modelos/artefactos
┌───────────────▼──────────────┐    ┌───────▼──────────────────────────────────┐
│  CAPA DE ALMACENAMIENTO LOCAL│    │          GESTOR DE MODELOS               │
│                              │    │                                            │
│ [SQLite metadata]            │    │ [Registry local + índice]                │
│ [Filesystem artefactos]      │    │ [Providers: HF, HTTP genérico, plugins]  │
│ [Outputs + sidecars JSON]    │    │ [Resolver versiones/cuants/revisiones]   │
│ [Logs por proyecto/sesión]   │    │ [Downloader + verificador checksum]      │
│ [Histórico reproducible]     │    │ [Conversión formatos (safetensors->run)] │
└───────────────┬──────────────┘    └───────────────┬───────────────────────────┘
                │                                    │ entrega artefacto ejecutable
                └──────────────────────┬─────────────┘
                                       │
┌──────────────────────────────────────▼───────────────────────────────────────┐
│                           NÚCLEO DE INFERENCIA                               │
│                                                                               │
│ [Device Manager] [Runtime GGUF] [Runtime ONNX] [Media Pipeline] [Safety/Policy]│
│ - detecta hw      - llama.cpp      - onnxruntime   - t2i/i2i/t2v/i2v           │
│ - cpu/cuda/rocm   - sampling LLM   - providers GPU - encode mp4/webm           │
│ - fallback        - tokens/stream  - graph exec     - export frames             │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Límites de responsabilidad
- **Interfaz**: solo traducción de entrada/salida (CLI/API/UI), sin reglas de negocio.
- **Orquestación**: dueño del ciclo de vida de jobs, colas, planificación, observabilidad.
- **Gestor de modelos**: dueño de catálogos/proveedores, descarga, versionado, cuantización, conversión y registro.
- **Núcleo de inferencia**: ejecución pura de modelos y pipelines multimedia con selección de dispositivo.
- **Almacenamiento**: persistencia y reproducibilidad (estado, historial, artefactos, metadatos).

---

## 2) Flujos principales

## A. Flujo “descargar y registrar un modelo”

1. Usuario ejecuta `models search` o `models add <ref>` (CLI/API).
2. Interfaz llama a Core API -> `ModelManager.resolve(ref, constraints)`.
3. `ModelManager` consulta proveedor (HF/HTTP/plugin):
   - `search` -> candidatos,
   - `resolve` -> artefacto exacto (versión, quant, formato).
4. `Downloader` descarga en staging local con reanudación.
5. `IntegrityVerifier` valida hash/size/firmas disponibles.
6. Si formato no ejecutable directo:
   - `ConversionPipeline` (ej. safetensors -> GGUF/ONNX).
7. `RegistryWriter` registra variante instalada en SQLite:
   - fuente, licencia, alignment_level, backend compatible, timestamps.
8. Se mueve artefacto a almacenamiento definitivo (content-addressed).
9. Se emite evento `model.installed` al Logger/Audit.
10. CLI/API devuelve éxito + metadata JSON.

## B. Flujo “ejecutar un job de texto→imagen”

1. Usuario lanza `gen image ...`.
2. Interfaz construye `JobSpec` (prompt, seed, steps, cfg, width/height, model@variant, device).
3. Job Manager persiste `JobSpec` + estado `queued`.
4. Scheduler selecciona worker y dispositivo (`auto` -> GPU si disponible, sino CPU).
5. Execution Planner valida que el modelo existe y es compatible con pipeline t2i.
6. Núcleo de inferencia carga runtime ONNX y pesos del modelo.
7. Ejecuta inferencia, genera imagen y opcionalmente preview/progreso.
8. Media Pipeline guarda `output.png|jpg` + sidecar `output.json`.
9. Logger registra backend real, dispositivo, latencia, consumo y warnings.
10. Job Manager marca `completed` (o `failed` con causa) y devuelve resultado.

## C. Flujo “ejecutar un job de texto→vídeo”

1. Usuario lanza `gen video ...`.
2. Se crea `JobSpec` extendido: `fps`, `duration`, `resolution`, `codec`, `export_frames`.
3. Scheduler evalúa coste y reserva recursos (posible cola dedicada multimedia).
4. Planner compone subpipeline:
   - generación de keyframes,
   - refinamiento/interpolación,
   - ensamblado final.
5. Runtime ONNX ejecuta etapas de generación; Media Pipeline escribe frames temporales.
6. Encoder interno genera MP4(H.264) por defecto o WebM(VP9).
7. Se persisten vídeo final + sidecar JSON completo + opcional carpeta de frames.
8. Observabilidad guarda métricas por etapa (tiempo, fallos, retries).
9. Resultado final queda trazable para rerun exacto.

## D. Flujo “repetir un job desde histórico”

1. Usuario ejecuta `jobs rerun <job_id> [overrides]`.
2. Job Manager lee `JobSpec` + metadata del job original.
3. Aplica overrides permitidos (seed, steps, cfg, resolución, etc.).
4. Crea nuevo `JobSpec` con referencia `parent_job_id`.
5. Encola ejecución normal vía Scheduler.
6. Al completar, guarda vínculo genealógico entre jobs y diff de parámetros.
7. Devuelve nueva salida + trazabilidad completa.

---

## 3) Decisiones de stack

## 3.1 Lenguajes sugeridos
- **Core + CLI: Rust**
  - rendimiento, binario único, concurrencia segura, gran ecosistema CLI.
- **Servidor HTTP local: Rust (mismo proceso o subproceso interno)**
  - evita duplicación tecnológica y mantiene modelo operativo simple.
- **UI futura**: Qt/GTK consumiendo Core API (sin duplicar dominio).

## 3.2 Runtimes de inferencia sugeridos
- **GGUF / LLM**: `llama.cpp` integrado como librería embebida.
- **ONNX**: `ONNX Runtime` integrado con Execution Providers:
  - CPU obligatorio,
  - CUDA/ROCm opcional según build/host.
- **Multimedia**:
  - pipeline interno para frames,
  - codificación MP4(H.264) y WebM(VP9) mediante capa multimedia integrada del producto.

## 3.3 Almacenamiento y modelo de datos

### Elección
- **SQLite embebido** para metadatos transaccionales.
- **Filesystem estructurado** para artefactos pesados (modelos, outputs, logs).

### Tablas base (alto nivel)
- `models`
  - `model_id`, `name`, `provider`, `task`, `license`, `alignment_level`, `alignment_notes`.
- `model_variants`
  - `variant_id`, `model_id`, `version_tag`, `quant`, `format`, `backend`, `size_bytes`, `artifact_hash`.
- `model_installations`
  - `installation_id`, `variant_id`, `local_path`, `installed_at`, `updated_at`, `source_uri`.
- `projects`
  - `project_id`, `name`, `default_output_path`, `tags`, `created_at`.
- `sessions`
  - `session_id`, `project_id`, `name`, `created_at`, `closed_at`.
- `jobs`
  - `job_id`, `session_id`, `type`, `status`, `priority`, `device_requested`, `device_used`, `created_at`, `started_at`, `finished_at`, `parent_job_id`.
- `job_specs`
  - `job_id`, `spec_json` (prompt, negative prompt, seed, steps, cfg, params multimedia).
- `job_outputs`
  - `output_id`, `job_id`, `path`, `sidecar_path`, `format`, `sha256`.
- `events`
  - `event_id`, `entity_type`, `entity_id`, `level`, `message`, `payload_json`, `created_at`.

### Estructura FS sugerida
```text
~/.local/share/atenea/
  db/registry.sqlite
  models/<artifact_hash>/...
  projects/<project_id>/sessions/<session_id>/
    jobs/<job_id>/
      outputs/
      metadata/
      logs/
  cache/downloads/
```

---

## 4) Procesos y despliegue local

- **Proceso principal**: `atenea` (CLI + Core).
- **Modo servidor**: `atenea serve` (reutiliza Core, API local loopback).
- **Workers internos**:
  - pool de ejecución CPU,
  - pool GPU por dispositivo,
  - cola multimedia separada para evitar starvation.
- **Sin dependencias externas obligatorias**: no Docker, no servicios cloud, no launchers de terceros.

---

## 5) Reglas de extensibilidad

- Nuevo proveedor de modelos = implementar contrato `search/resolve/download`.
- Nuevo formato = registrar conversor al formato ejecutable del runtime.
- Nuevo backend de inferencia = adaptar interfaz de Runtime Adapter sin tocar interfaz/CLI.
- Nueva UI = consume Core API existente; no modifica capas inferiores.

---

## 6) Resultado arquitectónico

La arquitectura propuesta separa claramente **interfaz**, **orquestación**, **modelos**, **inferencia** y **persistencia**, permitiendo:
- ejecución 100% local y offline tras descarga,
- trazabilidad/reproducibilidad por diseño,
- soporte real para más de 100 modelos con variantes/cuants,
- crecimiento incremental (nuevos providers, formatos, pipelines y UI) sin reescritura del núcleo.
