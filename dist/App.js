"use strict";
// === src/App.tsx ===
// Todo App — exercises all renderer capabilities:
//   Creation  : initial list + adding todos
//   Updates   : toggling done state
//   Removal   : deleting a todo
//   Text      : live counter updates
//   Layout    : Yoga column + row positioning via IPC
//
// Keyboard shortcuts (captured by blessed screen → IPC → React state):
//   j / ↓       move selection down
//   k / ↑       move selection up
//   space       toggle done
//   d           delete selected todo
//   a           open input prompt to type a new task
//   1 / 2 / 3   switch filter (All / Active / Done)
//   q           quit
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = __importStar(require("react"));
const ui_1 = require("./ui");
const FilterTabs_1 = require("./components/FilterTabs");
const TodoItem_1 = require("./components/TodoItem");
const ipc_1 = require("./ipc");
let nextTodoId = 100;
// ── App ──────────────────────────────────────────────────────────────────────
function App() {
    const [todos, setTodos] = (0, react_1.useState)([
        { id: 1, text: 'Buy groceries', done: false },
        { id: 2, text: 'Walk the dog', done: false },
        { id: 3, text: 'Write homework', done: true },
    ]);
    const [filter, setFilter] = (0, react_1.useState)('all');
    const [selected, setSelected] = (0, react_1.useState)(0);
    const [inputMode, setInputMode] = (0, react_1.useState)(false);
    const [inputText, setInputText] = (0, react_1.useState)('');
    // ── Filtered view ──────────────────────────────────────────────────────────
    const visible = todos.filter(t => filter === 'all' ? true :
        filter === 'active' ? !t.done :
            /* done */ t.done);
    const clamp = (i) => Math.max(0, Math.min(i, visible.length - 1));
    // ── Keyboard handler ───────────────────────────────────────────────────────
    const handleKey = (0, react_1.useCallback)((event) => {
        var _a;
        const key = (_a = event.key) !== null && _a !== void 0 ? _a : event.ch;
        const ch = event.ch;
        // ── Input mode: every keypress builds the new task text ──────────────────
        if (inputMode) {
            switch (key) {
                case 'return':
                    // Submit: add todo if text is non-empty, then leave input mode
                    if (inputText.trim()) {
                        setTodos(ts => [...ts, { id: nextTodoId++, text: inputText.trim(), done: false }]);
                    }
                    setInputMode(false);
                    setInputText('');
                    break;
                case 'escape':
                    // Cancel without adding
                    setInputMode(false);
                    setInputText('');
                    break;
                case 'backspace':
                    setInputText(t => t.slice(0, -1));
                    break;
                default:
                    // Append any printable character
                    if (ch) {
                        setInputText(t => t + ch);
                    }
                    break;
            }
            return;
        }
        // ── Normal mode ──────────────────────────────────────────────────────────
        setTodos(prev => {
            const vis = prev.filter(t => filter === 'all' ? true :
                filter === 'active' ? !t.done :
                    /* done */ t.done);
            switch (key) {
                case 'j':
                case 'down':
                    setSelected(s => clamp(s + 1));
                    break;
                case 'k':
                case 'up':
                    setSelected(s => clamp(s - 1));
                    break;
                case 'space':
                case 'return': {
                    const target = vis[selected];
                    if (!target)
                        break;
                    return prev.map(t => t.id === target.id ? { ...t, done: !t.done } : t);
                }
                case 'd': {
                    const target = vis[selected];
                    if (!target)
                        break;
                    setSelected(s => clamp(s - 1));
                    return prev.filter(t => t.id !== target.id);
                }
                case 'a':
                    // Enter input mode so user can type their own task
                    setInputMode(true);
                    setInputText('');
                    break;
                case '1':
                    setFilter('all');
                    break;
                case '2':
                    setFilter('active');
                    break;
                case '3':
                    setFilter('done');
                    break;
                case 'q':
                    process.exit(0);
                    break;
                default: break;
            }
            return prev;
        });
    }, [filter, selected, inputMode, inputText, clamp]);
    // Register the screen-level keypress callback
    (0, react_1.useEffect)(() => {
        (0, ipc_1.registerCallback)('screen', 'keypress', handleKey);
        return () => (0, ipc_1.unregisterCallback)('screen', 'keypress');
    }, [handleKey]);
    // ── Derived counts ─────────────────────────────────────────────────────────
    const remaining = todos.filter(t => !t.done).length;
    // ── Render ─────────────────────────────────────────────────────────────────
    return (react_1.default.createElement(ui_1.Screen, null,
        react_1.default.createElement(ui_1.Card, { label: "TerminalReact Todo", flexGrow: 1, flexDirection: "column", padding: 1 },
            react_1.default.createElement(FilterTabs_1.FilterTabs, { current: filter, onSelect: setFilter }),
            react_1.default.createElement(ui_1.Spacer, { size: 1 }),
            visible.length === 0 ? (react_1.default.createElement(ui_1.TextLine, { color: "grey", dim: true }, "  (nothing here)")) : (visible.map((todo, idx) => (react_1.default.createElement(TodoItem_1.TodoItem, { key: todo.id, text: todo.text, done: todo.done, selected: idx === selected })))),
            inputMode && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(ui_1.TextLine, { color: "grey", dim: true }, "  Type your task, then press Enter to add or Escape to cancel"),
                react_1.default.createElement(ui_1.Row, { height: 1, paddingLeft: 2 },
                    react_1.default.createElement(ui_1.Badge, { label: "New: ", color: "yellow", width: 6 }),
                    react_1.default.createElement(ui_1.TextLine, { color: "white" }, inputText + '█')))),
            react_1.default.createElement(ui_1.Spacer, { flex: true }),
            react_1.default.createElement(ui_1.Row, { height: 1, paddingLeft: 2 },
                react_1.default.createElement(ui_1.Badge, { label: `${remaining} item${remaining !== 1 ? 's' : ''} left`, color: "yellow", width: 16 }),
                react_1.default.createElement(ui_1.TextLine, { color: "grey", dim: true }, inputMode
                    ? '  Enter:add  Esc:cancel  Backspace:del'
                    : '  j/k:move  space:toggle  d:del  a:add  1-3:filter  q:quit')))));
}
