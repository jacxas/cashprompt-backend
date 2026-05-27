# Window Manager (MVP v0)

Este módulo define el **window manager lógico** para la futura UI local.

## Alcance
- Modelo de ventanas/paneles para sesiones y jobs.
- Layouts (`single`, `split`, `grid`).
- Enrutado de foco y eventos de UI a comandos del core.

## Fuera de alcance
- Renderizado gráfico real (GTK/Qt).
- Compositor del sistema.
- Integración con X11/Wayland en v0.

## Interfaces objetivo (contrato)
- `create_window(kind, context) -> window_id`
- `close_window(window_id)`
- `set_layout(layout)`
- `focus(window_id)`
- `dispatch_ui_event(window_id, event)`

## Tipos de ventana
- `session_view`
- `job_monitor`
- `model_library`
- `logs_console`
