"use strict";
// === src/main.ts ===
// Entry point — starts the terminal host process via IPC, then mounts the
// React todo app into the root container.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const ipc_1 = require("./ipc");
const renderer_1 = require("./renderer");
const App_1 = __importDefault(require("./App"));
// 1. Spawn the blessed terminal-host and wire up the IPC pipe
(0, ipc_1.initIPC)();
// 2. Allocate a Yoga-backed root container sized to the terminal
const container = (0, renderer_1.createContainer)();
// 3. Mount the React app — the reconciler drives hostConfig from here
(0, renderer_1.render)(react_1.default.createElement(App_1.default), container);
