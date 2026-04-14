// === src/ipc.ts ===
// IPC Transport Layer — manages the pipe to the blessed terminal-host process.
//
// Design:
//  • Mutations flow parent → child via stdin  (JSON lines)
//  • Events flow   child → parent via stdout (JSON lines)
//  • onClick / onKeypress callbacks are stored locally in callbackStore;
//    only a boolean flag is sent over the wire so functions never cross the pipe.

import { spawn, ChildProcess } from 'child_process';
import * as readline from 'readline';
import * as path from 'path';

// ── Callback store ──────────────────────────────────────────────────────────
// Key format: `${widgetId}:${eventName}`  e.g. "n3:click"
const callbackStore = new Map<string, (...args: unknown[]) => void>();

export function registerCallback(
  id: string,
  event: string,
  fn: (...args: unknown[]) => void,
): void {
  callbackStore.set(`${id}:${event}`, fn);
}

export function unregisterCallback(id: string, event: string): void {
  callbackStore.delete(`${id}:${event}`);
}

// ── Child process handle ────────────────────────────────────────────────────
let hostProcess: ChildProcess | null = null;

/** Spawn the target process and wire up the readline event loop. */
export function initIPC(): void {
  const targetPath = path.join(__dirname, '..', 'target', 'index.js');
  hostProcess = spawn('node', [targetPath], {
    stdio: ['pipe', 'pipe', 'inherit'], // stdin=IPC in, stdout=IPC out, stderr=terminal
  });

  const rl = readline.createInterface({ input: hostProcess.stdout! });
  rl.on('line', (line) => {
    try {
      const event = JSON.parse(line) as { event: string; targetId: string; [k: string]: unknown };
      const cb = callbackStore.get(`${event.targetId}:${event.event}`);
      if (cb) cb(event);
    } catch (e) {
      process.stderr.write('IPC parse error: ' + (e as Error).message + '\n');
    }
  });

  hostProcess.on('close', (code) => {
    process.stderr.write(`Terminal process exited with code ${code}\n`);
    process.exit(0);
  });
}

// ── Send ────────────────────────────────────────────────────────────────────

/** Send a JSON IPC message to the terminal host. */
export function ipcSend(msg: object): void {
  if (!hostProcess?.stdin) return;
  hostProcess.stdin.write(JSON.stringify(msg) + '\n');
}
