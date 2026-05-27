# Kernel Virtual (MVP v0)

Este módulo define el **kernel virtual** de la plataforma local de IA.

## Alcance
- Registro de procesos virtuales (jobs).
- Scheduler lógico (colas y prioridades).
- Gestión de recursos abstractos (`cpu`, `gpu`, `mem`).
- Bus de eventos interno (`job.created`, `job.started`, `job.finished`, `job.failed`).

## Fuera de alcance
- Kernel de sistema operativo real.
- Drivers/hardware de bajo nivel.
- Gestión de ventanas.

## Interfaces objetivo (contrato)
- `create_process(spec) -> process_id`
- `schedule(process_id) -> assignment`
- `update_state(process_id, state)`
- `emit_event(type, payload)`
- `get_process(process_id)`

## Estados de proceso
- `queued`
- `running`
- `completed`
- `failed`
- `canceled`
