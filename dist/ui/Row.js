"use strict";
// === src/ui/Row.tsx ===
// Horizontal flex container — lays children left-to-right.
// Equivalent to `display: flex; flex-direction: row` in CSS.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Row = Row;
const react_1 = __importDefault(require("react"));
function Row({ height = 1, padding, paddingLeft, paddingRight, justifyContent, alignItems, children, }) {
    return (react_1.default.createElement("box", { flexDirection: "row", height: height, padding: padding, paddingLeft: paddingLeft, paddingRight: paddingRight, justifyContent: justifyContent, alignItems: alignItems }, children));
}
