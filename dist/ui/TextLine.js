"use strict";
// === src/ui/TextLine.tsx ===
// Single-line styled text block.  The workhorse for all text display in the
// app — wraps the `text` primitive with colour, bold, and optional truncation.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextLine = TextLine;
const react_1 = __importDefault(require("react"));
function TextLine({ children, color = 'white', bold = false, dim = false, width, flexGrow = width == null ? 1 : undefined, }) {
    const fg = dim ? 'grey' : color;
    return (react_1.default.createElement("btext", { content: children, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style: { fg, bold }, height: 1, width: width, flexGrow: flexGrow }));
}
