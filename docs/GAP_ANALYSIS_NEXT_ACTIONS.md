# Gap analysis: qué falta para pasar de blueprint a MVP ejecutable

## Estado actual

El repositorio ya tiene:
- arquitectura y contratos de CLI/documentación,
- configuración base,
- migración inicial SQLite,
- estructura modular de carpetas.

## Falta crítico (bloquea MVP)

1. **Binario CLI real (entrypoint)**
   - `app` aún no existe como ejecutable funcional.
   - Falta parser de argumentos y wiring de subcomandos.

2. **Capa de aplicación mínima**
   - No existe implementación de casos de uso para:
     - `models search`
     - `models add`
     - `run chat`
     - `jobs list/info`

3. **Repositorio/persistencia activa**
   - Existe schema SQL, pero no hay código que aplique migraciones ni lea/escriba tablas.

4. **Runtime de inferencia conectado**
   - No hay integración ejecutable con backend GGUF/ONNX.

5. **Contrato de salida en runtime**
   - Hay sidecar schema, pero falta generador/validador en ejecución real.

6. **Pruebas automáticas mínimas**
   - No hay tests de contrato CLI ni tests de persistencia básica.

## Falta importante (no bloquea primer demo, pero debe planearse)

1. Cola separada multimedia (hook ya definido, sin implementación).
2. Modo servidor local `/v1/chat/completions`.
3. Gestión de errores y códigos de salida estables por comando.
4. Playbook de operación local (arranque, migración, limpieza de cache).

## Plan recomendado inmediato (orden de ejecución)

1. Implementar `app --help` + árbol de subcomandos vacío.
2. Implementar bootstrap de config (`config/defaults/app.toml`).
3. Implementar bootstrap de DB + ejecución de `0001_init.sql`.
4. Implementar `models search` (mock provider local inicial).
5. Implementar `models add` (registro local sin descarga completa en v0.1).
6. Implementar `run chat` con backend stub y creación de job persistido.
7. Implementar `jobs list` y `jobs info` desde DB.
8. Emitir sidecar JSON v0 en ejecuciones completadas.
9. Añadir tests de humo CLI (`--help`, `jobs list`) y tests de migración.

## Criterio de “MVP listo”

- Un usuario puede ejecutar, en local:
  1. `app models search`
  2. `app models add`
  3. `app run chat --prompt "..."`
  4. `app jobs list`
  5. `app jobs info <job_id>`
- Todos los pasos generan trazabilidad persistida y salida JSON estable.
