import { useState } from "react";

const SECTIONS = [
  "Architecture",
  "Protocol",
  "Elements",
  "HostConfig",
  "PoC Code",
];

// ── Color tokens ──
const C = {
  bg: "#0a0e17",
  surface: "#111827",
  border: "#1e293b",
  accent: "#22d3ee",
  accentDim: "#0e7490",
  green: "#34d399",
  red: "#f87171",
  yellow: "#fbbf24",
  purple: "#a78bfa",
  text: "#e2e8f0",
  dim: "#64748b",
  code: "#1e1e2e",
};

// ── Architecture Diagram (SVG) ──
function ArchitectureDiagram() {
  return (
    <div style={{ overflowX: "auto", padding: "12px 0" }}>
      <svg viewBox="0 0 920 520" style={{ width: "100%", maxWidth: 920, display: "block", margin: "0 auto" }}>
        <defs>
          <marker id="arr" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6" fill={C.accent} />
          </marker>
          <marker id="arrBack" markerWidth="8" markerHeight="6" refX="0" refY="3" orient="auto">
            <path d="M8,0 L0,3 L8,6" fill={C.yellow} />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="g" />
            <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="920" height="520" rx="12" fill={C.bg} />

        {/* Title */}
        <text x="460" y="36" textAnchor="middle" fill={C.accent} fontSize="18" fontWeight="700" fontFamily="monospace">
          TerminalReact — Two-Process Architecture
        </text>

        {/* ── Node.js Process Box ── */}
        <rect x="30" y="60" width="380" height="420" rx="10" fill={C.surface} stroke={C.accent} strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="220" y="88" textAnchor="middle" fill={C.accent} fontSize="14" fontWeight="700" fontFamily="monospace">Node.js Process</text>

        {/* React Components */}
        <rect x="70" y="108" width="300" height="52" rx="6" fill={C.code} stroke={C.border} />
        <text x="220" y="130" textAnchor="middle" fill={C.text} fontSize="13" fontFamily="monospace">{"<App />"} — React Components</text>
        <text x="220" y="148" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">useState, useEffect, JSX tree</text>

        {/* Arrow */}
        <line x1="220" y1="160" x2="220" y2="178" stroke={C.accent} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Reconciler */}
        <rect x="70" y="180" width="300" height="52" rx="6" fill={C.code} stroke={C.purple} />
        <text x="220" y="202" textAnchor="middle" fill={C.purple} fontSize="13" fontWeight="600" fontFamily="monospace">react-reconciler (Fiber)</text>
        <text x="220" y="220" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">Render phase → Commit phase</text>

        {/* Arrow */}
        <line x1="220" y1="232" x2="220" y2="250" stroke={C.accent} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* HostConfig */}
        <rect x="70" y="252" width="300" height="52" rx="6" fill={C.code} stroke={C.green} />
        <text x="220" y="274" textAnchor="middle" fill={C.green} fontSize="13" fontWeight="600" fontFamily="monospace">hostConfig (our code)</text>
        <text x="220" y="292" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">createInstance, appendChild, commitUpdate…</text>

        {/* Arrow */}
        <line x1="220" y1="304" x2="220" y2="322" stroke={C.accent} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Yoga Layout */}
        <rect x="70" y="324" width="300" height="52" rx="6" fill={C.code} stroke={C.yellow} />
        <text x="220" y="346" textAnchor="middle" fill={C.yellow} fontSize="13" fontWeight="600" fontFamily="monospace">Yoga Layout Engine</text>
        <text x="220" y="364" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">calculateLayout → {"{x, y, w, h}"}</text>

        {/* Instance store */}
        <rect x="70" y="400" width="300" height="52" rx="6" fill={C.code} stroke={C.dim} />
        <text x="220" y="422" textAnchor="middle" fill={C.text} fontSize="12" fontFamily="monospace">Instance Store (Map{"<id, Instance>"})</text>
        <text x="220" y="440" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">id, type, props, yogaNode, children[]</text>

        {/* Arrow to Yoga */}
        <line x1="220" y1="376" x2="220" y2="398" stroke={C.accent} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* ── IPC Boundary ── */}
        <line x1="460" y1="70" x2="460" y2="470" stroke={C.accent} strokeWidth="2" strokeDasharray="8 4" filter="url(#glow)" />
        <rect x="435" y="230" width="50" height="60" rx="6" fill={C.bg} stroke={C.accent} strokeWidth="1.5" />
        <text x="460" y="254" textAnchor="middle" fill={C.accent} fontSize="10" fontWeight="700" fontFamily="monospace">IPC</text>
        <text x="460" y="268" textAnchor="middle" fill={C.accent} fontSize="9" fontFamily="monospace">stdin/</text>
        <text x="460" y="280" textAnchor="middle" fill={C.accent} fontSize="9" fontFamily="monospace">stdout</text>

        {/* Forward arrow (mutations) */}
        <line x1="370" y1="245" x2="433" y2="245" stroke={C.accent} strokeWidth="2" markerEnd="url(#arr)" />
        <text x="400" y="238" textAnchor="middle" fill={C.accent} fontSize="9" fontFamily="monospace">JSON ops →</text>

        {/* Back arrow (events) */}
        <line x1="433" y1="275" x2="370" y2="275" stroke={C.yellow} strokeWidth="2" markerEnd="url(#arrBack)" />
        <text x="400" y="298" textAnchor="middle" fill={C.yellow} fontSize="9" fontFamily="monospace">← events</text>

        {/* ── Target Process Box ── */}
        <rect x="510" y="60" width="380" height="420" rx="10" fill={C.surface} stroke={C.green} strokeWidth="1.5" strokeDasharray="6 3" />
        <text x="700" y="88" textAnchor="middle" fill={C.green} fontSize="14" fontWeight="700" fontFamily="monospace">Terminal Process</text>

        {/* Message Parser */}
        <rect x="550" y="108" width="300" height="48" rx="6" fill={C.code} stroke={C.border} />
        <text x="700" y="130" textAnchor="middle" fill={C.text} fontSize="13" fontFamily="monospace">stdin JSON Parser</text>
        <text x="700" y="146" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">readline → JSON.parse → dispatch</text>

        <line x1="700" y1="156" x2="700" y2="174" stroke={C.green} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Widget Registry */}
        <rect x="550" y="176" width="300" height="52" rx="6" fill={C.code} stroke={C.green} />
        <text x="700" y="198" textAnchor="middle" fill={C.green} fontSize="13" fontWeight="600" fontFamily="monospace">Widget Registry</text>
        <text x="700" y="216" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">Map{"<id, blessed.Widget>"}</text>

        <line x1="700" y1="228" x2="700" y2="246" stroke={C.green} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Command Handler */}
        <rect x="550" y="248" width="300" height="64" rx="6" fill={C.code} stroke={C.border} />
        <text x="700" y="270" textAnchor="middle" fill={C.text} fontSize="12" fontFamily="monospace">Command Handler</text>
        <text x="700" y="286" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">create → blessed.box({"..."})</text>
        <text x="700" y="300" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">layout → widget.left/top/width/height</text>

        <line x1="700" y1="312" x2="700" y2="330" stroke={C.green} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* blessed screen */}
        <rect x="550" y="332" width="300" height="48" rx="6" fill={C.code} stroke={C.yellow} />
        <text x="700" y="354" textAnchor="middle" fill={C.yellow} fontSize="13" fontWeight="600" fontFamily="monospace">blessed.screen()</text>
        <text x="700" y="368" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">screen.render() after each batch</text>

        <line x1="700" y1="380" x2="700" y2="398" stroke={C.green} strokeWidth="1.5" markerEnd="url(#arr)" />

        {/* Terminal output */}
        <rect x="550" y="400" width="300" height="52" rx="6" fill="#0d1117" stroke={C.green} strokeWidth="2" />
        <text x="700" y="422" textAnchor="middle" fill={C.green} fontSize="14" fontWeight="700" fontFamily="monospace">Terminal Output</text>
        <text x="700" y="440" textAnchor="middle" fill={C.dim} fontSize="10" fontFamily="monospace">╔═══ Todo App ═══╗  ▏ items…</text>

        {/* Event flow label */}
        <rect x="555" y="475" width="290" height="20" rx="4" fill="none" />
        <text x="700" y="490" textAnchor="middle" fill={C.yellow} fontSize="10" fontFamily="monospace">Events: keypress / click → stdout JSON → Node.js</text>

        {/* Legend */}
        <rect x="32" y="484" width="8" height="8" rx="2" fill={C.accent} />
        <text x="46" y="492" fill={C.dim} fontSize="9" fontFamily="monospace">Mutations</text>
        <rect x="112" y="484" width="8" height="8" rx="2" fill={C.yellow} />
        <text x="126" y="492" fill={C.dim} fontSize="9" fontFamily="monospace">Events</text>
        <rect x="182" y="484" width="8" height="8" rx="2" fill={C.green} />
        <text x="196" y="492" fill={C.dim} fontSize="9" fontFamily="monospace">Target</text>
        <rect x="242" y="484" width="8" height="8" rx="2" fill={C.purple} />
        <text x="256" y="492" fill={C.dim} fontSize="9" fontFamily="monospace">Reconciler</text>
      </svg>
    </div>
  );
}

// ── Protocol Table ──
const PROTOCOL = [
  { op: "create", example: `{ op: "create", id: "n1", type: "box", props: { style: { border: "line" }, label: "Todo" } }`, desc: "Create a blessed widget and store in registry" },
  { op: "appendChild", example: `{ op: "appendChild", parentId: "n1", childId: "n2" }`, desc: "Append child widget to parent via blessed .append()" },
  { op: "removeChild", example: `{ op: "removeChild", parentId: "n1", childId: "n2" }`, desc: "Detach child widget via blessed .remove()" },
  { op: "update", example: `{ op: "update", id: "n1", props: { label: "Done" } }`, desc: "Update widget props; merge into existing blessed options" },
  { op: "setText", example: `{ op: "setText", id: "n5", text: "Buy milk" }`, desc: "Set content of a text widget via .setContent()" },
  { op: "layout", example: `{ op: "layout", id: "n1", x: 0, y: 0, w: 80, h: 5 }`, desc: "Apply Yoga-computed position: left, top, width, height" },
  { op: "commit", example: `{ op: "commit" }`, desc: "Signal end of batch → screen.render()" },
  { op: "event ←", example: `{ event: "keypress", targetId: "n7", key: "enter" }`, desc: "Sent FROM terminal process back to Node.js" },
];

// ── Element types ──
const ELEMENTS = [
  { el: "<container>", purpose: "Root layout wrapper", blessed: "blessed.box({ ... })", yoga: "FLEX_DIRECTION_COLUMN" },
  { el: "<box>", purpose: "Generic flex container", blessed: "blessed.box({ border:'line' })", yoga: "width/height/padding/margin" },
  { el: "<text>", purpose: "Display text content", blessed: "blessed.text({ content })", yoga: "MEASURE_MODE_EXACTLY" },
  { el: "<input>", purpose: "User text input", blessed: "blessed.textbox({ inputOnFocus })", yoga: "Fixed height" },
  { el: "<button>", purpose: "Clickable action", blessed: "blessed.button({ mouse:true })", yoga: "Fixed height, padding" },
  { el: "<list>", purpose: "Scrollable todo list", blessed: "blessed.list({ scrollable })", yoga: "FLEX_GROW: 1" },
  { el: "<checkbox>", purpose: "Toggle item done", blessed: "blessed.checkbox({ ... })", yoga: "Fixed 1-row height" },
];

// ── HostConfig mapping ──
const HOSTCONFIG = [
  { method: "createInstance(type, props)", ipc: '{ op: "create", id, type, props }', yoga: "Yoga.Node.create(); set flexDirection, padding, etc." },
  { method: "createTextInstance(text)", ipc: '{ op: "create", id, type: "text", props: { content: text } }', yoga: "Leaf node with measureFunc" },
  { method: "appendChild(parent, child)", ipc: '{ op: "appendChild", parentId, childId }', yoga: "parent.yogaNode.insertChild(child.yogaNode, idx)" },
  { method: "removeChild(parent, child)", ipc: '{ op: "removeChild", parentId, childId }', yoga: "parent.yogaNode.removeChild(child.yogaNode)" },
  { method: "commitUpdate(inst, updatePayload)", ipc: '{ op: "update", id, props: diffed }', yoga: "Update yoga props if layout-related" },
  { method: "commitTextUpdate(inst, old, new)", ipc: '{ op: "setText", id, text }', yoga: "Mark dirty → recalc" },
  { method: "resetAfterCommit(container)", ipc: 'Batch layout msgs + { op: "commit" }', yoga: "root.calculateLayout(cols, rows); walk tree → emit layout ops" },
  { method: "appendChildToContainer", ipc: '{ op: "appendChild", parentId: "root", childId }', yoga: "rootYoga.insertChild(...)" },
  { method: "getPublicInstance(inst)", ipc: "—", yoga: "Returns the Instance object" },
  { method: "prepareForCommit / resetAfterCommit", ipc: "—", yoga: "Begin / end of commit phase" },
];

// ── PoC source code ──
const POC_HOST = `// === terminal-host.js ===
// This is the TARGET PROCESS — run separately
const blessed = require('blessed');
const readline = require('readline');

const screen = blessed.screen({ smartCSR: true, title: 'TerminalReact' });
const registry = new Map();
registry.set('root', screen);

// Read JSON messages from stdin (one per line)
const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
  try {
    const msg = JSON.parse(line);
    handleMessage(msg);
  } catch (e) {
    process.stderr.write('Parse error: ' + e.message + '\\n');
  }
});

function handleMessage(msg) {
  switch (msg.op) {
    case 'create': {
      const widget = blessed[msg.type === 'container' ? 'box' : msg.type]({
        ...msg.props,
        // blessed uses left/top/width/height for positioning
      });
      // Forward events back to Node.js via stdout
      widget.on('click', () => {
        process.stdout.write(JSON.stringify({
          event: 'click', targetId: msg.id
        }) + '\\n');
      });
      widget.on('keypress', (ch, key) => {
        process.stdout.write(JSON.stringify({
          event: 'keypress', targetId: msg.id,
          key: key.name, ch
        }) + '\\n');
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
`;

const POC_MAIN = `// === main.js ===
// This is the NODE.JS PROCESS — spawns terminal-host as child
const { spawn } = require('child_process');

// Spawn the terminal host as a SEPARATE PROCESS
const host = spawn('node', ['terminal-host.js'], {
  stdio: ['pipe', 'pipe', 'inherit']  // stdin=pipe, stdout=pipe, stderr=inherit
});

// Send IPC messages as newline-delimited JSON via stdin
function send(msg) {
  host.stdin.write(JSON.stringify(msg) + '\\n');
}

// Listen for events from the terminal process via stdout
const readline = require('readline');
const rl = readline.createInterface({ input: host.stdout });
rl.on('line', (line) => {
  const event = JSON.parse(line);
  console.error('Event from terminal:', event);
  // In real renderer: dispatch to React event system
});

// ── Demo: send a few IPC messages to create UI ──
send({ op: 'create', id: 'n1', type: 'box', props: {
  border: { type: 'line' },
  label: ' Todo App ',
  style: { border: { fg: 'cyan' } }
}});

send({ op: 'appendChild', parentId: 'root', childId: 'n1' });

send({ op: 'create', id: 'n2', type: 'text', props: {
  content: '[ ] Buy groceries',
  style: { fg: 'white' }
}});

send({ op: 'appendChild', parentId: 'n1', childId: 'n2' });

send({ op: 'layout', id: 'n1', x: 2, y: 1, w: 40, h: 10 });
send({ op: 'layout', id: 'n2', x: 1, y: 1, w: 38, h: 1 });

send({ op: 'commit' });  // → screen.render()

// After 2 seconds, update the text (simulating React state change)
setTimeout(() => {
  send({ op: 'setText', id: 'n2', text: '[✓] Buy groceries' });
  send({ op: 'commit' });
}, 2000);
`;

const POC_HOSTCONFIG = `// === hostConfig.js (sketch) ===
// This wires react-reconciler to IPC
const Reconciler = require('react-reconciler');
const Yoga = require('yoga-layout-prebuilt');

let idCounter = 0;

const hostConfig = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  createInstance(type, props) {
    const id = 'n' + (++idCounter);
    const yogaNode = Yoga.Node.create();
    // Map flex props to Yoga
    if (props.flex) yogaNode.setFlex(props.flex);
    if (props.flexDirection === 'row')
      yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
    if (props.padding) yogaNode.setPadding(Yoga.EDGE_ALL, props.padding);
    if (props.height) yogaNode.setHeight(props.height);

    const instance = { id, type, props, yogaNode, children: [] };
    // Send create message over IPC
    send({ op: 'create', id, type, props });
    return instance;
  },

  createTextInstance(text) {
    const id = 'n' + (++idCounter);
    const yogaNode = Yoga.Node.create();
    send({ op: 'create', id, type: 'text', props: { content: text } });
    return { id, type: 'text', text, yogaNode, children: [] };
  },

  appendChild(parent, child) {
    parent.children.push(child);
    parent.yogaNode.insertChild(child.yogaNode, parent.children.length - 1);
    send({ op: 'appendChild', parentId: parent.id, childId: child.id });
  },

  removeChild(parent, child) {
    parent.children = parent.children.filter(c => c !== child);
    parent.yogaNode.removeChild(child.yogaNode);
    send({ op: 'removeChild', parentId: parent.id, childId: child.id });
  },

  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    const diff = diffProps(oldProps, newProps);
    if (diff) {
      instance.props = { ...instance.props, ...diff };
      send({ op: 'update', id: instance.id, props: diff });
    }
  },

  commitTextUpdate(instance, oldText, newText) {
    instance.text = newText;
    send({ op: 'setText', id: instance.id, text: newText });
  },

  resetAfterCommit(container) {
    // Compute Yoga layout
    container.yogaNode.calculateLayout(
      process.stdout.columns || 80,
      process.stdout.rows || 24,
      Yoga.DIRECTION_LTR
    );
    // Walk tree, emit layout messages
    walkAndEmitLayout(container);
    send({ op: 'commit' });
  },

  // ... other required methods (getRootHostContext, etc.)
};

function walkAndEmitLayout(node) {
  const layout = node.yogaNode.getComputedLayout();
  send({
    op: 'layout', id: node.id,
    x: layout.left, y: layout.top,
    w: layout.width, h: layout.height
  });
  node.children.forEach(walkAndEmitLayout);
}
`;

function CodeBlock({ code, title }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {title && (
        <div style={{
          background: C.accent, color: C.bg, padding: "4px 12px",
          fontSize: 12, fontWeight: 700, fontFamily: "monospace",
          borderRadius: "6px 6px 0 0", display: "inline-block"
        }}>{title}</div>
      )}
      <pre style={{
        background: C.code, border: `1px solid ${C.border}`,
        borderRadius: title ? "0 6px 6px 6px" : 6,
        padding: 14, margin: 0, overflowX: "auto",
        fontSize: 11.5, lineHeight: 1.55, color: C.text,
        fontFamily: "'Fira Code', 'Source Code Pro', monospace",
        maxHeight: 420,
      }}>{code}</pre>
    </div>
  );
}

function Table({ headers, rows, colors }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "monospace" }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: "left", padding: "8px 10px",
                borderBottom: `2px solid ${C.accent}`,
                color: C.accent, fontWeight: 700, whiteSpace: "nowrap"
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
              {row.map((cell, j) => (
                <td key={j} style={{
                  padding: "7px 10px",
                  color: j === 0 ? (colors?.[0] || C.green) : C.text,
                  fontWeight: j === 0 ? 600 : 400,
                  verticalAlign: "top",
                  fontSize: j >= 2 ? 11 : 12,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Sections ──
function SectionArchitecture() {
  return (
    <div>
      <h3 style={{ color: C.accent, fontFamily: "monospace", margin: "0 0 8px" }}>1. Architecture Diagram</h3>
      <p style={{ color: C.dim, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
        Two separate OS processes connected via <span style={{ color: C.accent }}>stdin/stdout pipes</span>.
        React + reconciler + Yoga run in Node.js. The terminal UI runs in a child process using <span style={{ color: C.green }}>blessed</span>.
        All mutations flow as newline-delimited JSON. Events flow back on stdout.
      </p>
      <ArchitectureDiagram />
      <div style={{ marginTop: 12, padding: 10, background: C.code, borderRadius: 6, border: `1px solid ${C.border}` }}>
        <p style={{ color: C.yellow, fontSize: 12, margin: 0, fontFamily: "monospace" }}>Key design decisions:</p>
        <ul style={{ color: C.text, fontSize: 12, margin: "6px 0 0 16px", padding: 0, lineHeight: 1.7, fontFamily: "monospace" }}>
          <li><span style={{ color: C.accent }}>Yoga runs in Node.js</span> — layout is computed before sending position data to terminal</li>
          <li><span style={{ color: C.accent }}>Batch commits</span> — all mutations collected, then a single <code style={{ color: C.green }}>"commit"</code> triggers screen.render()</li>
          <li><span style={{ color: C.accent }}>stdin/stdout IPC</span> — simplest transport; no extra deps; one JSON per line</li>
          <li><span style={{ color: C.accent }}>Widget registry</span> — both processes maintain id→object maps for O(1) lookup</li>
          <li><span style={{ color: C.accent }}>Events bubble back</span> — terminal process writes JSON events to stdout, Node.js dispatches to React</li>
        </ul>
      </div>
    </div>
  );
}

function SectionProtocol() {
  return (
    <div>
      <h3 style={{ color: C.accent, fontFamily: "monospace", margin: "0 0 8px" }}>2. Communication Protocol</h3>
      <p style={{ color: C.dim, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
        Newline-delimited JSON over stdin (Node→Terminal) and stdout (Terminal→Node).
        Each message is a single JSON object, one per line. The <code style={{ color: C.green }}>commit</code> op signals end-of-batch.
      </p>
      <Table
        headers={["Operation", "Example Message", "Description"]}
        rows={PROTOCOL.map(p => [p.op, p.example, p.desc])}
      />
    </div>
  );
}

function SectionElements() {
  return (
    <div>
      <h3 style={{ color: C.accent, fontFamily: "monospace", margin: "0 0 8px" }}>3. Element Types & Platform Mapping</h3>
      <p style={{ color: C.dim, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
        These JSX elements map to <span style={{ color: C.green }}>blessed</span> widgets. Chosen to support a full todo app.
      </p>
      <Table
        headers={["JSX Element", "Purpose", "blessed Primitive", "Yoga Config"]}
        rows={ELEMENTS.map(e => [e.el, e.purpose, e.blessed, e.yoga])}
        colors={[C.purple]}
      />
      <div style={{ marginTop: 14, padding: 10, background: C.code, borderRadius: 6, border: `1px solid ${C.border}` }}>
        <p style={{ color: C.yellow, fontSize: 12, margin: "0 0 4px", fontFamily: "monospace" }}>Todo App JSX example:</p>
        <pre style={{ color: C.text, fontSize: 11.5, margin: 0, fontFamily: "monospace", lineHeight: 1.6 }}>{`<container flexDirection="column">
  <text>📋 My Todos</text>
  <list flex={1}>
    <box><checkbox /><text>Buy groceries</text></box>
    <box><checkbox checked /><text>Walk the dog</text></box>
  </list>
  <input placeholder="Add new todo..." />
  <button onClick={handleAdd}>Add</button>
</container>`}</pre>
      </div>
    </div>
  );
}

function SectionHostConfig() {
  return (
    <div>
      <h3 style={{ color: C.accent, fontFamily: "monospace", margin: "0 0 8px" }}>4. HostConfig Method Mapping</h3>
      <p style={{ color: C.dim, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
        Each <code style={{ color: C.purple }}>react-reconciler</code> callback maps to an IPC message and a Yoga operation.
      </p>
      <Table
        headers={["hostConfig Method", "IPC Message", "Yoga Operation"]}
        rows={HOSTCONFIG.map(h => [h.method, h.ipc, h.yoga])}
        colors={[C.purple]}
      />
    </div>
  );
}

function SectionPoC() {
  return (
    <div>
      <h3 style={{ color: C.accent, fontFamily: "monospace", margin: "0 0 8px" }}>5. Feasibility PoC — Working Code</h3>
      <p style={{ color: C.dim, fontSize: 13, margin: "0 0 12px", lineHeight: 1.5 }}>
        Three files demonstrate the full pipeline. Run <code style={{ color: C.green }}>node main.js</code> to see the terminal UI appear.
      </p>
      <CodeBlock title="terminal-host.js — Target Process (blessed)" code={POC_HOST} />
      <CodeBlock title="main.js — Node.js Process (spawns child, sends IPC)" code={POC_MAIN} />
      <CodeBlock title="hostConfig.js — Reconciler ↔ IPC Bridge (sketch)" code={POC_HOSTCONFIG} />
      <div style={{ marginTop: 12, padding: 10, background: C.code, borderRadius: 6, border: `1px solid ${C.border}` }}>
        <p style={{ color: C.green, fontSize: 12, margin: 0, fontFamily: "monospace" }}>▶ To run the PoC:</p>
        <pre style={{ color: C.text, fontSize: 11.5, margin: "6px 0 0", fontFamily: "monospace" }}>{`npm init -y
npm install blessed
node main.js`}</pre>
      </div>
    </div>
  );
}

const SECTION_COMPONENTS = [SectionArchitecture, SectionProtocol, SectionElements, SectionHostConfig, SectionPoC];

export default function TerminalRendererPresentation() {
  const [active, setActive] = useState(0);
  const Section = SECTION_COMPONENTS[active];

  return (
    <div style={{
      background: C.bg, color: C.text, minHeight: "100vh",
      fontFamily: "'IBM Plex Mono', 'Fira Code', monospace",
      padding: "20px 16px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: C.dim, letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>
          Week 10 · Project 8 · Group Presentation
        </div>
        <h1 style={{
          fontSize: 26, margin: "0 0 4px", color: C.accent,
          fontWeight: 800, letterSpacing: -0.5
        }}>
          TerminalReact
        </h1>
        <div style={{ color: C.dim, fontSize: 13 }}>
          A Custom React Renderer for Terminal UI via blessed + IPC
        </div>
      </div>

      {/* Tab nav */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 20, overflowX: "auto",
        borderBottom: `1px solid ${C.border}`, paddingBottom: 0
      }}>
        {SECTIONS.map((s, i) => (
          <button
            key={s}
            onClick={() => setActive(i)}
            style={{
              background: active === i ? C.accent : "transparent",
              color: active === i ? C.bg : C.dim,
              border: "none", padding: "8px 14px", cursor: "pointer",
              fontSize: 12, fontWeight: active === i ? 700 : 400,
              fontFamily: "monospace", borderRadius: "6px 6px 0 0",
              transition: "all .15s",
              whiteSpace: "nowrap",
            }}
          >{s}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Section />
      </div>

      {/* Footer nav */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        maxWidth: 920, margin: "24px auto 0", padding: "12px 0",
        borderTop: `1px solid ${C.border}`
      }}>
        <button
          onClick={() => setActive(Math.max(0, active - 1))}
          disabled={active === 0}
          style={{
            background: "transparent", border: `1px solid ${active === 0 ? C.border : C.accent}`,
            color: active === 0 ? C.border : C.accent, padding: "6px 16px",
            fontFamily: "monospace", fontSize: 12, cursor: active === 0 ? "default" : "pointer",
            borderRadius: 4,
          }}
        >← Prev</button>
        <span style={{ color: C.dim, fontSize: 11, alignSelf: "center" }}>
          {active + 1} / {SECTIONS.length}
        </span>
        <button
          onClick={() => setActive(Math.min(SECTIONS.length - 1, active + 1))}
          disabled={active === SECTIONS.length - 1}
          style={{
            background: active === SECTIONS.length - 1 ? "transparent" : C.accent,
            border: `1px solid ${active === SECTIONS.length - 1 ? C.border : C.accent}`,
            color: active === SECTIONS.length - 1 ? C.border : C.bg,
            padding: "6px 16px", fontFamily: "monospace", fontSize: 12,
            cursor: active === SECTIONS.length - 1 ? "default" : "pointer",
            borderRadius: 4, fontWeight: 700,
          }}
        >Next →</button>
      </div>
    </div>
  );
}