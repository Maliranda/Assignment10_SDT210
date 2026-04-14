// === src/renderer.ts ===
// Wires react-reconciler to our hostConfig and exports the public API:
//   createContainer() — allocate the root container with its Yoga node
//   render()          — update the container with a React element tree

import React from 'react';
import Reconciler from 'react-reconciler';
import Yoga = require('yoga-layout-prebuilt');
import { hostConfig } from './hostConfig';
import type { Container } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reconciler = Reconciler(hostConfig as any);

/** Allocate a root container sized to the current terminal dimensions. */
export function createContainer(): Container {
  const yogaNode = Yoga.Node.create();
  yogaNode.setFlexDirection(Yoga.FLEX_DIRECTION_COLUMN);
  yogaNode.setWidth(process.stdout.columns  || 80);
  yogaNode.setHeight(process.stdout.rows || 24);

  const container: Container = { id: 'root', children: [], yogaNode };

  // createContainer(containerInfo, tag, hydrationCallbacks, isStrictMode,
  //                concurrentUpdatesByDefault, identifierPrefix,
  //                onRecoverableError, transitionCallbacks)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (container as any).__fiberRoot = reconciler.createContainer(
    container, 0, null, false, null, '',
    (error: Error) => console.error('Recoverable error:', error),
    null,
  );

  return container;
}

/** Render a React element into the container (idempotent — safe to call again for updates). */
export function render(element: React.ReactElement, container: Container): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reconciler.updateContainer(element, (container as any).__fiberRoot, null, () => {});
}
