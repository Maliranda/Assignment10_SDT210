// === hostConfig.js ===
// This wires react-reconciler to IPC messages + Yoga layout
// In production, main.js would import this instead of sending raw messages
const Reconciler = require('react-reconciler');
const Yoga = require('yoga-layout-prebuilt');

let idCounter = 0;
let sendFn = null; // Injected by renderer.js — writes JSON to child stdin

function setSendFunction(fn) {
  sendFn = fn;
}

function send(msg) {
  if (sendFn) sendFn(msg);
}

// ── Utility: map React style props to Yoga node ──
function applyYogaStyles(yogaNode, props) {
  if (props.flex != null)
    yogaNode.setFlex(props.flex);
  if (props.flexDirection === 'row')
    yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
  else if (props.flexDirection === 'column')
    yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
  if (props.padding != null)
    yogaNode.setPadding(Yoga.EDGE_ALL, props.padding);
  if (props.margin != null)
    yogaNode.setMargin(Yoga.EDGE_ALL, props.margin);
  if (props.width != null)
    yogaNode.setWidth(props.width);
  if (props.height != null)
    yogaNode.setHeight(props.height);
  if (props.flexGrow != null)
    yogaNode.setFlexGrow(props.flexGrow);
  if (props.flexShrink != null)
    yogaNode.setFlexShrink(props.flexShrink);
  if (props.alignItems === 'center')
    yogaNode.setAlignItems(Yoga.ALIGN_CENTER);
  if (props.justifyContent === 'center')
    yogaNode.setJustifyContent(Yoga.JUSTIFY_CENTER);
}

// ── Utility: walk Yoga tree and emit layout messages ──
function walkAndEmitLayout(node) {
  const layout = node.yogaNode.getComputedLayout();
  send({
    op: 'layout',
    id: node.id,
    x: Math.round(layout.left),
    y: Math.round(layout.top),
    w: Math.round(layout.width),
    h: Math.round(layout.height),
  });
  node.children.forEach(walkAndEmitLayout);
}

// ── Utility: diff props to find what changed ──
function diffProps(oldProps, newProps) {
  const diff = {};
  let hasDiff = false;

  // Find changed / added keys
  for (const key of Object.keys(newProps)) {
    if (key === 'children') continue;
    if (oldProps[key] !== newProps[key]) {
      diff[key] = newProps[key];
      hasDiff = true;
    }
  }

  // Find removed keys
  for (const key of Object.keys(oldProps)) {
    if (key === 'children') continue;
    if (!(key in newProps)) {
      diff[key] = undefined;
      hasDiff = true;
    }
  }

  return hasDiff ? diff : null;
}

// ═══════════════════════════════════════════════════════
//  HOST CONFIG — react-reconciler interface
// ═══════════════════════════════════════════════════════
const hostConfig = {
  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,

  // ── Context ──
  getRootHostContext() {
    return {};
  },
  getChildHostContext(parentContext) {
    return parentContext;
  },

  // ── Instance Creation ──
  createInstance(type, props, rootContainer, hostContext, internalHandle) {
    const id = 'n' + (++idCounter);
    const yogaNode = Yoga.Node.create();
    applyYogaStyles(yogaNode, props);

    const instance = { id, type, props, yogaNode, children: [] };

    // Send IPC create message (props minus children/event handlers)
    const ipcProps = {};
    for (const [k, v] of Object.entries(props)) {
      if (k === 'children' || typeof v === 'function') continue;
      ipcProps[k] = v;
    }
    send({ op: 'create', id, type, props: ipcProps });

    return instance;
  },

  createTextInstance(text, rootContainer, hostContext, internalHandle) {
    const id = 'n' + (++idCounter);
    const yogaNode = Yoga.Node.create();
    // Text nodes are leaf nodes with fixed height
    yogaNode.setHeight(1);

    send({ op: 'create', id, type: 'text', props: { content: text } });

    return { id, type: 'text', text, yogaNode, children: [] };
  },

  // ── Tree Mutations ──
  appendChild(parent, child) {
    parent.children.push(child);
    parent.yogaNode.insertChild(child.yogaNode, parent.children.length - 1);
    send({ op: 'appendChild', parentId: parent.id, childId: child.id });
  },

  appendChildToContainer(container, child) {
    container.children.push(child);
    container.yogaNode.insertChild(child.yogaNode, container.children.length - 1);
    send({ op: 'appendChild', parentId: 'root', childId: child.id });
  },

  insertBefore(parent, child, beforeChild) {
    const idx = parent.children.indexOf(beforeChild);
    if (idx === -1) {
      parent.children.push(child);
    } else {
      parent.children.splice(idx, 0, child);
    }
    parent.yogaNode.insertChild(child.yogaNode, Math.max(idx, 0));
    send({ op: 'insertBefore', parentId: parent.id, childId: child.id, beforeId: beforeChild.id });
  },

  removeChild(parent, child) {
    parent.children = parent.children.filter(c => c !== child);
    parent.yogaNode.removeChild(child.yogaNode);
    send({ op: 'removeChild', parentId: parent.id, childId: child.id });
  },

  removeChildFromContainer(container, child) {
    container.children = container.children.filter(c => c !== child);
    container.yogaNode.removeChild(child.yogaNode);
    send({ op: 'removeChild', parentId: 'root', childId: child.id });
  },

  // ── Updates ──
  prepareUpdate(instance, type, oldProps, newProps) {
    return diffProps(oldProps, newProps);
  },

  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    if (!updatePayload) return;

    // Update Yoga if layout props changed
    applyYogaStyles(instance.yogaNode, updatePayload);

    // Update stored props
    instance.props = { ...instance.props, ...updatePayload };

    // Send IPC update (filter out functions)
    const ipcProps = {};
    for (const [k, v] of Object.entries(updatePayload)) {
      if (typeof v === 'function') continue;
      ipcProps[k] = v;
    }
    send({ op: 'update', id: instance.id, props: ipcProps });
  },

  commitTextUpdate(textInstance, oldText, newText) {
    textInstance.text = newText;
    send({ op: 'setText', id: textInstance.id, text: newText });
  },

  // ── Commit Lifecycle ──
  prepareForCommit() {
    return null;
  },

  resetAfterCommit(container) {
    // 1. Compute Yoga layout for the entire tree
    const cols = process.stdout.columns || 80;
    const rows = process.stdout.rows || 24;
    container.yogaNode.calculateLayout(cols, rows, Yoga.DIRECTION_LTR);

    // 2. Walk the tree and emit layout messages for every node
    walkAndEmitLayout(container);

    // 3. Signal batch complete — terminal process calls screen.render()
    send({ op: 'commit' });
  },

  // ── Misc required methods ──
  getPublicInstance(instance) {
    return instance;
  },

  shouldSetTextContent(type, props) {
    return false;
  },

  finalizeInitialChildren() {
    return false;
  },

  appendInitialChild(parent, child) {
    parent.children.push(child);
    parent.yogaNode.insertChild(child.yogaNode, parent.children.length - 1);
    send({ op: 'appendChild', parentId: parent.id, childId: child.id });
  },

  clearContainer(container) {
    container.children = [];
  },

  // ── Scheduling (use default microtask) ──
  now: Date.now,
  scheduleDeferredCallback: undefined,
  cancelDeferredCallback: undefined,
  setTimeout,
  clearTimeout,
  noTimeout: -1,
  isPrimaryRenderer: true,
  warnsIfNotActing: false,
  supportsMicrotasks: true,
  scheduleMicrotask: queueMicrotask,
};

// ═══════════════════════════════════════════════════════
//  CREATE THE RENDERER
// ═══════════════════════════════════════════════════════
const reconciler = Reconciler(hostConfig);

function createContainer() {
  const rootId = 'root';
  const yogaNode = Yoga.Node.create();
  yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
  yogaNode.setWidth(process.stdout.columns || 80);
  yogaNode.setHeight(process.stdout.rows || 24);

  const container = { id: rootId, type: 'root', props: {}, yogaNode, children: [] };
  const fiberRoot = reconciler.createContainer(container, 0, null, false, null, '', null, null);

  return {
    render(element) {
      reconciler.updateContainer(element, fiberRoot, null, () => {});
    },
  };
}

module.exports = { createContainer, setSendFunction };