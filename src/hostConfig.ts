// === src/hostConfig.ts ===
// react-reconciler host config — the bridge between React's Fiber engine and
// our terminal renderer.  Every method does three things in order:
//   1. Update the local JS tree (React bookkeeping)
//   2. Manage the Yoga node tree (insert / remove / apply props)
//   3. Send the corresponding IPC message to the target process

import Yoga = require('yoga-layout-prebuilt');
import type { Instance, TextInstance, Container, HostContext, UpdatePayload, Props } from './types';
import { ipcSend, registerCallback, unregisterCallback } from './ipc';
import { applyYogaProps, sendLayoutUpdates, YOGA_ONLY_PROPS } from './yoga-utils';

// ── ID counter ──────────────────────────────────────────────────────────────
let idCounter = 0;
function nextId(): string { return 'n' + (++idCounter); }

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Strip Yoga-only props and function props before sending to blessed. */
function ipcProps(props: Props): Props {
  const out: Props = {};
  for (const [k, v] of Object.entries(props)) {
    if (k === 'children') continue;
    if (typeof v === 'function') continue;
    if (YOGA_ONLY_PROPS.has(k)) continue;
    out[k] = v;
  }
  return out;
}

/** Register any event-handler props as local callbacks. */
function registerHandlers(id: string, props: Props): void {
  if (typeof props.onClick === 'function')
    registerCallback(id, 'click', props.onClick as () => void);
  if (typeof props.onKeypress === 'function')
    registerCallback(id, 'keypress', props.onKeypress as () => void);
}

/** Diff old vs new props; return only what changed (null = no change). */
function diffProps(oldProps: Props, newProps: Props): UpdatePayload {
  const diff: Props = {};
  let hasDiff = false;

  for (const key of Object.keys(newProps)) {
    if (key === 'children') continue;
    if (oldProps[key] !== newProps[key]) { diff[key] = newProps[key]; hasDiff = true; }
  }
  for (const key of Object.keys(oldProps)) {
    if (key === 'children') continue;
    if (!(key in newProps)) { diff[key] = undefined; hasDiff = true; }
  }

  return hasDiff ? diff : null;
}

// ═══════════════════════════════════════════════════════════════════════════
//  HOST CONFIG
// ═══════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hostConfig: any = {
  supportsMutation:    true,
  supportsPersistence: false,
  supportsHydration:   false,
  isPrimaryRenderer:   true,
  noTimeout:           -1,
  now:                 Date.now,
  setTimeout,
  clearTimeout,
  supportsMicrotasks:  true,
  scheduleMicrotask:   queueMicrotask,

  // ── Context ──────────────────────────────────────────────────────────────
  getRootHostContext():                       HostContext { return {}; },
  getChildHostContext(ctx: HostContext):      HostContext { return ctx; },
  getPublicInstance(instance: Instance):     Instance    { return instance; },

  // ── Introspection ────────────────────────────────────────────────────────
  shouldSetTextContent(): boolean { return false; },
  finalizeInitialChildren():  boolean { return false; },

  // ── Instance Creation ────────────────────────────────────────────────────
  createInstance(
    type: string,
    props: Props,
  ): Instance {
    const id = nextId();
    const yogaNode = Yoga.Node.create();
    applyYogaProps(yogaNode, props);
    registerHandlers(id, props);

    const instance: Instance = { id, type, props, children: [], yogaNode };

    ipcSend({ op: 'create', id, type, props: ipcProps(props) });
    return instance;
  },

  createTextInstance(text: string): TextInstance {
    const id = nextId();
    const yogaNode = Yoga.Node.create();
    yogaNode.setHeight(1); // text nodes are single-line leaf nodes

    ipcSend({ op: 'create', id, type: 'text', props: { content: text } });
    return { id, text, yogaNode };
  },

  // ── Initial tree building (before first commit) ──────────────────────────
  appendInitialChild(parent: Instance, child: Instance | TextInstance): void {
    parent.children.push(child);
    parent.yogaNode.insertChild(child.yogaNode, parent.children.length - 1);
    child.parent = parent;
    ipcSend({ op: 'appendChild', parentId: parent.id, childId: child.id });
  },

  // ── Live tree mutations (after commit) ───────────────────────────────────
  appendChild(parent: Instance, child: Instance | TextInstance): void {
    parent.children.push(child);
    parent.yogaNode.insertChild(child.yogaNode, parent.children.length - 1);
    child.parent = parent;
    ipcSend({ op: 'appendChild', parentId: parent.id, childId: child.id });
  },

  appendChildToContainer(container: Container, child: Instance | TextInstance): void {
    container.children.push(child);
    container.yogaNode.insertChild(child.yogaNode, container.children.length - 1);
    child.parent = container;
    ipcSend({ op: 'appendChild', parentId: 'root', childId: child.id });
  },

  insertBefore(
    parent: Instance,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    const idx = parent.children.indexOf(beforeChild);
    if (idx === -1) {
      parent.children.push(child);
    } else {
      parent.children.splice(idx, 0, child);
    }
    parent.yogaNode.insertChild(child.yogaNode, Math.max(idx, 0));
    child.parent = parent;
    ipcSend({ op: 'insertBefore', parentId: parent.id, childId: child.id, beforeId: beforeChild.id });
  },

  insertInContainerBefore(
    container: Container,
    child: Instance | TextInstance,
    beforeChild: Instance | TextInstance,
  ): void {
    const idx = container.children.indexOf(beforeChild);
    if (idx === -1) {
      container.children.push(child);
    } else {
      container.children.splice(idx, 0, child);
    }
    container.yogaNode.insertChild(child.yogaNode, Math.max(idx, 0));
    child.parent = container;
    ipcSend({ op: 'insertBefore', parentId: 'root', childId: child.id, beforeId: beforeChild.id });
  },

  removeChild(parent: Instance, child: Instance | TextInstance): void {
    child.yogaNode.freeRecursive();
    ipcSend({ op: 'removeChild', parentId: parent.id, childId: child.id });
  },

  removeChildFromContainer(container: Container, child: Instance | TextInstance): void {
    child.yogaNode.freeRecursive();
    ipcSend({ op: 'removeChild', parentId: 'root', childId: child.id });
  },

  detachDeletedInstance(child: Instance | TextInstance): void {
    if (child.parent) {
      child.parent.children = child.parent.children.filter(c => c !== child);
      child.parent.yogaNode.removeChild(child.yogaNode);
    }
  },

  // ── Prop updates ─────────────────────────────────────────────────────────
  prepareUpdate(
    _instance: Instance,
    _type: string,
    oldProps: Props,
    newProps: Props,
  ): UpdatePayload {
    return diffProps(oldProps, newProps);
  },

  commitUpdate(
    instance: Instance,
    updatePayload: Props,
    _type: string,
    _oldProps: Props,
    newProps: Props,
  ): void {
    // 1. Update Yoga if any layout prop changed
    applyYogaProps(instance.yogaNode, updatePayload);

    // 2. Re-register event callbacks if they changed
    if ('onClick' in updatePayload) {
      if (typeof updatePayload.onClick === 'function')
        registerCallback(instance.id, 'click', updatePayload.onClick as () => void);
      else
        unregisterCallback(instance.id, 'click');
    }
    if ('onKeypress' in updatePayload) {
      if (typeof updatePayload.onKeypress === 'function')
        registerCallback(instance.id, 'keypress', updatePayload.onKeypress as () => void);
      else
        unregisterCallback(instance.id, 'keypress');
    }

    // 3. Store new props
    instance.props = newProps;

    // 4. Send only non-Yoga, non-function changed props to blessed
    ipcSend({ op: 'update', id: instance.id, props: ipcProps(updatePayload) });
  },

  commitTextUpdate(textInstance: TextInstance, _oldText: string, newText: string): void {
    textInstance.text = newText;
    ipcSend({ op: 'setText', id: textInstance.id, text: newText });
  },

  // ── Commit lifecycle ──────────────────────────────────────────────────────
  prepareForCommit(): null { return null; },

  resetAfterCommit(container: Container): void {
    // 1. Compute Yoga layout for the full tree relative to terminal dimensions
    const cols = process.stdout.columns || 80;
    const rows = process.stdout.rows  || 24;
    container.yogaNode.calculateLayout(cols, rows, Yoga.DIRECTION_LTR);

    // 2. Walk the tree and emit a layout IPC message for every node
    sendLayoutUpdates(container);

    // 3. Signal commit end — terminal host calls screen.render()
    ipcSend({ op: 'commit' });
  },

  clearContainer(container: Container): void {
    container.children = [];
  },
};
