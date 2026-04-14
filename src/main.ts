// === src/main.ts ===
// Entry point — starts the terminal host process via IPC, then mounts the
// React todo app into the root container.

import React from 'react';
import { initIPC } from './ipc';
import { createContainer, render } from './renderer';
import App from './App';

// 1. Spawn the blessed terminal-host and wire up the IPC pipe
initIPC();

// 2. Allocate a Yoga-backed root container sized to the terminal
const container = createContainer();

// 3. Mount the React app — the reconciler drives hostConfig from here
render(React.createElement(App), container);
