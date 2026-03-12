import os

import streamlit as st

from grok_client import call_grok

st.set_page_config(page_title="Dashboard Grok: Imágenes y Videos", layout="wide")
st.title("🎬 Dashboard de imágenes y videos con Grok API")
st.caption("Compatible con ejecución local y flujo en Pinokio.")

with st.sidebar:
    st.header("Configuración")
    model = st.selectbox("Modelo", ["grok-2-latest", "grok-1"], index=0)
    temperature = st.slider("Temperatura", min_value=0.0, max_value=1.0, value=0.7, step=0.1)
    max_tokens = st.slider("Max tokens", min_value=128, max_value=4000, value=1000, step=64)

    grok_state = "✅ Definida" if os.getenv("GROK_API_KEY") else "❌ No encontrada"
    st.markdown(f"**GROK_API_KEY:** {grok_state}")

st.subheader("1) Carga de medios")
col1, col2 = st.columns(2)

with col1:
    image_file = st.file_uploader("Imagen", type=["png", "jpg", "jpeg", "webp"], accept_multiple_files=False)
    if image_file:
        st.image(image_file, caption="Imagen cargada", use_container_width=True)

with col2:
    video_file = st.file_uploader("Video", type=["mp4", "mov", "webm", "mkv"], accept_multiple_files=False)
    if video_file:
        st.video(video_file)

st.subheader("2) Prompt")
prompt = st.text_area(
    "Instrucción para Grok",
    value="Describe el contenido y propone mejoras para redes sociales.",
    height=120,
)

st.info(
    "Nota: este dashboard previsualiza archivos locales, pero para análisis remoto en API "
    "usa URLs públicas en el campo inferior."
)
media_urls_text = st.text_area(
    "URLs de medios (una por línea)",
    placeholder="https://mi-cdn.com/imagen.png\nhttps://mi-cdn.com/video.mp4",
    height=100,
)
media_urls = [line.strip() for line in media_urls_text.splitlines() if line.strip()]

if st.button("Consultar Grok", type="primary"):
    if not prompt.strip():
        st.warning("Escribe un prompt antes de consultar.")
    else:
        with st.spinner("Consultando Grok..."):
            try:
                result = call_grok(
                    prompt=prompt,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    media_urls=media_urls,
                )
                st.success("Respuesta recibida")
                st.markdown("### Respuesta")
                st.write(result)
            except Exception as exc:
                st.error(f"Error al llamar la API de Grok: {exc}")

st.divider()
st.markdown("**Tip Pinokio:** define `GROK_API_KEY` y ejecuta el botón de `pinokio.js`.")
