# MVP técnico (2 semanas) + congelación de contrato v0

## 1) Objetivo del MVP

Validar un flujo funcional mínimo de extremo a extremo:

1. `models search`
2. `models add`
3. `run chat`
4. `jobs list`
5. `jobs info`

Este MVP prueba CLI, persistencia, ciclo de jobs y ejecución local en un único recorrido operativo.

## 2) Decisiones de alcance v0 (no breaking)

- Nombre canónico de CLI: **`app`**.
- Alias temporal permitido en documentación: `atenea` (solo referencia histórica).
- Contrato estable v0:
  - nombres de comandos y subcomandos,
  - flags clave,
  - esquema de salida JSON.
- Cualquier cambio incompatible deberá elevar versión de contrato (v1+).

## 3) Sprint sugerido (2 semanas)

### Semana 1
- Parser CLI base + flags globales.
- Implementación funcional de `models search`, `models add`, `models info`.
- Persistencia SQLite inicial + migración `0001_init.sql`.
- Registro de eventos básicos en tabla `events`.

### Semana 2
- Implementación funcional de `run chat`.
- Creación de jobs con estados y persistencia.
- Implementación de `jobs list` y `jobs info`.
- Generación de sidecar JSON v0 por ejecución.

## 4) Criterios de aceptación

- Se pueden buscar y registrar modelos desde CLI.
- `run chat` produce respuesta local y crea `job_id` persistido.
- `jobs list/info` reflejan trazabilidad real de ejecución.
- Sidecar JSON v0 se escribe por cada job completado.
- No hay cambios breaking en comandos/flags/JSON durante el sprint.

## 5) Entregables técnicos mínimos

- `storage/migrations/0001_init.sql`
- `config/defaults/app.toml`
- especificación JSON sidecar v0 en `docs/contracts/sidecar_v0.schema.json`
- documentación de contrato CLI v0 en `docs/contracts/app_cli_contract_v0.md`

## 6) Riesgos y mitigación

- Riesgo: cambios de naming (`app` vs `atenea`).
  - Mitigación: oficializar `app` en contratos y mantener alias solo en notas.
- Riesgo: esquema de DB insuficiente.
  - Mitigación: migración v0 enfocada en entidades mínimas + tabla `events` genérica.
- Riesgo: bloqueo futuro por vídeo.
  - Mitigación: dejar definido desde v0 el hook de cola multimedia separada.
