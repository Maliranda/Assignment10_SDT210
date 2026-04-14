# TerminalReact — Custom React Renderer (Week 11 Group Project)

A custom React renderer that draws UI in the terminal using blessed + Yoga layout,
implemented in TypeScript with a full react-reconciler host config.

## Team Roles
| Member | Responsibility |
|---|---|
| Liza Maranda | hostConfig + Yoga integration, IPC transport layer |
|  | UI Kit components, App components |
|  | target process (blessed host), README & demo |

---

## Setup

```bash
npm install
npm start        # compiles TypeScript then runs node dist/main.js
```

Or step by step:

```bash
npm run build    # tsc → dist/
node dist/main.js
```

Press **q** or **Escape** to quit.

---

## Architecture

The app runs as **two separate Node.js processes** connected by stdin/stdout pipes:

```
Renderer Process (Node.js)          Terminal Process (blessed)
┌─────────────────────────┐         ┌─────────────────────────┐
│  src/App.tsx             │         │  target/index.js         │
│  React Components        │         │  readline → JSON parser  │
│         │                │  stdin  │         │                │
│  react-reconciler        │ ──────► │  Widget Registry         │
│  (Fiber engine)          │  JSON   │  Map<id, blessed widget> │
│         │                │  cmds   │         │                │
│  src/hostConfig.ts       │         │  create / update /       │
│  IPC mutations +         │         │  remove / layout         │
│  Yoga node management    │  stdout │         │                │
│         │                │ ◄────── │  screen.render()         │
│  src/yoga-utils.ts       │  JSON   │  /dev/tty for I/O        │
│  calculateLayout()       │  events │  (stdin piped for IPC)   │
└─────────────────────────┘         └─────────────────────────┘
```

Why two processes? Blessed takes over the terminal and runs its own event loop.
Keeping it in a separate process prevents conflicts with React's scheduler.

---

## IPC Protocol

All messages are **newline-delimited JSON** over stdin/stdout pipes.

### Renderer → Target (mutations)

| Operation     | Message |
|---|---|
| Create widget | `{ op: "create", id: "n1", type: "box", props: { border: {type:"line"}, ... } }` |
| Append child  | `{ op: "appendChild", parentId: "n1", childId: "n2" }` |
| Insert before | `{ op: "insertBefore", parentId: "n1", childId: "n2", beforeId: "n3" }` |
| Remove child  | `{ op: "removeChild", parentId: "n1", childId: "n2" }` |
| Update props  | `{ op: "update", id: "n1", props: { label: " Done " } }` |
| Update text   | `{ op: "setText", id: "n5", text: "new content" }` |
| Set layout    | `{ op: "layout", id: "n1", x: 2, y: 1, w: 76, h: 20 }` |
| Commit batch  | `{ op: "commit" }` |

### Target → Renderer (events)

| Event    | Message |
|---|---|
| Key press | `{ event: "keypress", targetId: "screen", key: "j", ch: "j" }` |
| Click     | `{ event: "click", targetId: "n7" }` |

**Event callbacks are stored locally** in a `Map<string, Function>` inside `src/ipc.ts`.
Only a boolean flag is ever sent over the wire — functions never cross the pipe boundary.

---

## File Structure

```
src/
├── types.ts          Instance, TextInstance, Container types
├── ipc.ts            IPC transport: spawn child, send/receive JSON, callback store
├── yoga-utils.ts     applyYogaProps(), sendLayoutUpdates()
├── hostConfig.ts     Full react-reconciler host config (all required methods)
├── renderer.ts       Reconciler setup, createContainer(), render()
├── jsx.d.ts          JSX intrinsic element declarations (box, text)
├── main.ts           Entry point — initIPC → createContainer → render(<App/>)
├── App.tsx           Todo app root component
├── ui/               UI Kit (7 components composed from primitives)
│   ├── Screen.tsx    Full-terminal flex wrapper
│   ├── Card.tsx      Bordered box with label
│   ├── Row.tsx       Horizontal flex row
│   ├── Badge.tsx     Coloured inline label
│   ├── Button.tsx    Clickable active/inactive text
│   ├── Spacer.tsx    Flexible or fixed gap
│   ├── TextLine.tsx  Single-line styled text
│   └── index.ts      Barrel export
└── components/
    ├── TodoItem.tsx   Todo row (checkbox + text, highlights selected)
    └── FilterTabs.tsx Filter tab bar (All / Active / Done)
target/
└── index.js          Blessed terminal host (separate process)
```

---

## How Yoga Layout Works

1. Every `Instance` and `TextInstance` carries a `YogaNode`
2. Props like `flexGrow`, `padding`, `width` are applied to the Yoga node in `createInstance`
3. In `resetAfterCommit`, `container.yogaNode.calculateLayout(cols, rows, DIRECTION_LTR)` runs
4. `sendLayoutUpdates` walks the tree and sends `{op:"layout", id, x, y, w, h}` for every node
5. The target process sets `widget.left/top/width/height` and calls `screen.render()`

---

## Todo App Keyboard Shortcuts

| Key | Action |
|---|---|
| `j` / `↓` | Move selection down |
| `k` / `↑` | Move selection up |
| `space` | Toggle todo done/undone |
| `d` | Delete selected todo |
| `a` | Add a new todo (type the task text) |
| `1` / `2` / `3` | Switch filter: All / Active / Done |
| `q` / `Escape` | Quit |

---

## Primitives → UI Kit → App (Three-Layer Architecture)

```
Layer 1 Primitives    <box> <text>            (declared in jsx.d.ts)
       ↓
Layer 2 UI Kit        Screen Card Row Badge Button Spacer TextLine
       ↓
Layer 3 App           FilterTabs TodoItem App
```

This mirrors how React Native works: primitives → component library → app.

---

## Key Concepts

**Fiber** — React's internal data structure. A linked list of nodes enabling interruptible rendering (Render phase) and synchronous commits (Commit phase).

**react-reconciler** — Contains React's diffing engine. Calls our `hostConfig` methods to create, update, and remove platform elements.

**hostConfig** — The bridge we implement. Each method updates three things: the local JS tree (React bookkeeping), the Yoga node tree (layout), and the IPC pipe (rendering).

**Yoga** — Meta's C++ flexbox engine (wrapped in WASM/prebuilt binary). Runs on the renderer side; computes pixel positions from flex properties.

**IPC** — Inter-process communication via stdin/stdout pipes (newline-delimited JSON).
