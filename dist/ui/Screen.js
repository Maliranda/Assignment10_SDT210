"use strict";
// === src/ui/Screen.tsx ===
// Full-terminal-size root wrapper.  Fills the entire Yoga container and stacks
// its children in a column — the first UI Kit component every app uses.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Screen = Screen;
const react_1 = __importDefault(require("react"));
function Screen({ children }) {
    return (react_1.default.createElement("box", { flexGrow: 1, flexDirection: "column" }, children));
}
