"use strict";
// === src/components/FilterTabs.tsx ===
// Horizontal tab bar for switching between All / Active / Done filters.
// Composed from Row + Button UI Kit components.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterTabs = FilterTabs;
const react_1 = __importDefault(require("react"));
const ui_1 = require("../ui");
const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'done', label: 'Done' },
];
function FilterTabs({ current, onSelect }) {
    return (react_1.default.createElement(ui_1.Row, { height: 1, paddingLeft: 2 },
        react_1.default.createElement(ui_1.Badge, { label: "Filter: ", color: "grey", width: 8 }),
        FILTERS.map(({ key, label }) => (react_1.default.createElement(ui_1.Button, { key: key, label: label, active: current === key, onClick: () => onSelect(key) })))));
}
