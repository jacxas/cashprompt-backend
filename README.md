<div align="center">

# 💰 CashPrompt Backend

**Motor de generación y monetización de prompts con IA — API REST + agentes automáticos**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 🧠 ¿Qué es CashPrompt?

CashPrompt Backend es la capa de servidor de un sistema de **monetización de prompts con IA**. Permite a creadores generar, vender y entregar prompts personalizados de forma automática, integrando pagos y envíos digitales.

> **Alcance actual:** Plataforma/API local de IA para Linux. No es un sistema operativo — es una aplicación de backend escalable.

## ✨ Características

- 🤖 Generación de prompts personalizados con IA (Gemini / OpenAI)
- 💳 Sistema de pagos integrado (Stripe / PayPal)
- 📦 Entrega automática de productos digitales
- 🔑 Autenticación JWT segura
- 📊 API REST documentada (Swagger / OpenAPI)
- 🔔 Webhooks para eventos de pago y entrega
- 📄 Arquitectura modular y extensible

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Python 3.11+, FastAPI |
| Base de datos | PostgreSQL 14+ |
| Caché | Redis 6.0+ |
| IA | Gemini API / OpenAI API |
| Pagos | Stripe / PayPal |
| Deploy | Docker, Linux |

## 🚀 Inicio Rápido

### Prerequisitos

- Python 3.11+
- PostgreSQL 14+
- Redis 6.0+

### Instalación

```bash
git clone https://github.com/jacxas/cashprompt-backend.git
cd cashprompt-backend
pip install -r requirements.txt
```

### Configuración

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://user:password@localhost/cashprompt
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=tu_clave_aqui
JWT_SECRET=tu_secreto_aqui
STRIPE_SECRET_KEY=tu_clave_stripe
```

### Ejecutar

```bash
python -m uvicorn main:app --reload
```

API disponible en: [http://localhost:8000](http://localhost:8000)  
Docs interactivas: [http://localhost:8000/docs](http://localhost:8000/docs)

## 📚 API Endpoints Principales

### Autenticación
- `POST /api/auth/register` — Registrar usuario
- `POST /api/auth/login` — Login y obtención de JWT
- `POST /api/auth/refresh` — Refrescar token

### Prompts
- `GET /api/prompts` — Listar prompts disponibles
- `POST /api/prompts` — Crear nuevo prompt
- `GET /api/prompts/:id` — Obtener prompt por ID
- `PUT /api/prompts/:id` — Actualizar prompt
- `DELETE /api/prompts/:id` — Eliminar prompt

### Pagos
- `POST /api/payments/checkout` — Iniciar pago
- `POST /api/payments/webhook` — Webhook de Stripe/PayPal

## 📁 Documentación Técnica

Ver carpeta `docs/` para arquitectura detallada:

- `docs/ARCHITECTURE_HIGH_LEVEL.md` — Arquitectura general
- `docs/CLI_COMMAND_TREE_AND_PROJECT_STRUCTURE.md` — Estructura del proyecto
- `docs/PRODUCT_TECHNICAL_SPEC_REWRITE.md` — Especificación técnica

## 📄 Licencia

MIT © [jacxas](https://github.com/jacxas)
