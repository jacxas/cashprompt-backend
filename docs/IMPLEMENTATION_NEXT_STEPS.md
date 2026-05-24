# Sugerencias aplicables e implementación inicial

## Objetivo
Convertir la documentación existente en una base implementable mínima sin introducir dependencias externas obligatorias.

## Sugerencias concretas (priorizadas)

1. **Congelar contrato CLI v0 antes de programar comandos**
   - Cerrar nombres, flags y esquema JSON de salida.
   - Evita refactors costosos en scripts automatizados.

2. **Implementar un vertical slice pequeño**
   - `models search`, `models add`, `models info`.
   - `run chat`.
   - `jobs list`.
   - Cubre de punta a punta: entrada CLI -> job -> persistencia -> salida.

3. **Definir esquema SQLite desde el día 1**
   - Tablas mínimas: `models`, `model_variants`, `projects`, `sessions`, `jobs`, `job_outputs`, `events`.
   - Añadir migraciones versionadas.

4. **Estabilizar sidecar JSON**
   - Estructura única para todos los outputs.
   - Incluir: `model`, `variant`, `seed`, `steps`, `cfg`, `device_used`, timestamps.

5. **Separar cola multimedia desde inicio**
   - Evita que `text-to-video` bloquee chat o imagen.

## Implementación aplicada en este commit

- Se creó el esqueleto de módulos en la raíz del repositorio:
  - `core/`, `cli/`, `models/`, `jobs/`, `storage/`, `server/`, `config/`.
- Cada módulo incluye un `README.md` de arranque para fijar límites y referencia documental.

## Próximo commit recomendado

1. Añadir `config/defaults/app.toml` con rutas y parámetros base.
2. Crear `storage/migrations/0001_init.sql` con tablas mínimas.
3. Añadir comando stub `app --help` + subcomandos vacíos con códigos de salida definidos.
