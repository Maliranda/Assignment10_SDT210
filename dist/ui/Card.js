"use strict";
// === src/ui/Card.tsx ===
// Bordered box with an optional label — analogous to a panel or dialog.
// Uses blessed's line-border and cyan accent colour from the theme.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = Card;
const react_1 = __importDefault(require("react"));
function Card({ label, flexGrow, flexDirection = 'column', padding, height, width, children, }) {
    return (react_1.default.createElement("box", { border: { type: 'line' }, label: label ? ` ${label} ` : undefined, style: { border: { fg: 'cyan' }, label: { fg: 'cyan' } }, flexGrow: flexGrow, flexDirection: flexDirection, padding: padding, height: height, width: width }, children));
}
