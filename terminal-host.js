// === terminal-host.js ===
// This is the TARGET PROCESS — run separately
// It receives JSON commands on stdin and renders terminal UI via blessed
const blessed = require('blessed');
const readline = require('readline');
const tty = require('tty');
const fs = require('fs');

// Open /dev/tty so blessed can render to the real terminal
// even though stdout is piped for IPC with the parent process
const ttyFd = fs.openSync('/dev/tty', 'r+');
const ttyInput  = new tty.ReadStream(ttyFd);
const ttyOutput = new tty.WriteStream(ttyFd);

const screen = blessed.screen({
  smartCSR: true,
  title: 'TerminalReact',
  input:  ttyInput,
  output: ttyOutput,
  mouse:  true,   // enable mouse so clickable widgets work
});
const registry = new Map();
registry.set('root', screen);

// Read JSON messages from stdin (one per line)
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  try {
    const msg = JSON.parse(line);
    handleMessage(msg);
  } catch (e) {
    process.stderr.write('Parse error: ' + e.message + '\n');
  }
});

function handleMessage(msg) {
  switch (msg.op) {
    case 'create': {
      const widgetType = msg.type === 'container' ? 'box' : msg.type;
      const widget = blessed[widgetType]({
        ...msg.props,
      });
      // Forward click events back to Node.js via stdout
      widget.on('click', () => {
        process.stdout.write(JSON.stringify({
          event: 'click', targetId: msg.id
        }) + '\n');
      });
      // Forward keypress events — guard against null key to avoid crashes
      widget.on('keypress', (ch, key) => {
        if (!key) return;
        process.stdout.write(JSON.stringify({
          event: 'keypress', targetId: msg.id,
          key: key.name, ch
        }) + '\n');
      });
      widget.on('submit', (value) => {
        process.stdout.write(JSON.stringify({
          event: 'submit', targetId: msg.id, value
        }) + '\n');
      });
      widget.on('cancel', () => {
        process.stdout.write(JSON.stringify({
          event: 'cancel', targetId: msg.id
        }) + '\n');
      });
      registry.set(msg.id, widget);
      break;
    }
    case 'appendChild': {
      const parent = registry.get(msg.parentId);
      const child = registry.get(msg.childId);
      if (parent && child) parent.append(child);
      break;
    }
    case 'removeChild': {
      const parent = registry.get(msg.parentId);
      const child = registry.get(msg.childId);
      if (parent && child) parent.remove(child);
      break;
    }
    case 'update': {
      const widget = registry.get(msg.id);
      if (widget && msg.props) {
        Object.assign(widget.options, msg.props);
        if (msg.props.content != null) widget.setContent(msg.props.content);
        if (msg.props.label  != null) widget.setLabel(msg.props.label);
        if (msg.props.style  != null) {
          Object.assign(widget.style, msg.props.style);
        }
      }
      break;
    }
    case 'setText': {
      const widget = registry.get(msg.id);
      if (widget) {
        if (typeof widget.setValue === 'function') {
          widget.setValue(msg.text);
        } else {
          widget.setContent(msg.text);
        }
      }
      break;
    }
    case 'focus': {
      const widget = registry.get(msg.id);
      if (widget) widget.focus();
      break;
    }
    // Explicitly start readInput on a textbox — used after clearing and re-focusing
    // so inputOnFocus fires even when the widget is already focused
    case 'readInput': {
      const widget = registry.get(msg.id);
      if (widget && typeof widget.readInput === 'function') {
        widget.readInput(() => {});
      }
      break;
    }
    case 'show': {
      const widget = registry.get(msg.id);
      if (widget) widget.show();
      break;
    }
    case 'hide': {
      const widget = registry.get(msg.id);
      if (widget) widget.hide();
      break;
    }
    case 'layout': {
      const widget = registry.get(msg.id);
      if (widget) {
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
  }
}

// Exit on q/Ctrl-C (not escape — the textbox uses escape to cancel)
screen.key(['q', 'C-c'], () => process.exit(0));
