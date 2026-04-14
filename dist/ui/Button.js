"use strict";
// === src/ui/Button.tsx ===
// Clickable text element.  Active/inactive states are shown via colour.
// The onClick prop is stored in the IPC callback store — never serialised.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = Button;
const react_1 = __importDefault(require("react"));
function Button({ label, active = false, onClick, width }) {
    return (react_1.default.createElement("btext", { content: active ? `[${label}]` : ` ${label} `, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style: { fg: active ? 'black' : 'cyan', bg: active ? 'cyan' : undefined, bold: active }, onClick: onClick, width: width !== null && width !== void 0 ? width : label.length + 2, height: 1 }));
}
