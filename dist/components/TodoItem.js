"use strict";
// === src/components/TodoItem.tsx ===
// Composed from UI Kit primitives (Row, Badge, TextLine).
// Highlights the selected row and shows a done/pending checkbox.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoItem = TodoItem;
const react_1 = __importDefault(require("react"));
const ui_1 = require("../ui");
function TodoItem({ text, done, selected }) {
    const checkbox = done ? '[✓]' : '[ ]';
    const textColor = done ? 'green' : selected ? 'white' : 'white';
    return (react_1.default.createElement(ui_1.Row, { height: 1, paddingLeft: 2 },
        react_1.default.createElement(ui_1.Badge, { label: selected ? '▶ ' : '  ', color: selected ? 'cyan' : 'white', width: 2 }),
        react_1.default.createElement(ui_1.Badge, { label: checkbox + ' ', color: done ? 'green' : selected ? 'cyan' : 'grey', width: 5 }),
        react_1.default.createElement(ui_1.TextLine, { color: textColor, dim: done }, text)));
}
