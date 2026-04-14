// === src/yoga-utils.ts ===
// Yoga layout helpers used by hostConfig.
//
// Two responsibilities:
//  1. applyYogaProps  — translate React style props into Yoga API calls
//  2. sendLayoutUpdates — walk the committed tree and emit {op:"layout"} IPC
//     messages after calculateLayout() has been called on the root node.

import Yoga = require('yoga-layout-prebuilt');
import type { Instance, TextInstance, Container, Props } from './types';
import { ipcSend } from './ipc';

// Props that only live in Yoga and must NOT be forwarded to blessed.
const YOGA_ONLY_PROPS = new Set([
  'flex', 'flexGrow', 'flexShrink', 'flexDirection',
  'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'alignItems', 'justifyContent',
  // width / height are forwarded via the layout message, not the create message
  'width', 'height',
]);

export { YOGA_ONLY_PROPS };

/** Map React-style layout props onto a Yoga node. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyYogaProps(yogaNode: any, props: Props): void {
  if (props.flex != null)         yogaNode.setFlex(props.flex as number);
  if (props.flexGrow != null)     yogaNode.setFlexGrow(props.flexGrow as number);
  if (props.flexShrink != null)   yogaNode.setFlexShrink(props.flexShrink as number);

  if (props.flexDirection === 'row')    yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_ROW);
  if (props.flexDirection === 'column') yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);

  if (props.padding != null)       yogaNode.setPadding(Yoga.EDGE_ALL,    props.padding as number);
  if (props.paddingTop != null)    yogaNode.setPadding(Yoga.EDGE_TOP,    props.paddingTop as number);
  if (props.paddingBottom != null) yogaNode.setPadding(Yoga.EDGE_BOTTOM, props.paddingBottom as number);
  if (props.paddingLeft != null)   yogaNode.setPadding(Yoga.EDGE_LEFT,   props.paddingLeft as number);
  if (props.paddingRight != null)  yogaNode.setPadding(Yoga.EDGE_RIGHT,  props.paddingRight as number);

  if (props.margin != null)        yogaNode.setMargin(Yoga.EDGE_ALL,    props.margin as number);
  if (props.marginTop != null)     yogaNode.setMargin(Yoga.EDGE_TOP,    props.marginTop as number);
  if (props.marginBottom != null)  yogaNode.setMargin(Yoga.EDGE_BOTTOM, props.marginBottom as number);
  if (props.marginLeft != null)    yogaNode.setMargin(Yoga.EDGE_LEFT,   props.marginLeft as number);
  if (props.marginRight != null)   yogaNode.setMargin(Yoga.EDGE_RIGHT,  props.marginRight as number);

  if (props.width != null)  yogaNode.setWidth(props.width as number);
  if (props.height != null) yogaNode.setHeight(props.height as number);

  if (props.alignItems === 'center')     yogaNode.setAlignItems(Yoga.ALIGN_CENTER);
  if (props.alignItems === 'flex-start') yogaNode.setAlignItems(Yoga.ALIGN_FLEX_START);
  if (props.alignItems === 'flex-end')   yogaNode.setAlignItems(Yoga.ALIGN_FLEX_END);

  if (props.justifyContent === 'center')        yogaNode.setJustifyContent(Yoga.JUSTIFY_CENTER);
  if (props.justifyContent === 'flex-start')    yogaNode.setJustifyContent(Yoga.JUSTIFY_FLEX_START);
  if (props.justifyContent === 'space-between') yogaNode.setJustifyContent(Yoga.JUSTIFY_SPACE_BETWEEN);
}

/** Recursively walk the committed tree and send a layout IPC message per node. */
export function sendLayoutUpdates(node: Instance | TextInstance | Container): void {
  const layout = node.yogaNode.getComputedLayout();
  ipcSend({
    op: 'layout',
    id: node.id,
    x: Math.round(layout.left),
    y: Math.round(layout.top),
    w: Math.round(layout.width),
    h: Math.round(layout.height),
  });

  if ('children' in node) {
    for (const child of node.children) {
      sendLayoutUpdates(child);
    }
  }
}
