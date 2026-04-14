// === src/types.ts ===
// Core instance types for the TerminalReact custom renderer.
// Each Instance maps 1-to-1 with a blessed widget in the target process,
// addressed by its unique `id` over the IPC pipe.

export type Props = Record<string, unknown>;

// Use the real Yoga type from the package so there is no duplicate-interface conflict.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type YogaNode = any;

/** Represents a rendered element node (box, text, etc.) */
export interface Instance {
  /** Unique identifier used in IPC messages */
  id: string;
  /** Blessed widget type: 'box' | 'text' | … */
  type: string;
  /** Current props (updated on commitUpdate) */
  props: Props;
  /** Child instances in tree order */
  children: Array<Instance | TextInstance>;
  /** Yoga node for flexbox layout computation */
  yogaNode: YogaNode;
  /** Parent instance or container */
  parent?: Instance | Container;
}

/** Represents a raw text node (string child of JSX) */
export interface TextInstance {
  id: string;
  text: string;
  yogaNode: YogaNode;
  /** Parent instance or container */
  parent?: Instance | Container;
}

/** The root container — wraps the blessed screen */
export interface Container {
  readonly id: 'root';
  children: Array<Instance | TextInstance>;
  yogaNode: YogaNode;
}

/** Host context (unused but required by react-reconciler interface) */
export type HostContext = Record<string, never>;

/** Diff result from prepareUpdate — null means no change */
export type UpdatePayload = Props | null;
