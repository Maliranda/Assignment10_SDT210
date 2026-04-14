"use strict";
// === src/renderer.ts ===
// Wires react-reconciler to our hostConfig and exports the public API:
//   createContainer() — allocate the root container with its Yoga node
//   render()          — update the container with a React element tree
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContainer = createContainer;
exports.render = render;
const react_reconciler_1 = __importDefault(require("react-reconciler"));
const Yoga = require("yoga-layout-prebuilt");
const hostConfig_1 = require("./hostConfig");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reconciler = (0, react_reconciler_1.default)(hostConfig_1.hostConfig);
/** Allocate a root container sized to the current terminal dimensions. */
function createContainer() {
    const yogaNode = Yoga.Node.create();
    yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
    yogaNode.setWidth(process.stdout.columns || 80);
    yogaNode.setHeight(process.stdout.rows || 24);
    const container = { id: 'root', children: [], yogaNode };
    // createContainer(containerInfo, tag, hydrationCallbacks, isStrictMode,
    //                concurrentUpdatesByDefault, identifierPrefix,
    //                onRecoverableError, transitionCallbacks)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    container.__fiberRoot = reconciler.createContainer(container, 0, null, false, null, '', (error) => console.error('Recoverable error:', error), null);
    return container;
}
/** Render a React element into the container (idempotent — safe to call again for updates). */
function render(element, container) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reconciler.updateContainer(element, container.__fiberRoot, null, () => { });
}
