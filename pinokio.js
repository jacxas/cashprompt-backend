module.exports = {
  title: "Grok Media Dashboard",
  description: "Dashboard de imágenes y videos con API de Grok",
  icon: "icon.png",
  menu: [{
    default: true,
    label: "Iniciar dashboard",
    action: {
      method: "shell.run",
      params: {
        cmd: "python -m streamlit run app.py --server.port 8501 --server.address 0.0.0.0"
      }
    }
  }]
};
