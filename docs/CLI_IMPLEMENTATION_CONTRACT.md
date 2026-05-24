# 1. Filosofía de diseño de la CLI

- CLI-first: toda operación principal se ejecuta por terminal sin componentes externos obligatorios.
- Local-first: los comandos operan sobre modelos/artefactos locales y solo usan red para búsqueda/descarga cuando se solicita.
- Contratos estables: entradas/salidas con estructura consistente para facilitar scripting.
- Simetría operativa: todos los flujos críticos (modelo, ejecución, sesión, job) tienen comandos de inspección y control.
- Reproducibilidad: cada comando de ejecución devuelve `job_id` y referencia a metadatos persistidos.

# 2. Nombre sugerido de la aplicación

- Nombre de CLI: `app` (placeholder neutral para diseño contractual).
- Alias recomendado al implementar: nombre corto único (`atenea` o similar), manteniendo la misma semántica de comandos.

# 3. Árbol completo de comandos

```text
app
  models
    list
    search
    add
    update
    remove
    info
  run
    chat
    text-to-image
    image-to-image
    text-to-video
    image-to-video
  projects
    create
    list
    open
    delete
  sessions
    list
    info
    replay
  jobs
    list
    info
    cancel
  server
    start
    stop
```

# 4. Contrato de cada comando principal

- Comando: `app models list`
- Objetivo: listar modelos locales instalados y sus variantes/cuants.
- Flags clave: `--task`, `--format`, `--backend`, `--alignment-level`, `--json`.
- Entrada esperada: filtros opcionales.
- Salida esperada: tabla o JSON con `model`, `variant`, `quant`, `format`, `backend`, `alignment_level`.
- Ejemplo: `app models list --task chat --alignment-level uncensored --json`

- Comando: `app models search`
- Objetivo: buscar modelos en catálogos remotos configurados.
- Flags clave: `--query`, `--provider`, `--task`, `--limit`, `--json`.
- Entrada esperada: texto de búsqueda + filtros opcionales.
- Salida esperada: lista de candidatos con referencia instalable.
- Ejemplo: `app models search --provider hf --query "llama gguf" --task chat --limit 20`

- Comando: `app models add`
- Objetivo: descargar, verificar y registrar una variante concreta.
- Flags clave: `--ref`, `--revision`, `--quant`, `--format`, `--token-env`, `--allow-convert`.
- Entrada esperada: referencia de modelo + variante opcional.
- Salida esperada: confirmación con `model_id`, `variant_id`, `local_path`.
- Ejemplo: `app models add --ref hf://TheBloke/Llama-3-8B-GGUF --quant q4_k_m`

- Comando: `app models update`
- Objetivo: actualizar variante/modelo instalado.
- Flags clave: `--model`, `--to-revision`, `--recheck-integrity`, `--json`.
- Entrada esperada: modelo local y revisión/versión destino.
- Salida esperada: estado de actualización con before/after.
- Ejemplo: `app models update --model llama3-8b@q4_k_m --to-revision main`

- Comando: `app models remove`
- Objetivo: eliminar modelo/variante del registro y disco local.
- Flags clave: `--model`, `--purge-files`, `--force`, `--json`.
- Entrada esperada: identificador de modelo/variante.
- Salida esperada: confirmación y bytes liberados.
- Ejemplo: `app models remove --model old-model@q8_0 --purge-files`

- Comando: `app models info`
- Objetivo: inspeccionar metadatos completos de modelo/variante.
- Flags clave: `--model`, `--show-license`, `--show-quants`, `--json`.
- Entrada esperada: identificador de modelo/variante.
- Salida esperada: objeto completo con licencia, alignment y backend.
- Ejemplo: `app models info --model llama3-8b@q4_k_m --show-license`

- Comando: `app run chat`
- Objetivo: ejecutar inferencia de chat local.
- Flags clave: `--model`, `--quant`, `--device`, `--project`, `--session`, `--prompt`, `--temperature`, `--top-p`, `--max-tokens`, `--stream`, `--json`.
- Entrada esperada: prompt y parámetros de inferencia.
- Salida esperada: respuesta (stream o bloque) + `job_id`.
- Ejemplo: `app run chat --model llama3-8b@q4_k_m --prompt "resume este texto" --stream`

- Comando: `app run text-to-image`
- Objetivo: generar imagen desde texto.
- Flags clave: `--model`, `--device`, `--prompt`, `--negative-prompt`, `--width`, `--height`, `--steps`, `--cfg`, `--seed`, `--format`, `--quality`, `--project`, `--session`, `--out`.
- Entrada esperada: prompt + parámetros de imagen.
- Salida esperada: `job_id`, ruta de salida y sidecar JSON.
- Ejemplo: `app run text-to-image --model flux1-schnell@onnx --prompt "night city" --width 1024 --height 1024`

- Comando: `app run image-to-image`
- Objetivo: transformar imagen de entrada usando prompt.
- Flags clave: `--input`, `--strength`, `--prompt`, `--seed`, `--steps`, `--cfg`, `--out`.
- Entrada esperada: archivo de imagen válido + parámetros.
- Salida esperada: `job_id`, imagen resultante, sidecar JSON.
- Ejemplo: `app run image-to-image --input in.png --prompt "cinematic" --strength 0.5`

- Comando: `app run text-to-video`
- Objetivo: generar vídeo desde texto.
- Flags clave: `--model`, `--prompt`, `--fps`, `--duration`, `--resolution`, `--codec`, `--steps`, `--cfg`, `--seed`, `--export-frames`, `--device`, `--out`.
- Entrada esperada: prompt + parámetros de vídeo.
- Salida esperada: `job_id`, vídeo final, sidecar JSON, frames opcionales.
- Ejemplo: `app run text-to-video --model ltx-video@onnx --prompt "drone over canyon" --fps 24 --duration 6 --codec h264`

- Comando: `app run image-to-video`
- Objetivo: animar imagen inicial hacia secuencia de vídeo.
- Flags clave: `--input`, `--motion-strength`, `--fps`, `--duration`, `--resolution`, `--codec`, `--seed`, `--out`.
- Entrada esperada: imagen base + parámetros de movimiento.
- Salida esperada: `job_id`, vídeo final y sidecar.
- Ejemplo: `app run image-to-video --input keyframe.png --motion-strength 0.6 --fps 30 --duration 4`

- Comando: `app projects create`
- Objetivo: crear un proyecto con defaults operativos.
- Flags clave: `--name`, `--default-model`, `--default-device`, `--output-dir`, `--tags`.
- Entrada esperada: nombre y defaults opcionales.
- Salida esperada: `project_id` y configuración inicial.
- Ejemplo: `app projects create --name mi-lab --default-model llama3-8b@q4_k_m`

- Comando: `app projects list`
- Objetivo: listar proyectos disponibles.
- Flags clave: `--json`, `--tag`.
- Entrada esperada: filtros opcionales.
- Salida esperada: listado de proyectos con estado resumido.
- Ejemplo: `app projects list --json`

- Comando: `app projects open`
- Objetivo: establecer proyecto activo para comandos posteriores.
- Flags clave: `--project`.
- Entrada esperada: identificador de proyecto.
- Salida esperada: confirmación de contexto activo.
- Ejemplo: `app projects open --project mi-lab`

- Comando: `app projects delete`
- Objetivo: eliminar proyecto y opcionalmente sus artefactos.
- Flags clave: `--project`, `--purge`, `--force`.
- Entrada esperada: proyecto destino.
- Salida esperada: confirmación + resumen de borrado.
- Ejemplo: `app projects delete --project legacy --purge --force`

- Comando: `app sessions list`
- Objetivo: listar sesiones de un proyecto.
- Flags clave: `--project`, `--status`, `--json`.
- Entrada esperada: proyecto y filtros opcionales.
- Salida esperada: sesiones con fecha, tipo y estado.
- Ejemplo: `app sessions list --project mi-lab`

- Comando: `app sessions info`
- Objetivo: mostrar detalles de una sesión.
- Flags clave: `--session`, `--json`.
- Entrada esperada: identificador de sesión.
- Salida esperada: metadatos de sesión y resumen de jobs.
- Ejemplo: `app sessions info --session ses_20260506_01 --json`

- Comando: `app sessions replay`
- Objetivo: relanzar contexto de sesión con jobs seleccionados.
- Flags clave: `--session`, `--job-filter`, `--override`, `--json`.
- Entrada esperada: sesión y criterios de replay.
- Salida esperada: nuevos `job_id` con referencias de origen.
- Ejemplo: `app sessions replay --session ses_20260506_01 --job-filter type=t2i --override seed=999`

- Comando: `app jobs list`
- Objetivo: consultar jobs por estado, tipo o contexto.
- Flags clave: `--project`, `--session`, `--status`, `--type`, `--since`, `--json`.
- Entrada esperada: filtros opcionales.
- Salida esperada: listado paginable de jobs.
- Ejemplo: `app jobs list --project mi-lab --status failed --json`

- Comando: `app jobs info`
- Objetivo: inspeccionar un job y su trazabilidad.
- Flags clave: `--job`, `--show-logs`, `--show-sidecar`, `--json`.
- Entrada esperada: `job_id`.
- Salida esperada: especificación, runtime efectivo, outputs y eventos.
- Ejemplo: `app jobs info --job job_20260506_001 --show-sidecar`

- Comando: `app jobs cancel`
- Objetivo: cancelar job en ejecución o en cola.
- Flags clave: `--job`, `--reason`, `--force`.
- Entrada esperada: `job_id`.
- Salida esperada: estado final (`canceled`) o motivo de rechazo.
- Ejemplo: `app jobs cancel --job job_20260506_021 --reason "maintenance"`

- Comando: `app server start`
- Objetivo: iniciar servidor HTTP local.
- Flags clave: `--host`, `--port`, `--api-key`, `--model-alias-file`.
- Entrada esperada: parámetros de bind y seguridad local.
- Salida esperada: endpoint activo + configuración cargada.
- Ejemplo: `app server start --host 127.0.0.1 --port 8080`

- Comando: `app server stop`
- Objetivo: detener servidor local activo.
- Flags clave: `--graceful-timeout`.
- Entrada esperada: timeout opcional.
- Salida esperada: confirmación de apagado.
- Ejemplo: `app server stop --graceful-timeout 5s`

# 5. Flags globales

- `--json`: salida estructurada para scripts.
- `--verbose`: mayor detalle operativo.
- `--quiet`: salida mínima para pipelines.
- `--config <path>`: ruta explícita de configuración.
- `--profile <name>`: perfil de configuración (dev/workstation/cpu-only).
- `--no-color`: desactivar colores en terminal.
- `--version`: versión de CLI.
- `--help`: ayuda contextual.

# 6. Ejemplos de uso reales

```bash
# 1) Buscar e instalar modelo GGUF cuantizado
app models search --provider hf --query "llama 8b gguf" --task chat
app models add --ref hf://TheBloke/Llama-3-8B-GGUF --quant q4_k_m

# 2) Crear proyecto y ejecutar chat local en GPU automática
app projects create --name research --default-model llama3-8b@q4_k_m
app run chat --project research --model llama3-8b@q4_k_m --device auto --prompt "Resume el changelog"

# 3) Generación texto->imagen con metadatos reproducibles
app run text-to-image --project research --model flux1-schnell@onnx --prompt "industrial concept art" --width 1024 --height 1024 --steps 30 --cfg 4.0 --seed 42

# 4) Generación texto->vídeo con export de frames
app run text-to-video --project research --model ltx-video@onnx --prompt "slow camera orbit" --fps 24 --duration 6 --resolution 1280x720 --codec h264 --export-frames ./frames

# 5) Diagnóstico y cancelación de job
app jobs list --project research --status running
app jobs cancel --job job_20260506_021 --reason "operator request"
```

# 7. Estructura de carpetas del proyecto

```text
repo/
  core/
    application/
    orchestration/
    inference/
    contracts/

  cli/
    commands/
    parser/
    output/
    docs/

  models/
    registry/
    providers/
    downloader/
    converter/
    metadata/

  jobs/
    queue/
    scheduler/
    executor/
    history/

  storage/
    sqlite/
    filesystem/
    migrations/
    retention/

  server/
    routes/
    handlers/
    streaming/
    auth/

  config/
    defaults/
    profiles/
    schemas/

  docs/
    architecture/
    cli/
    operations/
```

# 8. Mapeo entre arquitectura y carpetas

- Núcleo de inferencia -> `core/inference/` + adaptadores en `core/contracts/`.
- Gestor de modelos -> `models/` + contrato de provider en `models/providers/`.
- Sistema de jobs -> `jobs/` + orquestación compartida en `core/orchestration/`.
- Almacenamiento local -> `storage/sqlite/` y `storage/filesystem/`.
- CLI -> `cli/commands/`, `cli/parser/`, `cli/output/`.
- Modo servidor local -> `server/routes/`, `server/handlers/`, `server/streaming/`.
- Configuración transversal -> `config/` + validación de esquema.

# 9. Estrategia de configuración

- Fuentes de configuración (precedencia alta -> baja):
  1. flags CLI,
  2. variables de entorno,
  3. perfil seleccionado,
  4. archivo global por defecto.
- Archivos sugeridos:
  - `config/defaults/app.toml`,
  - `config/profiles/<profile>.toml`,
  - `~/.config/app/config.toml`.
- Claves críticas:
  - rutas (`models_dir`, `outputs_dir`, `cache_dir`),
  - política de dispositivo (`device_default`),
  - concurrencia (`max_parallel_jobs`, `video_queue_limit`),
  - proveedores (`default_provider`, `provider_tokens_env`),
  - logging (`level`, `json_logs`).
- Validación:
  - comando de validación de configuración en startup y en `--help` contextual de errores.

# 10. Próximos pasos de implementación

1. Congelar contrato CLI v0 (nombres, flags, códigos de salida, JSON schema).
2. Implementar parser + normalización de flags globales en `cli/parser`.
3. Definir interfaces internas para:
   - model provider,
   - runtime backend,
   - job executor.
4. Implementar camino mínimo vertical:
   - `models search/add/info`,
   - `run chat`,
   - `jobs list/info/cancel`.
5. Añadir persistencia transaccional + sidecars JSON de outputs.
6. Incorporar `run text-to-image` y luego `text-to-video` con cola dedicada.
7. Añadir tests de contrato CLI (snapshot JSON + códigos de salida).
8. Documentar playbooks operativos (instalación, migraciones, recuperación, limpieza).
