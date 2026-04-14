"use strict";
// === src/ui/Badge.tsx ===
// Compact coloured label — used for status indicators, counts, and tags.
// Renders as a single-line text element with a foreground colour.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = Badge;
const react_1 = __importDefault(require("react"));
function Badge({ label, color = 'white', bold = false, width }) {
    return (react_1.default.createElement("btext", { content: label, 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        style: { fg: color, bold }, width: width, height: 1 }));
}
