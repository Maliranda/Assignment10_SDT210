"use strict";
// === src/ui/Spacer.tsx ===
// Invisible gap element — grows to fill available space (flexGrow=1) or takes
// a fixed number of rows / columns depending on the parent flex direction.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spacer = Spacer;
const react_1 = __importDefault(require("react"));
function Spacer({ size = 1, flex = false }) {
    return (react_1.default.createElement("box", { flexGrow: flex ? 1 : undefined, height: flex ? undefined : size, width: flex ? undefined : size }));
}
