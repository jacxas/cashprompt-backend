# 1. Objetivo principal del sistema

- Construir una plataforma local de IA para Linux que ejecute modelos de texto e imagen/vídeo sin servicios cloud obligatorios.
- Garantizar operación **offline** después de la descarga inicial de modelos.
- Centralizar en un único producto local:
  - gestión de biblioteca de modelos,
  - inferencia,
  - ejecución de jobs,
  - organización de proyectos/sesiones,
  - trazabilidad de resultados.
- Mantener foco explícito en privacidad, control del usuario y soporte para modelos con distintos niveles de alineamiento (incluyendo `uncensored` cuando la licencia lo permita).

# 2. Público objetivo

- Usuarios técnicos de Linux con experiencia en terminal.
- Perfiles principales:
  - desarrolladores que integran inferencia local en scripts/automatizaciones,
  - usuarios avanzados que administran modelos y recursos de hardware local.
- Requisito de usabilidad técnica:
  - CLI consistente, `--help` completo, ejemplos integrados y errores accionables.

# 3. Requisitos funcionales

- Proveer interfaz principal CLI y modo servidor local opcional.
- Ejecutar cargas:
  - chat/LLM,
  - texto→imagen,
  - imagen→imagen,
  - texto→vídeo,
  - imagen→vídeo.
- Gestionar jobs con estados (`queued`, `running`, `completed`, `failed`, `canceled`), cancelación y reejecución.
- Mantener histórico reproducible de ejecución (entrada, parámetros, artefactos, salida).
- Permitir ejecución batch desde JSON/YAML para uso scriptable.
- Exponer salida en formato humano y `--json` estable.
- Soportar selección de dispositivo por comando (`auto`, `cpu`, `cuda:0`, etc.) con fallback automático a CPU.

# 4. Requisitos no funcionales

- **Privacidad:** sin telemetría remota obligatoria; logs y métricas solo locales por defecto.
- **Autonomía:** sin dependencia de launchers externos ni Docker obligatorio.
- **Disponibilidad offline:** inferencia y gestión local operativas sin conectividad tras instalación de modelos.
- **Reproducibilidad:** sidecar JSON por salida y persistencia completa de parámetros.
- **Mantenibilidad:** arquitectura modular por capas (interfaz, orquestación, modelos, inferencia, almacenamiento).
- **Portabilidad Linux:** empaquetado nativo y rutas estándar XDG.

# 5. Gestión de modelos

- Comandos mínimos:
  - `models list`, `models search`, `models add`, `models update`, `models remove`, `models info`.
- Modelo de proveedor (provider contract):
  - `search(query, filters)`,
  - `resolve(ref, variant)`,
  - `download(artifact, auth)`.
- Proveedor inicial:
  - Hugging Face Hub como catálogo principal.
- Extensibilidad:
  - proveedor HTTP/HTTPS con token/cabeceras,
  - soporte futuro para `git` y object storage.
- Gestión de variantes:
  - versiones/revisiones,
  - cuantizaciones (`q4_k_m`, `q5_k_s`, `q8_0`),
  - metadatos de compatibilidad por backend.
- Metadatos de catálogo local por modelo/variante:
  - licencia,
  - origen,
  - formato,
  - tamaño,
  - fecha de instalación/actualización,
  - `alignment_level` y `alignment_notes`.

# 6. Backends y formatos

- LLM:
  - formato de ejecución principal: **GGUF**,
  - runtime local integrado compatible con GGUF.
- Visión/multimedia:
  - formato de ejecución principal: **ONNX**,
  - runtime local integrado para ONNX.
- Formato de ingesta común:
  - **safetensors** con conversión local cuando sea necesario.
- Regla operativa:
  - el usuario no instala runtimes externos manualmente; la plataforma integra y gestiona lo necesario.
- Detección de hardware:
  - auto-selección de aceleración cuando exista,
  - fallback transparente a CPU con registro del backend/dispositivo efectivo.

# 7. CLI y flujos de usuario

- Estructura base de comandos:
  - `models ...`,
  - `run chat|text-to-image|image-to-image|text-to-video|image-to-video|batch`,
  - `projects ...`, `sessions ...`, `jobs ...`, `server start|status|stop`.
- Convenciones globales:
  - `--help`, `--version`, `--verbose`, `--quiet`, `--json`.
- Flags transversales:
  - `--model`, `--quant`, `--device`, `--project`, `--session`.
- Flujos operativos principales:
  1. buscar e instalar variante de modelo,
  2. ejecutar job con parámetros explícitos,
  3. inspeccionar output + sidecar,
  4. reejecutar desde historial con overrides.
- Modo servidor local:
  - endpoint tipo OpenAI-like para chat (`/v1/chat/completions`) con streaming opcional.

# 8. Almacenamiento, sesiones y proyectos

- Persistencia híbrida:
  - SQLite para metadatos transaccionales,
  - filesystem para artefactos y outputs.
- Proyecto:
  - defaults de modelos, presets, rutas de salida y etiquetas.
- Sesión:
  - contexto de trabajo dentro de un proyecto (chat o lote multimedia).
- Job:
  - unidad reproducible con especificación completa (`prompt`, `seed`, `steps`, `cfg`, dispositivo, modelo/variante).
- Estructura local sugerida:
  - `~/.local/share/<app>/models/`,
  - `.../projects/<project>/sessions/<session>/jobs/<job>/`,
  - `.../db/registry.sqlite`,
  - `.../cache/`.

# 9. Multimedia y metadatos

- Formatos de salida mínimos:
  - imagen: PNG/JPG,
  - vídeo: MP4 (H.264 por defecto), WebM (VP9 opcional).
- Parámetros multimedia controlables por CLI:
  - `width`, `height`, `fps`, `duration`, `resolution`, `codec`,
  - `seed`, `steps`, `cfg`, `negative_prompt`.
- Sidecar JSON obligatorio por artefacto:
  - modelo y variante/quant,
  - prompt/negative prompt,
  - seed/steps/cfg,
  - resolución/fps/duración,
  - backend y dispositivo usados,
  - timestamps,
  - versión de la app.
- Requisito de trazabilidad:
  - todo output debe poder reproducirse desde metadatos persistidos.

# 10. Distribución e instalación en Linux

- Formatos de distribución objetivo:
  - AppImage,
  - DEB/RPM,
  - Flatpak (opcional según política de despliegue).
- Integración de escritorio:
  - ejecutable CLI en `PATH`,
  - `.desktop`, icono y entrada de menú.
- Política de dependencias:
  - runtime principal incluido en paquete,
  - aceleración GPU como capacidad opcional autodetectada.
- Criterio operativo:
  - instalación única y uso directo sin setup manual de componentes externos.

# 11. Riesgos, tradeoffs y decisiones abiertas

- Riesgos técnicos:
  - variabilidad de drivers/aceleración GPU por distro,
  - coste de almacenamiento por múltiples variantes y outputs de vídeo,
  - tiempos de conversión al instalar formatos no ejecutables directos.
- Tradeoffs:
  - integrar runtimes en paquete simplifica uso pero aumenta tamaño de distribución,
  - priorizar reproducibilidad incrementa volumen de metadatos/logs.
- Decisiones abiertas para cierre de diseño:
  - política final de versionado del esquema JSON de salida,
  - límites por defecto de concurrencia por perfil de hardware,
  - política de limpieza automática de caché y artefactos temporales,
  - nivel exacto de compatibilidad OpenAI-like fuera de chat.
