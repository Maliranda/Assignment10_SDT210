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
      // Forward events back to Node.js via stdout
      widget.on('click', () => {
        process.stdout.write(JSON.stringify({
          event: 'click', targetId: msg.id
        }) + '\n');
      });
      widget.on('keypress', (ch, key) => {
        process.stdout.write(JSON.stringify({
          event: 'keypress', targetId: msg.id,
          key: key.name, ch
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
        if (msg.props.label != null) widget.setLabel(msg.props.label);
      }
      break;
    }
    case 'setText': {
      const widget = registry.get(msg.id);
      if (widget) widget.setContent(msg.text);
      break;
    }
    case 'layout': {
      const widget = registry.get(msg.id);
      if (widget) {
        widget.left = msg.x;
        widget.top = msg.y;
        widget.width = msg.w;
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

// Exit on q/Escape/Ctrl-C
screen.key(['q', 'escape', 'C-c'], () => process.exit(0));