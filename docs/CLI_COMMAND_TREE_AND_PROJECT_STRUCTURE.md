# Diseño CLI completo + estructura de proyecto (Linux local AI)

## 1) Árbol completo de comandos

## Estilo aplicado al árbol

Se usa exactamente el formato solicitado de jerarquía por indentación:

```text
app
  models
    list
    add
  run
    chat
    text-to-image
```

```text
app
  version
  doctor
  config
    init
    show
    set
    validate

  models
    list
    search
    add
    update
    remove
    info
    register-local
    verify
    convert
    pull-catalog

  projects
    create
    list
    info
    set-defaults
    archive
    delete

  sessions
    start
    list
    info
    close
    replay

  prompts
    template
      add
      list
      show
      update
      remove
      apply

  run
    chat
    text-to-image
    image-to-image
    text-to-video
    image-to-video
    batch

  jobs
    list
    info
    logs
    cancel
    rerun
    export
    prune

  server
    start
    status
    stop

  cache
    stats
    clean
```

---

## 2) Comandos importantes (descripción, flags, ejemplos)

## `models list`
**Descripción:** lista modelos/variantes instalados en local con filtros.

**Flags clave:**
- `--task chat|t2i|i2i|t2v|i2v`
- `--format gguf|onnx|safetensors`
- `--backend llama-cpp|onnxruntime`
- `--alignment-level uncensored|lightly_aligned|strongly_aligned`
- `--license <spdx>`
- `--json`

**Ejemplos:**
```bash
atenea models list
atenea models list --task chat --alignment-level uncensored
atenea models list --format gguf --json
```

## `models search`
**Descripción:** busca modelos en proveedores (HF por defecto, HTTP/plugin opcional).

**Flags clave:**
- `--provider hf|http|<plugin>`
- `--query "..."`
- `--task ...`
- `--license ...`
- `--alignment-level ...`
- `--limit 50`
- `--json`

**Ejemplos:**
```bash
atenea models search --query "llama 8b gguf" --task chat
atenea models search --provider hf --query "flux" --task t2i --limit 20
atenea models search --query "uncensored" --alignment-level uncensored --json
```

## `models add`
**Descripción:** descarga e instala una variante específica de modelo.

**Flags clave:**
- `--ref hf://org/model` o `http(s)://...`
- `--revision <tag|sha>`
- `--quant q4_k_m|q5_k_s|q8_0`
- `--format gguf|onnx|safetensors`
- `--token-env HF_TOKEN`
- `--allow-convert`
- `--project <id>` (opcional: set default model del proyecto)

**Ejemplos:**
```bash
atenea models add --ref hf://TheBloke/Llama-3-8B-GGUF --quant q4_k_m
atenea models add --ref hf://black-forest-labs/FLUX.1-schnell --format onnx --allow-convert
atenea models add --ref https://registry.local/models/my-llm.gguf --token-env REG_TOKEN
```

## `models info`
**Descripción:** muestra metadatos completos, licencia, alineamiento, cuants disponibles.

**Flags clave:**
- `--model <name@variant>`
- `--show-quants`
- `--show-license`
- `--json`

**Ejemplos:**
```bash
atenea models info --model llama3-8b@q4_k_m
atenea models info --model flux1-schnell@onnx-fp16 --show-license
atenea models info --model mistral-7b --show-quants --json
```

## `run chat`
**Descripción:** inferencia LLM local con estado de sesión opcional.

**Flags clave:**
- `--model <name@quant>`
- `--quant ...` (override rápido)
- `--device auto|cpu|cuda:0|rocm:0`
- `--project <id>` / `--session <id>`
- `--system "..."` / `--prompt "..."`
- `--temperature` `--top-p` `--max-tokens`
- `--stream`
- `--json`

**Ejemplos:**
```bash
atenea run chat --model llama3-8b@q4_k_m --prompt "Resume este log" --stream
atenea run chat --project mi-lab --session ses_001 --model mistral-7b@q5_k_s --temperature 0.6
atenea run chat --model phi-3-mini@q8_0 --device cpu --max-tokens 300 --json
```

## `run text-to-image`
**Descripción:** genera imagen desde prompt de texto.

**Flags clave:**
- `--model <name@variant>`
- `--device auto|cpu|cuda:0`
- `--prompt` / `--negative-prompt`
- `--width` `--height`
- `--steps` `--cfg` `--seed`
- `--format png|jpg` `--quality`
- `--project` `--session` `--out`

**Ejemplos:**
```bash
atenea run text-to-image --model flux1-schnell@onnx-fp16 --prompt "futuristic city" --width 1024 --height 1024
atenea run text-to-image --project mi-lab --session art-01 --prompt "forest temple" --steps 30 --cfg 4.5 --seed 123
atenea run text-to-image --model sdxl-base@onnx --format jpg --quality 92 --out ./renders
```

## `run image-to-image`
**Descripción:** transforma una imagen de entrada guiada por prompt.

**Flags clave:**
- `--input <path>`
- `--strength 0..1`
- flags comunes de `text-to-image`

**Ejemplos:**
```bash
atenea run image-to-image --model flux1-dev@onnx --input ./in.png --prompt "anime style" --strength 0.45
atenea run image-to-image --input ./photo.jpg --prompt "cinematic lighting" --seed 77
atenea run image-to-image --project branding --session v2 --input logo.png --format png
```

## `run text-to-video`
**Descripción:** genera vídeo desde texto con pipeline local y codificación integrada.

**Flags clave:**
- `--model <name@variant>`
- `--prompt` / `--negative-prompt`
- `--fps` `--duration` `--resolution 1280x720`
- `--steps` `--cfg` `--seed`
- `--codec h264|vp9`
- `--export-frames <dir>`
- `--device auto|cpu|cuda:0`

**Ejemplos:**
```bash
atenea run text-to-video --model ltx-video@onnx --prompt "drone shot over cliffs" --fps 24 --duration 6 --codec h264
atenea run text-to-video --project clips --session ad1 --prompt "product reveal" --resolution 1920x1080 --seed 2026
atenea run text-to-video --prompt "surreal ocean" --fps 16 --duration 4 --export-frames ./frames
```

## `run image-to-video`
**Descripción:** anima imagen inicial para producir vídeo.

**Flags clave:**
- `--input <path>`
- `--motion-strength`
- resto de flags de vídeo (`--fps`, `--duration`, `--codec`, `--seed`, etc.)

**Ejemplos:**
```bash
atenea run image-to-video --model i2v-pro@onnx --input ./keyframe.png --prompt "gentle camera pan" --duration 5
atenea run image-to-video --input portrait.jpg --motion-strength 0.6 --fps 30 --codec vp9
atenea run image-to-video --project trailer --session s03 --input scene.png --resolution 1280x720
```

## `run batch`
**Descripción:** ejecuta lotes desde JSON/YAML para automatización CI/scripts.

**Flags clave:**
- `--file jobs.yaml|jobs.json`
- `--project` `--session`
- `--continue-on-error`
- `--max-parallel`
- `--json`

**Ejemplos:**
```bash
atenea run batch --file ./jobs.yaml
atenea run batch --file ./pipeline.json --max-parallel 2 --continue-on-error
atenea run batch --project nightly --session render-2026-05-06 --file jobs.yaml --json
```

## `projects create`
**Descripción:** crea proyecto con defaults de modelos/rutas.

**Flags clave:**
- `--name`
- `--default-model`
- `--default-device auto|cpu|cuda:0`
- `--output-dir`
- `--tags`

**Ejemplos:**
```bash
atenea projects create --name mi-lab --default-model llama3-8b@q4_k_m
atenea projects create --name media-lab --default-device cuda:0 --output-dir ~/AI/media
atenea projects create --name private-rd --tags "uncensored,offline"
```

## `sessions start`
**Descripción:** inicia sesión de trabajo dentro de un proyecto.

**Flags clave:**
- `--project <id>`
- `--name <session-name>`
- `--from-template <prompt-template>`

**Ejemplos:**
```bash
atenea sessions start --project mi-lab --name pruebas-mayo
atenea sessions start --project clips --name teaser-v1 --from-template storyboard
atenea sessions start --project chatops --name incident-4421
```

## `jobs list`
**Descripción:** lista trabajos por estado/proyecto/sesión/tipo.

**Flags clave:**
- `--project` `--session`
- `--status queued|running|completed|failed|canceled`
- `--type chat|t2i|i2i|t2v|i2v`
- `--since` `--limit`
- `--json`

**Ejemplos:**
```bash
atenea jobs list --project mi-lab --status failed
atenea jobs list --type t2v --since 24h
atenea jobs list --session ses_20260506 --json
```

## `jobs rerun`
**Descripción:** repite job histórico con overrides puntuales.

**Flags clave:**
- `--job <id>`
- `--set key=value` (repetible)
- `--device ...`
- `--json`

**Ejemplos:**
```bash
atenea jobs rerun --job job_20260506_001
atenea jobs rerun --job job_20260506_001 --set seed=999 --set steps=35
atenea jobs rerun --job job_20260506_101 --device cpu --json
```

## `server start`
**Descripción:** levanta API HTTP local compatible con `/v1/chat/completions`.

**Flags clave:**
- `--host 127.0.0.1`
- `--port 8080`
- `--api-key <token-local-opcional>`
- `--model-alias-file ./api-model-aliases.yaml`
- `--cors allow-local`

**Ejemplos:**
```bash
atenea server start --host 127.0.0.1 --port 8080
atenea server start --port 8000 --model-alias-file ./api-model-aliases.yaml
atenea server start --api-key local-dev-key --cors allow-local
```

---

## 3) Estructura de carpetas y módulos sugerida

```text
/atenea
  /apps
    /cli
      /src
        main.rs
        /commands
          models.rs
          run.rs
          projects.rs
          sessions.rs
          jobs.rs
          server.rs
          config.rs
        /output
          table.rs
          json.rs
        /parsers
          args.rs
          validators.rs

    /server
      /src
        main.rs
        routes_chat.rs
        streaming.rs
        auth_local.rs

  /core
    /api
      facade.rs            # contratos de alto nivel consumidos por CLI/Server/UI

    /orchestration
      job_manager.rs
      queue_manager.rs
      scheduler.rs
      execution_planner.rs
      retry_policy.rs

    /inference
      /device
        detector.rs
        selector.rs
      /runtimes
        gguf_llama_cpp.rs
        onnx_runtime.rs
      /pipelines
        chat.rs
        text_to_image.rs
        image_to_image.rs
        text_to_video.rs
        image_to_video.rs
      /media
        encoder.rs         # mp4 h264 / webm vp9
        frames.rs

    /models
      registry.rs
      metadata.rs
      providers/
        provider_trait.rs  # search/resolve/download
        huggingface.rs
        http_generic.rs
      downloader.rs
      integrity.rs
      conversion/
        safetensors_to_gguf.rs
        safetensors_to_onnx.rs

    /storage
      sqlite/
        schema.sql
        migrations/
        repo_models.rs
        repo_projects.rs
        repo_sessions.rs
        repo_jobs.rs
      fs/
        paths.rs
        artifact_store.rs
        output_store.rs
        log_store.rs

    /telemetry_local
      logger.rs            # solo local, sin envío remoto
      events.rs
      metrics.rs

  /config
    defaults.toml
    logging.toml
    providers.toml

  /packaging
    /appimage
    /deb
    /rpm
    /flatpak
    atenea.desktop
    icon.png

  /docs
    ARCHITECTURE_HIGH_LEVEL.md
    LOCAL_LINUX_AI_STUDIO.md
    CLI_COMMAND_TREE_AND_PROJECT_STRUCTURE.md
```

### Nota de modularidad
- `apps/cli` y `apps/server` solo usan `core/api/facade.rs`.
- `core` concentra reglas de negocio y casos de uso.
- `storage` se divide en persistencia transaccional (SQLite) y binaria (FS).
- `models/providers` permite añadir fuentes nuevas sin tocar CLI ni pipelines.

---

## 4) Convenciones UX y compatibilidad automatización

- Salida humana por defecto; `--json` en todos los comandos de gestión/ejecución.
- Códigos de salida consistentes:
  - `0` éxito,
  - `2` error de argumentos,
  - `3` recurso no encontrado,
  - `4` fallo de descarga/red,
  - `5` fallo de inferencia.
- `--verbose` y `--quiet` globales.
- Todos los jobs guardan sidecar JSON reproducible (prompt, seed, steps, cfg, modelo, quant, dispositivo, versión app).
- Nunca dependencia obligatoria de Docker/servicios externos.
