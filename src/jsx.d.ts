// === src/jsx.d.ts ===
// Declares the primitive element types understood by our terminal renderer.
// Blessed widget props (border, style, label, content) mix with Yoga layout
// props (flexDirection, padding, etc.) — hostConfig separates them at runtime.

import React from 'react';

// ── Shared Yoga layout props ─────────────────────────────────────────────────
interface YogaProps {
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexDirection?: 'row' | 'column';
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  width?: number;
  height?: number;
  alignItems?: 'center' | 'flex-start' | 'flex-end';
  justifyContent?: 'center' | 'flex-start' | 'flex-end' | 'space-between';
}

interface BlessedStyle {
  fg?: string;
  bg?: string;
  bold?: boolean;
  underline?: boolean;
  border?: { fg?: string; bg?: string };
  label?: { fg?: string; bg?: string };
  [key: string]: unknown;
}

// ── Primitive: box ───────────────────────────────────────────────────────────
interface BoxProps extends YogaProps {
  border?: { type: 'line' | 'bg' } | boolean;
  label?: string;
  style?: BlessedStyle;
  content?: string;
  tags?: boolean;
  mouse?: boolean;
  keys?: boolean;
  onClick?: () => void;
  onKeypress?: (event: { key: string; ch: string }) => void;
  children?: React.ReactNode;
  key?: React.Key;
}

// ── Primitive: btext ─────────────────────────────────────────────────────────
interface TextProps extends YogaProps {
  content?: string;
  style?: BlessedStyle;
  tags?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  key?: React.Key;
}

// ── Global JSX namespace override ───────────────────────────────────────────
// Note: 'text' is already declared in @types/react as an SVG element, which
// would merge (not replace) — so we use 'btext' as our terminal text primitive.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      box:   BoxProps;
      btext: TextProps;
    }
  }
}
