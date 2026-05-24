# CashPrompt Backend


## Estado del proyecto

**Respuesta directa:** este repositorio **no** es todavía un sistema operativo completo; actualmente es una base documental y estructural para una plataforma local de IA sobre Linux.

### Alcance actual

- Especificación de producto.
- Arquitectura técnica de alto nivel.
- Diseño de CLI y flujos de trabajo.
- Base documental para una futura implementación.

### Qué falta para llamarlo “sistema operativo completo”

- Capa de sistema operativo real o integración profunda con una distribución base.
- Gestión de hardware, procesos, memoria, almacenamiento y dispositivos a nivel sistema.
- Seguridad, permisos y políticas de ejecución del sistema.
- Instalación y distribución como sistema arrancable o plataforma base equivalente.
- Operación, mantenimiento y actualizaciones como base del sistema.

### Conclusión técnica de alcance

El objetivo realista actual es una plataforma/aplicación local de IA para Linux, no un sistema operativo completo.

Backend para agentes CashPrompt - Sistema que genera, vende y entrega automáticamente prompts personalizados vía IA.

## Descripción

CashPrompt Backend es un sistema completo que permite:
- Generar prompts personalizados con IA
- Gestionar ventas y pagos
- Entregar contenido digital automáticamente
- Monetizar prompts y contenido

## Características

- ✅ Generación de prompts con IA
- ✅ Sistema de pagos integrado
- ✅ Gestión de usuarios
- ✅ API REST completa
- ✅ Autenticación JWT
- ✅ Base de datos escalable
- ✅ Webhooks para eventos

## Requisitos

- Node.js 18+
- npm o yarn
- PostgreSQL 14+
- Redis 6.0+

## Instalación

```bash
git clone https://github.com/jacxas/cashprompt-backend.git
cd cashprompt-backend
npm install
npm run dev
```

API disponible en: http://localhost:3001

## Scripts

- `npm run dev` - Desarrollo
- `npm run build` - Compilar
- `npm run start` - Producción
- `npm run test` - Tests
- `npm run db:migrate` - Migraciones

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refrescar token

### Prompts
- `GET /api/prompts` - Listar
- `POST /api/prompts` - Crear
- `GET /api/prompts/:id` - Obtener
- `PUT /api/prompts/:id` - Actualizar
- `DELETE /api/prompts/:id` - Eliminar

## Documentación

- [Node.js](https://nodejs.org/docs/)
- [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)

## Licencia

MIT

## Producto actual del repositorio

Este repositorio mantiene el contexto de **CashPrompt Backend** y además incluye un **blueprint técnico** para una plataforma local de IA en Linux.

## Plataforma IA local (blueprint)

- Ver propuesta detallada: `docs/LOCAL_LINUX_AI_STUDIO.md`

- Arquitectura técnica de alto nivel: `docs/ARCHITECTURE_HIGH_LEVEL.md`

- Diseño CLI y estructura de proyecto: `docs/CLI_COMMAND_TREE_AND_PROJECT_STRUCTURE.md`

- Resumen técnico de decisiones: `docs/TECHNICAL_DECISION_SUMMARY.md`

- Especificación técnica reorganizada: `docs/PRODUCT_TECHNICAL_SPEC_REWRITE.md`

- Arquitectura implementable (alto nivel): `docs/ARCHITECTURE_IMPLEMENTABLE_HIGH_LEVEL.md`

- Contrato implementable de CLI: `docs/CLI_IMPLEMENTATION_CONTRACT.md`

- Política de conflictos de especificación: `docs/SPEC_CONFLICT_POLICY.md`

- Implementación inicial de estructura de módulos: `docs/IMPLEMENTATION_NEXT_STEPS.md`

- Evaluación del estado (OS vs plataforma): `docs/SYSTEM_STATUS_ASSESSMENT.md`


- Plan MVP v0 y congelación de contrato: `docs/MVP_V0_IMPLEMENTATION_PLAN.md`
- Contrato CLI v0: `docs/contracts/cli_v0.md`
- Esquema sidecar v0: `docs/contracts/sidecar_v0.schema.json`
- Migración inicial SQLite: `storage/migrations/0001_init.sql`
- Config base: `config/defaults/app.toml`
