# Diseño: Aplicación de escritorio Linux local para biblioteca de +100 modelos IA

## 1) Visión del producto

**Nombre de trabajo:** `Atenea Studio` (CLI-first, local-first).

Objetivo: una app nativa de Linux, privada y autónoma que permita **descargar, gestionar y ejecutar** modelos de IA sin nube, sin telemetría y sin launchers de terceros, con operación completamente offline tras la descarga inicial.

Principios:
- **Offline-first**: el runtime no depende de Internet para inferencia.
- **CLI como interfaz principal**: potente, scriptable, salida humana y `--json`.
- **Todo-en-uno**: gestor de modelos, inferencia, jobs, historial y exportación en el mismo producto.
- **Arquitectura extensible**: nuevos proveedores, formatos y backends sin rediseñar el núcleo.

---

## 2) Arquitectura de alto nivel

```text
┌─────────────────────────────────────────────────────────────────┐
│                    App Linux Nativa (Atenea)                   │
│  Binario principal + paquetes AppImage/Flatpak/DEB/RPM         │
├─────────────────────────────────────────────────────────────────┤
│ CLI Core (`atenea`)                                             │
│  - Parser comandos/subcomandos                                  │
│  - Salida humana / JSON                                         │
│  - Gestión proyectos/sesiones/jobs                              │
├─────────────────────────────────────────────────────────────────┤
│ Orchestrator                                                    │
│  - Planificador de jobs                                         │
│  - Selección backend/dispositivo                                │
│  - Colas y paralelismo                                          │
├─────────────────────────────────────────────────────────────────┤
│ Model Manager                                                   │
│  - Catálogo local + índice metadatos                            │
│  - Providers remotos (HF, HTTP genérico, etc.)                 │
│  - Versiones/cuants/conversiones                                │
├─────────────────────────────────────────────────────────────────┤
│ Runtime Layer (integrada)                                       │
│  - LLM: GGUF (llama.cpp embebido)                               │
│  - Visión/Multimedia: ONNX Runtime + módulos difusión/video     │
│  - Conversores: safetensors -> formato de ejecución             │
├─────────────────────────────────────────────────────────────────┤
│ Storage local                                                    │
│  - Modelos (content-addressed)                                  │
│  - Proyectos/sesiones/jobs                                      │
│  - Outputs + sidecars JSON                                      │
│  - Logs                                                         │
└─────────────────────────────────────────────────────────────────┘
```

Componentes desacoplados para permitir UI futura (Qt/GTK) y modo servidor local opcional sin tocar el core.

---

## 3) Distribución Linux nativa (sin terceros)

Incluye:
- Ejecutable principal `atenea` en `PATH`.
- Fichero `.desktop` + icono + entrada en menú.
- Paquetes:
  - **AppImage** (portable),
  - **Flatpak** (sandbox de escritorio),
  - **DEB/RPM** (integración distro).

Sin requerir Docker ni instalación manual de runtimes de IA.

---

## 4) Perfiles de hardware y expectativas

## Perfil mínimo (CPU-only)
- 4–6 cores CPU, 16 GB RAM, SSD.
- Tareas: chat LLM pequeño (3B–8B cuantizado), imagen básica baja resolución.
- Latencias orientativas:
  - Texto: 5–20 tok/s (modelo y cuantización dependiente).
  - Texto→imagen 512px: 30–120 s.
  - Imagen→imagen: 20–90 s.
  - Vídeo (corto): minutos largos, uso limitado.

## Perfil recomendado (GPU consumo 8–12 GB VRAM)
- 32 GB RAM + SSD rápido.
- Tareas: texto fluido, imagen práctica, vídeo básico.
- Latencias orientativas:
  - Texto: 25–90 tok/s en 7B–14B cuantizados.
  - Texto→imagen 768px: 6–20 s.
  - Imagen→imagen: 4–15 s.
  - Imagen→vídeo / texto→vídeo corto: 30–180 s.

## Perfil alto rendimiento (>=16 GB VRAM, ideal multi-GPU, 64 GB RAM+)
- Colas multimedia paralelas y lotes grandes.
- Latencias orientativas:
  - Texto: 80+ tok/s (según modelo/distribución).
  - Imagen alta resolución/lotes: 2–10 s por imagen.
  - Vídeo corto: 10–60 s (pipeline optimizado).

Escalado:
- **CPU-only**: más compatibilidad, menor throughput.
- **GPU consumo**: mejor relación costo/rendimiento.
- **Workstation**: paralelismo real, múltiples jobs concurrentes.

---

## 5) Proveedores de modelos (Model Providers)

Interfaz mínima por proveedor:
- `search(query, filters) -> [ModelHit]`
- `resolve(model_ref, version_or_quant) -> ResolvedArtifact`
- `download(resolved_artifact, dest, auth) -> LocalArtifact`

Proveedor inicial obligatorio:
- **Hugging Face Hub** como catálogo principal para descubrimiento/descarga.

Proveedor genérico fase 1:
- **HTTP/HTTPS** con token/cabeceras personalizadas.

Evolución prevista:
- `git clone` provider.
- `s3://` / object storage provider.
- registro privado corporativo.

Registro de modelos locales existentes:
- `models add --from-path /ruta/al/modelo` para indexar artefactos ya presentes.

---

## 6) Formatos y conversiones

LLMs:
- Ejecución principal: **GGUF**.
- Ingesta/almacenamiento: **safetensors** (y conversión a GGUF cuando aplique).

Visión/imagen/vídeo:
- Ejecución principal: **ONNX**.
- Ingesta frecuente: **safetensors** (conversión al grafo de ejecución).

Diseño extensible para futuros formatos (PyTorch checkpoints y formatos específicos de difusores).

---

## 7) Backends integrados de inferencia

- **LLM Engine**: runtime GGUF (familia llama.cpp) embebido en el producto.
- **Vision/Gen Engine**: ONNX Runtime embebido para modelos de difusión/visión.
- **Video Engine**: pipeline interno para generación/interpolación de frames + ensamblado.
- **Media IO**:
  - Imagen: PNG/JPG.
  - Vídeo: MP4 (H.264 por defecto), WebM (VP9 opcional).

Todo integrado en paquete/binario (sin instalaciones manuales de usuario).

---

## 8) Gestión de biblioteca y metadatos

Comandos requeridos:
- `models list`
- `models search`
- `models add`
- `models update`
- `models remove`
- `models info`

Versionado y variantes:
- `modelo@v1`
- `modelo@q4_k_m`
- `modelo@q8_0`

Metadatos mínimos por modelo:
- `id`, `name`, `provider`, `source_uri`
- `task` (chat, t2i, i2i, t2v, i2v)
- `format` (gguf, onnx, safetensors)
- `size_bytes`, `license`
- `installed_at`, `updated_at`
- `backend_support[]`
- `alignment_level` (`uncensored|lightly_aligned|strongly_aligned`)
- `alignment_notes`
- opcionales: `nsfw_allowed`, `safety_filters_enabled`

Filtros:
- `--task`, `--size`, `--backend`, `--license`, `--alignment-level`.

---

## 9) Cuantización explícita

Flags CLI:
- `--quant q4_k_m`
- `--quant q5_k_s`
- `--quant q8_0`

Comportamiento:
- Detección automática de cuants disponibles por modelo.
- Selección por notación de variante (`llama3-8b@q4_k_m`).
- Sugerencia por defecto razonable (ej. `q4_k_m` en hardware medio).

---

## 10) Proyectos, sesiones e historial reproducible

### Proyecto
Agrupa:
- modelos/variantes por defecto,
- presets de inferencia,
- plantillas de prompt,
- rutas de salida,
- etiquetas/metadatos.

### Sesión
Contexto operativo dentro de un proyecto:
- conversación chat,
- lote de imágenes,
- batch multimedia.

Persistencia:
- prompts, parámetros, seeds, timestamps, backend/dispositivo, versión app.
- posibilidad de repetir exacto o con diffs pequeños.

Estructura sugerida en disco:
```text
~/.local/share/atenea/
  models/
  projects/<project_id>/
    config.yaml
    sessions/<session_id>/
      jobs/<job_id>.json
      outputs/
      logs/
  cache/
  registry.db
```

---

## 11) CLI avanzada (UX + automatización)

Convenciones:
- `--help`, `--version`, `--verbose`, `--quiet`, `--json`.
- Códigos de salida estables.
- Mensajes de error accionables.

Batch:
- `run batch -f jobs.yaml`
- `run batch -f jobs.json --json`

Histórico y repetición:
- `jobs list`
- `jobs info <id>`
- `jobs rerun <id> [--set key=value]`

Plantillas:
- `prompts template add/use/list`.

Export:
- `jobs export <id> --format json|yaml`.

---

## 12) Modo servidor local (opcional)

`atenea serve --host 127.0.0.1 --port 8080`

Endpoints compatibles (subset OpenAI-like):
- `POST /v1/chat/completions`

Campos soportados:
- `model`, `messages[]` (roles `system|user|assistant`),
- `temperature`, `top_p`, `max_tokens`,
- streaming (SSE/chunks).

Mapeo de modelos:
- alias API -> referencia local, ejemplo:
  - `gpt-oss-local` -> `llama3-8b@q4_k_m`
  - configurable en `api-model-aliases.yaml`.

---

## 13) Detección de dispositivo y fallback

Selección de dispositivo:
- `--device auto`
- `--device cpu`
- `--device cuda:0`

Política:
1. intenta GPU compatible,
2. si falla, cae a CPU automáticamente,
3. registra selección final en logs/job metadata.

Registro por job:
- backend elegido,
- dispositivo elegido,
- motivo del fallback (si aplica).

---

## 14) Multimedia: parámetros y salidas

Comandos clave:
- Texto→imagen: `atenea gen image --prompt ...`
- Imagen→imagen: `atenea gen img2img --input in.png --prompt ...`
- Texto→vídeo: `atenea gen video --prompt ...`
- Imagen→vídeo: `atenea gen i2v --input in.png --prompt ...`

Flags:
- Imagen: `--width --height --format png|jpg --quality`
- Vídeo: `--fps --duration --resolution --codec h264|vp9`
- Generación: `--seed --steps --cfg --negative-prompt`
- Export extra: `--export-frames ./frames/`

Sidecar JSON obligatorio por output:
- modelo y variante,
- prompt/negative,
- seed, steps, cfg,
- resolución, fps, duración,
- backend/dispositivo,
- fecha/hora,
- versión app,
- hash de artefacto de modelo.

También embebido cuando sea viable en metadatos de imagen/vídeo.

---

## 15) Catálogo inicial de +100 modelos

Estrategia:
- incluir un **índice curado** (manifiesto) con >100 entradas referenciales (no redistribuir pesos cerrados).
- cada entrada contiene:
  - tipo de tarea,
  - licencia,
  - formato,
  - variantes/cuants,
  - nivel de alineamiento.

Política legal:
- priorizar open-source permisivo.
- mostrar siempre licencia/restricciones en `models info`.
- permitir modelos uncensored cuando licencia lo permita.
- modelos propietarios: solo instrucciones para importación manual.

---

## 16) Ejemplo de estructura de comandos

```bash
atenea models search "llama" --task chat --alignment-level uncensored
atenea models add hf://TheBloke/Llama-3-8B-GGUF --quant q4_k_m
atenea models list --task chat --json

atenea project create mi-lab --default-model llama3-8b@q4_k_m
atenea session start mi-lab --name experimento-01

atenea chat \
  --project mi-lab \
  --model llama3-8b@q4_k_m \
  --prompt "Diseña una arquitectura hexagonal" \
  --temperature 0.7

atenea gen image \
  --project mi-lab \
  --model flux1-schnell@onnx-fp16 \
  --prompt "cyberpunk alley at night" \
  --width 1024 --height 1024 --steps 28 --cfg 4.0 --seed 1234

atenea jobs list --project mi-lab
atenea jobs rerun job_20260506_001 --set steps=35 --set seed=999
```

---

## 17) Flujo diario del usuario avanzado

1. Busca e instala variantes de modelos con `models search/add`.
2. Crea proyecto con defaults de modelos y rutas.
3. Lanza sesiones (chat, imagen o vídeo).
4. Revisa outputs y sidecars JSON para trazabilidad.
5. Repite jobs con pequeños cambios (`jobs rerun --set ...`).
6. Exporta resultados/metadata para CI o auditoría.

Resultado: experiencia Linux nativa, privada, reproducible y automatizable.

---

## 18) Recomendación de stack de implementación

- **Lenguaje core/CLI**: Rust (binario estático robusto, buen rendimiento y UX CLI).
- **Persistencia metadatos**: SQLite + archivos JSON sidecar.
- **Descargas**: cliente HTTP nativo con reanudación y checksum.
- **Orquestación**: scheduler interno con colas por prioridad.
- **Packaging**: AppImage + DEB/RPM + Flatpak.

Esto maximiza portabilidad, rendimiento y control total local.
