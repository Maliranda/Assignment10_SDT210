"use strict";
// === src/hostConfig.ts ===
// react-reconciler host config — the bridge between React's Fiber engine and
// our terminal renderer.  Every method does three things in order:
//   1. Update the local JS tree (React bookkeeping)
//   2. Manage the Yoga node tree (insert / remove / apply props)
//   3. Send the corresponding IPC message to the target process
Object.defineProperty(exports, "__esModule", { value: true });
exports.hostConfig = void 0;
const Yoga = require("yoga-layout-prebuilt");
const ipc_1 = require("./ipc");
const yoga_utils_1 = require("./yoga-utils");
// ── ID counter ──────────────────────────────────────────────────────────────
let idCounter = 0;
function nextId() { return 'n' + (++idCounter); }
// ── Helpers ─────────────────────────────────────────────────────────────────
/** Strip Yoga-only props and function props before sending to blessed. */
function ipcProps(props) {
    const out = {};
    for (const [k, v] of Object.entries(props)) {
        if (k === 'children')
            continue;
        if (typeof v === 'function')
            continue;
        if (yoga_utils_1.YOGA_ONLY_PROPS.has(k))
            continue;
        out[k] = v;
    }
    return out;
}
/** Register any event-handler props as local callbacks. */
function registerHandlers(id, props) {
    if (typeof props.onClick === 'function')
        (0, ipc_1.registerCallback)(id, 'click', props.onClick);
    if (typeof props.onKeypress === 'function')
        (0, ipc_1.registerCallback)(id, 'keypress', props.onKeypress);
}
/** Diff old vs new props; return only what changed (null = no change). */
function diffProps(oldProps, newProps) {
    const diff = {};
    let hasDiff = false;
    for (const key of Object.keys(newProps)) {
        if (key === 'children')
            continue;
        if (oldProps[key] !== newProps[key]) {
            diff[key] = newProps[key];
            hasDiff = true;
        }
    }
    for (const key of Object.keys(oldProps)) {
        if (key === 'children')
            continue;
        if (!(key in newProps)) {
            diff[key] = undefined;
            hasDiff = true;
        }
    }
    return hasDiff ? diff : null;
}
// ═══════════════════════════════════════════════════════════════════════════
//  HOST CONFIG
// ═══════════════════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.hostConfig = {
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    isPrimaryRenderer: true,
    noTimeout: -1,
    now: Date.now,
    setTimeout,
    clearTimeout,
    supportsMicrotasks: true,
    scheduleMicrotask: queueMicrotask,
    // ── Context ──────────────────────────────────────────────────────────────
    getRootHostContext() { return {}; },
    getChildHostContext(ctx) { return ctx; },
    getPublicInstance(instance) { return instance; },
    // ── Introspection ────────────────────────────────────────────────────────
    shouldSetTextContent() { return false; },
    finalizeInitialChildren() { return false; },
    // ── Instance Creation ────────────────────────────────────────────────────
    createInstance(type, props) {
        const id = nextId();
        const yogaNode = Yoga.Node.create();
        (0, yoga_utils_1.applyYogaProps)(yogaNode, props);
        registerHandlers(id, props);
        const instance = { id, type, props, children: [], yogaNode };
        (0, ipc_1.ipcSend)({ op: 'create', id, type, props: ipcProps(props) });
        return instance;
    },
    createTextInstance(text) {
        const id = nextId();
        const yogaNode = Yoga.Node.create();
        yogaNode.setHeight(1); // text nodes are single-line leaf nodes
        (0, ipc_1.ipcSend)({ op: 'create', id, type: 'text', props: { content: text } });
        return { id, text, yogaNode };
    },
    // ── Initial tree building (before first commit) ──────────────────────────
    appendInitialChild(parent, child) {
        parent.children.push(child);
        parent.yogaNode.insertChild(child.yogaNode, parent.children.length - 1);
        child.parent = parent;
        (0, ipc_1.ipcSend)({ op: 'appendChild', parentId: parent.id, childId: child.id });
    },
    // ── Live tree mutations (after commit) ───────────────────────────────────
    appendChild(parent, child) {
        parent.children.push(child);
        parent.yogaNode.insertChild(child.yogaNode, parent.children.length - 1);
        child.parent = parent;
        (0, ipc_1.ipcSend)({ op: 'appendChild', parentId: parent.id, childId: child.id });
    },
    appendChildToContainer(container, child) {
        container.children.push(child);
        container.yogaNode.insertChild(child.yogaNode, container.children.length - 1);
        child.parent = container;
        (0, ipc_1.ipcSend)({ op: 'appendChild', parentId: 'root', childId: child.id });
    },
    insertBefore(parent, child, beforeChild) {
        const idx = parent.children.indexOf(beforeChild);
        if (idx === -1) {
            parent.children.push(child);
        }
        else {
            parent.children.splice(idx, 0, child);
        }
        parent.yogaNode.insertChild(child.yogaNode, Math.max(idx, 0));
        child.parent = parent;
        (0, ipc_1.ipcSend)({ op: 'insertBefore', parentId: parent.id, childId: child.id, beforeId: beforeChild.id });
    },
    insertInContainerBefore(container, child, beforeChild) {
        const idx = container.children.indexOf(beforeChild);
        if (idx === -1) {
            container.children.push(child);
        }
        else {
            container.children.splice(idx, 0, child);
        }
        container.yogaNode.insertChild(child.yogaNode, Math.max(idx, 0));
        child.parent = container;
        (0, ipc_1.ipcSend)({ op: 'insertBefore', parentId: 'root', childId: child.id, beforeId: beforeChild.id });
    },
    removeChild(parent, child) {
        child.yogaNode.freeRecursive();
        (0, ipc_1.ipcSend)({ op: 'removeChild', parentId: parent.id, childId: child.id });
    },
    removeChildFromContainer(container, child) {
        child.yogaNode.freeRecursive();
        (0, ipc_1.ipcSend)({ op: 'removeChild', parentId: 'root', childId: child.id });
    },
    detachDeletedInstance(child) {
        if (child.parent) {
            child.parent.children = child.parent.children.filter(c => c !== child);
            child.parent.yogaNode.removeChild(child.yogaNode);
        }
    },
    // ── Prop updates ─────────────────────────────────────────────────────────
    prepareUpdate(_instance, _type, oldProps, newProps) {
        return diffProps(oldProps, newProps);
    },
    commitUpdate(instance, updatePayload, _type, _oldProps, newProps) {
        // 1. Update Yoga if any layout prop changed
        (0, yoga_utils_1.applyYogaProps)(instance.yogaNode, updatePayload);
        // 2. Re-register event callbacks if they changed
        if ('onClick' in updatePayload) {
            if (typeof updatePayload.onClick === 'function')
                (0, ipc_1.registerCallback)(instance.id, 'click', updatePayload.onClick);
            else
                (0, ipc_1.unregisterCallback)(instance.id, 'click');
        }
        if ('onKeypress' in updatePayload) {
            if (typeof updatePayload.onKeypress === 'function')
                (0, ipc_1.registerCallback)(instance.id, 'keypress', updatePayload.onKeypress);
            else
                (0, ipc_1.unregisterCallback)(instance.id, 'keypress');
        }
        // 3. Store new props
        instance.props = newProps;
        // 4. Send only non-Yoga, non-function changed props to blessed
        (0, ipc_1.ipcSend)({ op: 'update', id: instance.id, props: ipcProps(updatePayload) });
    },
    commitTextUpdate(textInstance, _oldText, newText) {
        textInstance.text = newText;
        (0, ipc_1.ipcSend)({ op: 'setText', id: textInstance.id, text: newText });
    },
    // ── Commit lifecycle ──────────────────────────────────────────────────────
    prepareForCommit() { return null; },
    resetAfterCommit(container) {
        // 1. Compute Yoga layout for the full tree relative to terminal dimensions
        const cols = process.stdout.columns || 80;
        const rows = process.stdout.rows || 24;
        container.yogaNode.calculateLayout(cols, rows, Yoga.DIRECTION_LTR);
        // 2. Walk the tree and emit a layout IPC message for every node
        (0, yoga_utils_1.sendLayoutUpdates)(container);
        // 3. Signal commit end — terminal host calls screen.render()
        (0, ipc_1.ipcSend)({ op: 'commit' });
    },
    clearContainer(container) {
        container.children = [];
    },
};
