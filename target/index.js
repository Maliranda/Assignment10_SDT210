// === target/index.js ===
// The terminal-host target process.  Runs separately from the Node.js renderer;
// communicates via stdin/stdout JSON lines (the IPC protocol).
//
// stdin  ← JSON commands from the renderer (create, appendChild, layout, …)
// stdout → JSON events back to the renderer  (keypress, click)
// stderr   inherited — shows in the same terminal window as debug output
//
// Because stdout is piped for IPC, blessed is pointed at /dev/tty directly so
// it can render to the real terminal regardless of the pipe.

'use strict';

const blessed  = require('blessed');
const readline = require('readline');
const tty      = require('tty');
const fs       = require('fs');

// ── Open /dev/tty so blessed has a real TTY even though stdout is piped ─────
const ttyFd     = fs.openSync('/dev/tty', 'r+');
const ttyInput  = new tty.ReadStream(ttyFd);
const ttyOutput = new tty.WriteStream(ttyFd);

const screen = blessed.screen({
  smartCSR: true,
  title:    'TerminalReact',
  input:    ttyInput,
  output:   ttyOutput,
});

// ── Widget registry: id → blessed widget ─────────────────────────────────────
const registry = new Map();
registry.set('root', screen);

// ── IPC: read JSON messages from stdin one line at a time ────────────────────
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  try {
    handleMessage(JSON.parse(line));
  } catch (e) {
    process.stderr.write('Target parse error: ' + e.message + '\n');
  }
});

// ── Message handler ───────────────────────────────────────────────────────────
function handleMessage(msg) {
  switch (msg.op) {

    case 'create': {
      // Map our primitive names to blessed widget names
      const TYPE_MAP = { container: 'box', btext: 'text' };
      const widgetType = TYPE_MAP[msg.type] ?? msg.type;
      if (typeof blessed[widgetType] !== 'function') {
        process.stderr.write(`Unknown widget type: ${widgetType}\n`);
        break;
      }

      const widget = blessed[widgetType]({ ...msg.props });

      // Forward click events back to renderer via stdout
      widget.on('click', () => {
        process.stdout.write(JSON.stringify({ event: 'click', targetId: msg.id }) + '\n');
      });

      registry.set(msg.id, widget);
      break;
    }

    case 'appendChild': {
      const parent = registry.get(msg.parentId);
      const child  = registry.get(msg.childId);
      if (parent && child) parent.append(child);
      break;
    }

    case 'insertBefore': {
      const parent      = registry.get(msg.parentId);
      const child       = registry.get(msg.childId);
      const beforeChild = registry.get(msg.beforeId);
      if (!parent || !child) break;
      if (beforeChild) {
        const idx = parent.children.indexOf(beforeChild);
        if (idx !== -1) {
          parent.insert(child, idx);
        } else {
          parent.append(child);
        }
      } else {
        parent.append(child);
      }
      break;
    }

    case 'removeChild': {
      const parent = registry.get(msg.parentId);
      const child  = registry.get(msg.childId);
      if (parent && child) {
        parent.remove(child);
        registry.delete(msg.childId);
      }
      break;
    }

    case 'update': {
      const widget = registry.get(msg.id);
      if (!widget || !msg.props) break;
      Object.assign(widget.options, msg.props);
      if (msg.props.content != null) widget.setContent(msg.props.content);
      if (msg.props.label   != null) widget.setLabel(msg.props.label);
      screen.render();
      break;
    }

    case 'setText': {
      const widget = registry.get(msg.id);
      if (widget) widget.setContent(msg.text);
      screen.render();
      break;
    }

    case 'layout': {
      const widget = registry.get(msg.id);
      if (widget && msg.id !== 'root') {
        widget.left   = msg.x;
        widget.top    = msg.y;
        widget.width  = msg.w;
        widget.height = msg.h;
      }
      break;
    }

    case 'commit': {
      screen.render();
      break;
    }

    default:
      process.stderr.write(`Unknown op: ${msg.op}\n`);
  }
}

// ── Global keyboard handler ───────────────────────────────────────────────────
// All keypresses on the screen are forwarded to the renderer so React state
// can respond without needing a second IPC channel.
screen.on('keypress', (ch, key) => {
  if (!key) return;
  process.stdout.write(JSON.stringify({
    event:    'keypress',
    targetId: 'screen',
    key:      key.name ?? ch,
    ch:       ch ?? '',
  }) + '\n');
});

// ── Quit on Ctrl-C only — q and Escape are forwarded to React ────────────────
screen.key(['C-c'], () => process.exit(0));
