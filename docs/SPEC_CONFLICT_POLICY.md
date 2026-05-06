# Política de resolución de conflictos de especificación

## Regla de precedencia

- Si existe conflicto entre documentos de diseño derivados y la especificación base del producto, **prevalece la especificación base**.
- Los documentos derivados (arquitectura, CLI, estructura de repo, decisiones técnicas) se consideran interpretaciones implementables y no pueden contradecir requisitos base.

## Conflictos detectados en el set actual

1. **Nombre del ejecutable en ejemplos (`atenea` vs `app`)**
   - Conflicto: algunos documentos usan `atenea` como nombre de trabajo y otros usan `app` por formato contractual.
   - Resolución: mantener `app` como alias neutro en contratos y considerar `atenea` solo como placeholder de naming.
   - Impacto: no funcional; afecta únicamente documentación de ejemplo.

2. **Alcance de endpoints en modo servidor local**
   - Conflicto potencial: algunos textos sugieren compatibilidad OpenAI-like amplia, mientras la base exige al menos `/v1/chat/completions`.
   - Resolución: fijar mínimo obligatorio en `/v1/chat/completions`; cualquier endpoint adicional queda como extensión futura opcional.
   - Impacto: evita sobre-alcance en v0.

3. **Cobertura de comandos de sesión (`start/close` vs `list/info/replay`)**
   - Conflicto: existen árboles con granularidad distinta.
   - Resolución: contrato base mínimo debe incluir los subcomandos exigidos; extensiones adicionales se permiten si no rompen compatibilidad.
   - Impacto: requiere versión de contrato CLI explícita para evitar ruptura en scripts.

## Procedimiento operativo ante nuevos conflictos

1. Identificar requisito textual en especificación base (fuente primaria).
2. Marcar divergencia en documento derivado con nota de compatibilidad.
3. Ajustar diseño derivado para cumplir el mínimo obligatorio de la base.
4. Registrar decisión en changelog de arquitectura/CLI.
5. Si hay ambigüedad real, elegir opción más simple y nativa para Linux.

## Decisión aplicada en este repositorio

- A partir de esta revisión, cualquier contradicción futura se corrige siguiendo esta política.
- La documentación de arquitectura y CLI debe referenciar explícitamente esta regla de precedencia.
