import { windowManager } from './windowManager.js';

const app = document.getElementById('app');

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else node.setAttribute(k, v);
  });
  children.forEach((c) => node.appendChild(c));
  return node;
}

function render() {
  app.innerHTML = '';

  const shell = el('div', {
    style: {
      fontFamily: 'ui-sans-serif, system-ui',
      background: '#0f1220',
      color: '#dbe4ff',
      minHeight: '100vh',
      padding: '16px',
    },
  });

  const title = el('h2');
  title.textContent = 'WebLinux OS Viewer (MVP)';

  const info = el('pre', {
    style: {
      background: '#13182b',
      border: '1px solid #29304a',
      borderRadius: '8px',
      padding: '12px',
      overflow: 'auto',
    },
  });

  info.textContent = JSON.stringify(windowManager.getSnapshot(), null, 2);

  const windows = windowManager.listWindows();
  const windowsBox = el('pre', {
    style: {
      background: '#13182b',
      border: '1px solid #29304a',
      borderRadius: '8px',
      padding: '12px',
      overflow: 'auto',
      marginTop: '12px',
    },
  });
  windowsBox.textContent = JSON.stringify(windows, null, 2);

  shell.appendChild(title);
  shell.appendChild(info);
  shell.appendChild(windowsBox);
  app.appendChild(shell);
}

windowManager.registerProcess('p1', 'terminal');
windowManager.createWindow({
  id: 'w1',
  processId: 'p1',
  appId: 'terminal',
  x: 30,
  y: 20,
  width: 600,
  height: 420,
});
windowManager.snapWindow('w1', 'left');

render();
