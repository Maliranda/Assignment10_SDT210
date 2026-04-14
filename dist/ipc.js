"use strict";
// === src/ipc.ts ===
// IPC Transport Layer — manages the pipe to the blessed terminal-host process.
//
// Design:
//  • Mutations flow parent → child via stdin  (JSON lines)
//  • Events flow   child → parent via stdout (JSON lines)
//  • onClick / onKeypress callbacks are stored locally in callbackStore;
//    only a boolean flag is sent over the wire so functions never cross the pipe.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCallback = registerCallback;
exports.unregisterCallback = unregisterCallback;
exports.initIPC = initIPC;
exports.ipcSend = ipcSend;
const child_process_1 = require("child_process");
const readline = __importStar(require("readline"));
const path = __importStar(require("path"));
// ── Callback store ──────────────────────────────────────────────────────────
// Key format: `${widgetId}:${eventName}`  e.g. "n3:click"
const callbackStore = new Map();
function registerCallback(id, event, fn) {
    callbackStore.set(`${id}:${event}`, fn);
}
function unregisterCallback(id, event) {
    callbackStore.delete(`${id}:${event}`);
}
// ── Child process handle ────────────────────────────────────────────────────
let hostProcess = null;
/** Spawn the target process and wire up the readline event loop. */
function initIPC() {
    const targetPath = path.join(__dirname, '..', 'target', 'index.js');
    hostProcess = (0, child_process_1.spawn)('node', [targetPath], {
        stdio: ['pipe', 'pipe', 'inherit'], // stdin=IPC in, stdout=IPC out, stderr=terminal
    });
    const rl = readline.createInterface({ input: hostProcess.stdout });
    rl.on('line', (line) => {
        try {
            const event = JSON.parse(line);
            const cb = callbackStore.get(`${event.targetId}:${event.event}`);
            if (cb)
                cb(event);
        }
        catch (e) {
            process.stderr.write('IPC parse error: ' + e.message + '\n');
        }
    });
    hostProcess.on('close', (code) => {
        process.stderr.write(`Terminal process exited with code ${code}\n`);
        process.exit(0);
    });
}
// ── Send ────────────────────────────────────────────────────────────────────
/** Send a JSON IPC message to the terminal host. */
function ipcSend(msg) {
    if (!(hostProcess === null || hostProcess === void 0 ? void 0 : hostProcess.stdin))
        return;
    hostProcess.stdin.write(JSON.stringify(msg) + '\n');
}
