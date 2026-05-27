export class WindowManager {
  constructor() {
    this.processes = new Map();
    this.windows = new Map();
    this.z = 100;
  }

  registerProcess(processId, appId) {
    this.processes.set(processId, { processId, appId, createdAt: Date.now() });
  }

  createWindow({ id, processId, appId, x = 0, y = 0, width = 800, height = 600 }) {
    if (!this.processes.has(processId)) throw new Error('process not found');
    this.windows.set(id, {
      id,
      processId,
      appId,
      x,
      y,
      width,
      height,
      state: 'normal',
      zIndex: ++this.z,
      createdAt: Date.now(),
    });
  }

  snapWindow(id, region) {
    const w = this.windows.get(id);
    if (!w) throw new Error('window not found');

    if (region === 'left') {
      w.x = 0;
      w.y = 0;
      w.width = 640;
      w.height = 720;
      w.zIndex = ++this.z;
    }
  }

  listWindows() {
    return Array.from(this.windows.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  getSnapshot() {
    return {
      processCount: this.processes.size,
      windowCount: this.windows.size,
      topZ: this.z,
    };
  }
}

export const windowManager = new WindowManager();
