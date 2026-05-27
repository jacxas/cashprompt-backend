/**
 * windowManager.js
 * Web Desktop OS - Window Manager Core
 * ES Modules, production-ready, modular.
 */

const DEFAULT_DESKTOP_ID = 'desktop-1';

/** @typedef {'normal'|'minimized'|'maximized'} WindowState */

/**
 * @typedef {Object} ProcessMeta
 * @property {string} processId
 * @property {string} appId
 * @property {number} createdAt
 * @property {boolean} alive
 */

/**
 * @typedef {Object} WindowRecord
 * @property {string} id
 * @property {string} processId
 * @property {string} appId
 * @property {string} desktopId
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 * @property {number} zIndex
 * @property {WindowState} state
 * @property {boolean} focused
 * @property {boolean} draggable
 * @property {number} createdAt
 * @property {number} updatedAt
 */

/**
 * @typedef {Object} WMOptions
 * @property {number} [viewportWidth]
 * @property {number} [viewportHeight]
 * @property {number} [snapThreshold]
 * @property {number} [minWidth]
 * @property {number} [minHeight]
 */

function now() {
  return Date.now();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Lightweight event bus.
 */
class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this.listeners = new Map();
  }

  /**
   * @param {string} eventName
   * @param {(payload:any)=>void} listener
   * @returns {() => void}
   */
  on(eventName, listener) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(listener);
    return () => this.off(eventName, listener);
  }

  /**
   * @param {string} eventName
   * @param {(payload:any)=>void} listener
   */
  off(eventName, listener) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    set.delete(listener);
    if (set.size === 0) this.listeners.delete(eventName);
  }

  /**
   * @param {string} eventName
   * @param {any} payload
   */
  emit(eventName, payload) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    for (const listener of set) {
      listener(payload);
    }
  }
}

/**
 * WindowManager implements:
 * - draggable windows
 * - z-index manager
 * - minimize/maximize
 * - snapping
 * - virtual desktops
 * - process registration
 * - events
 */
export class WindowManager {
  /**
   * @param {WMOptions} [options]
   */
  constructor(options = {}) {
    this.viewport = {
      width: options.viewportWidth ?? 1440,
      height: options.viewportHeight ?? 900,
    };

    this.config = {
      snapThreshold: options.snapThreshold ?? 24,
      minWidth: options.minWidth ?? 320,
      minHeight: options.minHeight ?? 200,
    };

    /** @type {Map<string, ProcessMeta>} */
    this.processes = new Map();

    /** @type {Map<string, WindowRecord>} */
    this.windows = new Map();

    /** @type {Map<string, Set<string>>} */
    this.desktopWindows = new Map([[DEFAULT_DESKTOP_ID, new Set()]]);

    /** @type {string} */
    this.activeDesktopId = DEFAULT_DESKTOP_ID;

    /** @type {number} */
    this.zCounter = 100;

    this.events = new EventBus();
  }

  /**
   * @param {number} width
   * @param {number} height
   */
  setViewport(width, height) {
    this.viewport.width = Math.max(1, width);
    this.viewport.height = Math.max(1, height);
    this.events.emit('viewport.changed', deepClone(this.viewport));
  }

  /**
   * @param {string} desktopId
   */
  createDesktop(desktopId) {
    if (!desktopId) throw new Error('desktopId is required');
    if (this.desktopWindows.has(desktopId)) return;
    this.desktopWindows.set(desktopId, new Set());
    this.events.emit('desktop.created', { desktopId });
  }

  /**
   * @param {string} desktopId
   */
  switchDesktop(desktopId) {
    if (!this.desktopWindows.has(desktopId)) {
      throw new Error(`Desktop not found: ${desktopId}`);
    }
    this.activeDesktopId = desktopId;

    for (const win of this.windows.values()) {
      win.focused = win.desktopId === desktopId ? win.focused : false;
    }

    this.events.emit('desktop.switched', {
      desktopId,
      windows: this.listWindows({ desktopId }),
    });
  }

  /**
   * @param {string} processId
   * @param {string} appId
   */
  registerProcess(processId, appId) {
    if (!processId || !appId) {
      throw new Error('processId and appId are required');
    }
    const record = {
      processId,
      appId,
      createdAt: now(),
      alive: true,
    };
    this.processes.set(processId, record);
    this.events.emit('process.registered', deepClone(record));
    return deepClone(record);
  }

  /**
   * @param {string} processId
   */
  unregisterProcess(processId) {
    const process = this.processes.get(processId);
    if (!process) return;

    process.alive = false;
    this.events.emit('process.unregistered', { processId });

    for (const win of this.windows.values()) {
      if (win.processId === processId) {
        this.closeWindow(win.id);
      }
    }

    this.processes.delete(processId);
  }

  /**
   * @param {Object} params
   * @param {string} params.id
   * @param {string} params.processId
   * @param {string} params.appId
   * @param {string} [params.desktopId]
   * @param {number} [params.x]
   * @param {number} [params.y]
   * @param {number} [params.width]
   * @param {number} [params.height]
   * @param {boolean} [params.draggable]
   */
  createWindow(params) {
    const {
      id,
      processId,
      appId,
      desktopId = this.activeDesktopId,
      x = 100,
      y = 100,
      width = 960,
      height = 620,
      draggable = true,
    } = params;

    if (!id) throw new Error('window id is required');
    if (!this.processes.has(processId)) {
      throw new Error(`Process not registered: ${processId}`);
    }
    if (this.windows.has(id)) {
      throw new Error(`Window already exists: ${id}`);
    }

    this.createDesktop(desktopId);

    const safeWidth = Math.max(this.config.minWidth, width);
    const safeHeight = Math.max(this.config.minHeight, height);
    const createdAt = now();

    const windowRecord = {
      id,
      processId,
      appId,
      desktopId,
      x: clamp(x, 0, Math.max(0, this.viewport.width - safeWidth)),
      y: clamp(y, 0, Math.max(0, this.viewport.height - safeHeight)),
      width: safeWidth,
      height: safeHeight,
      zIndex: this._nextZ(),
      state: 'normal',
      focused: false,
      draggable,
      createdAt,
      updatedAt: createdAt,
    };

    this.windows.set(id, windowRecord);
    this.desktopWindows.get(desktopId).add(id);
    this.focusWindow(id);

    this.events.emit('window.created', this.getWindow(id));
    return this.getWindow(id);
  }

  /**
   * @param {string} windowId
   */
  closeWindow(windowId) {
    const win = this.windows.get(windowId);
    if (!win) return;

    const desktopSet = this.desktopWindows.get(win.desktopId);
    if (desktopSet) desktopSet.delete(windowId);

    this.windows.delete(windowId);
    this.events.emit('window.closed', { windowId });
  }

  /**
   * @param {string} windowId
   */
  focusWindow(windowId) {
    const target = this.windows.get(windowId);
    if (!target) throw new Error(`Window not found: ${windowId}`);

    for (const win of this.windows.values()) {
      if (win.desktopId === target.desktopId) {
        win.focused = false;
      }
    }

    target.focused = true;
    target.zIndex = this._nextZ();
    target.updatedAt = now();

    this.events.emit('window.focused', this.getWindow(windowId));
  }

  /**
   * @param {string} windowId
   */
  minimizeWindow(windowId) {
    const win = this._requireWindow(windowId);
    win.state = 'minimized';
    win.focused = false;
    win.updatedAt = now();
    this.events.emit('window.minimized', this.getWindow(windowId));
  }

  /**
   * @param {string} windowId
   */
  maximizeWindow(windowId) {
    const win = this._requireWindow(windowId);
    win.state = 'maximized';
    win.x = 0;
    win.y = 0;
    win.width = this.viewport.width;
    win.height = this.viewport.height;
    win.updatedAt = now();
    win.zIndex = this._nextZ();
    win.focused = true;

    this.events.emit('window.maximized', this.getWindow(windowId));
  }

  /**
   * @param {string} windowId
   */
  restoreWindow(windowId) {
    const win = this._requireWindow(windowId);
    if (win.state !== 'normal') {
      win.state = 'normal';
      win.width = Math.max(this.config.minWidth, Math.min(win.width, this.viewport.width));
      win.height = Math.max(this.config.minHeight, Math.min(win.height, this.viewport.height));
      win.x = clamp(win.x, 0, Math.max(0, this.viewport.width - win.width));
      win.y = clamp(win.y, 0, Math.max(0, this.viewport.height - win.height));
      win.updatedAt = now();
    }
    this.focusWindow(windowId);
    this.events.emit('window.restored', this.getWindow(windowId));
  }

  /**
   * Draggable movement with snapping.
   * @param {string} windowId
   * @param {number} nextX
   * @param {number} nextY
   */
  dragWindow(windowId, nextX, nextY) {
    const win = this._requireWindow(windowId);
    if (!win.draggable || win.state === 'maximized') return this.getWindow(windowId);

    const maxX = Math.max(0, this.viewport.width - win.width);
    const maxY = Math.max(0, this.viewport.height - win.height);

    let x = clamp(nextX, 0, maxX);
    let y = clamp(nextY, 0, maxY);

    const t = this.config.snapThreshold;

    if (x <= t) x = 0;
    if (y <= t) y = 0;
    if (Math.abs(maxX - x) <= t) x = maxX;
    if (Math.abs(maxY - y) <= t) y = maxY;

    // center snapping
    const centerX = (this.viewport.width - win.width) / 2;
    const centerY = (this.viewport.height - win.height) / 2;
    if (Math.abs(x - centerX) <= t) x = Math.round(centerX);
    if (Math.abs(y - centerY) <= t) y = Math.round(centerY);

    win.x = x;
    win.y = y;
    win.updatedAt = now();

    this.events.emit('window.dragged', this.getWindow(windowId));
    return this.getWindow(windowId);
  }

  /**
   * Snap window to a region.
   * @param {string} windowId
   * @param {'left'|'right'|'top'|'bottom'|'top-left'|'top-right'|'bottom-left'|'bottom-right'} region
   */
  snapWindow(windowId, region) {
    const win = this._requireWindow(windowId);

    const fullW = this.viewport.width;
    const fullH = this.viewport.height;
    const halfW = Math.floor(fullW / 2);
    const halfH = Math.floor(fullH / 2);

    switch (region) {
      case 'left':
        win.x = 0; win.y = 0; win.width = halfW; win.height = fullH;
        break;
      case 'right':
        win.x = halfW; win.y = 0; win.width = fullW - halfW; win.height = fullH;
        break;
      case 'top':
        win.x = 0; win.y = 0; win.width = fullW; win.height = halfH;
        break;
      case 'bottom':
        win.x = 0; win.y = halfH; win.width = fullW; win.height = fullH - halfH;
        break;
      case 'top-left':
        win.x = 0; win.y = 0; win.width = halfW; win.height = halfH;
        break;
      case 'top-right':
        win.x = halfW; win.y = 0; win.width = fullW - halfW; win.height = halfH;
        break;
      case 'bottom-left':
        win.x = 0; win.y = halfH; win.width = halfW; win.height = fullH - halfH;
        break;
      case 'bottom-right':
        win.x = halfW; win.y = halfH; win.width = fullW - halfW; win.height = fullH - halfH;
        break;
      default:
        throw new Error(`Unsupported snap region: ${region}`);
    }

    win.state = 'normal';
    win.updatedAt = now();
    win.zIndex = this._nextZ();
    win.focused = true;

    this.events.emit('window.snapped', {
      region,
      window: this.getWindow(windowId),
    });

    return this.getWindow(windowId);
  }

  /**
   * Move window between desktops.
   * @param {string} windowId
   * @param {string} targetDesktopId
   */
  moveWindowToDesktop(windowId, targetDesktopId) {
    const win = this._requireWindow(windowId);
    this.createDesktop(targetDesktopId);

    const oldSet = this.desktopWindows.get(win.desktopId);
    if (oldSet) oldSet.delete(windowId);

    this.desktopWindows.get(targetDesktopId).add(windowId);
    win.desktopId = targetDesktopId;
    win.focused = false;
    win.updatedAt = now();

    this.events.emit('window.desktopChanged', {
      windowId,
      desktopId: targetDesktopId,
    });
  }

  /**
   * @param {{desktopId?:string, includeMinimized?:boolean}} [filters]
   */
  listWindows(filters = {}) {
    const { desktopId = this.activeDesktopId, includeMinimized = true } = filters;

    return [...this.windows.values()]
      .filter((w) => w.desktopId === desktopId)
      .filter((w) => includeMinimized || w.state !== 'minimized')
      .sort((a, b) => a.zIndex - b.zIndex)
      .map((w) => deepClone(w));
  }

  /**
   * @param {string} windowId
   */
  getWindow(windowId) {
    const win = this.windows.get(windowId);
    return win ? deepClone(win) : null;
  }

  /**
   * @returns {ProcessMeta[]}
   */
  listProcesses() {
    return [...this.processes.values()].map((p) => deepClone(p));
  }

  /**
   * @returns {{activeDesktopId:string, desktops:string[], windowCount:number, processCount:number}}
   */
  getSnapshot() {
    return {
      activeDesktopId: this.activeDesktopId,
      desktops: [...this.desktopWindows.keys()],
      windowCount: this.windows.size,
      processCount: this.processes.size,
    };
  }

  /**
   * @param {string} eventName
   * @param {(payload:any)=>void} listener
   */
  on(eventName, listener) {
    return this.events.on(eventName, listener);
  }

  /**
   * @param {string} eventName
   * @param {(payload:any)=>void} listener
   */
  off(eventName, listener) {
    this.events.off(eventName, listener);
  }

  _nextZ() {
    this.zCounter += 1;
    return this.zCounter;
  }

  /**
   * @param {string} windowId
   * @returns {WindowRecord}
   */
  _requireWindow(windowId) {
    const win = this.windows.get(windowId);
    if (!win) throw new Error(`Window not found: ${windowId}`);
    return win;
  }
}

export default WindowManager;
