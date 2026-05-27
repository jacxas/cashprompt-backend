/**
 * filesystem.js
 *
 * Capa mínima de utilidades de filesystem para el MVP v0.
 * Sin dependencias externas.
 */

const fs = require('fs');
const path = require('path');

function resolveHome(p) {
  if (!p) return p;
  if (p.startsWith('~/')) {
    return path.join(process.env.HOME || '', p.slice(2));
  }
  return p;
}

function ensureDir(dirPath) {
  const fullPath = resolveHome(dirPath);
  fs.mkdirSync(fullPath, { recursive: true });
  return fullPath;
}

function writeJson(filePath, data) {
  const fullPath = resolveHome(filePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
  return fullPath;
}

function readJson(filePath) {
  const fullPath = resolveHome(filePath);
  const raw = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(raw);
}

function exists(targetPath) {
  const fullPath = resolveHome(targetPath);
  return fs.existsSync(fullPath);
}

module.exports = {
  resolveHome,
  ensureDir,
  writeJson,
  readJson,
  exists,
};
