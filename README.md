# CashPrompt Backend

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
