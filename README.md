# CashPrompt Backend - Grok Media Dashboard

Dashboard básico para trabajar con **imágenes y videos** usando la API de **Grok** (xAI), preparado para correr localmente o desde **Pinokio**.

## Requisitos

- Python 3.10+
- Una clave válida de Grok API

## Instalación

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# edita .env y coloca GROK_API_KEY
```

## Ejecutar dashboard

```bash
streamlit run app.py
```

Abre `http://localhost:8501`.

## Uso rápido

1. Carga imagen/video para vista previa local.
2. Añade prompt.
3. (Opcional) Pega URLs públicas de imagen/video para análisis multimodal.
4. Presiona **Consultar Grok**.

## Ejecutar en Pinokio

Este repo incluye `pinokio.js` para arrancar el dashboard con un botón.

## Tests

```bash
pytest -q
```
