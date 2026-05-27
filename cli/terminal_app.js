#!/usr/bin/env node

/**
 * terminal_app.js
 *
 * Terminal app mínima para MVP v0.
 * Solo imprime ayuda y versión base.
 */

const VERSION = '0.1.0';

function printHelp() {
  console.log(`app ${VERSION}\n\nUso:\n  app <comando> [opciones]\n\nComandos disponibles:\n  models   Gestión de modelos\n  run      Ejecución de inferencia\n  jobs     Gestión de jobs\n  help     Muestra esta ayuda\n  version  Muestra versión\n`);
}

function main(argv) {
  const cmd = argv[2];

  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
    return 0;
  }

  if (cmd === 'version' || cmd === '--version' || cmd === '-v') {
    console.log(VERSION);
    return 0;
  }

  console.error(`Comando no soportado en MVP: ${cmd}`);
  console.error("Ejecuta 'app help' para ver comandos disponibles.");
  return 2;
}

process.exitCode = main(process.argv);
