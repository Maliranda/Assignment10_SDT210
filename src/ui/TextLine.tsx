// === src/ui/TextLine.tsx ===
// Single-line styled text block.  The workhorse for all text display in the
// app — wraps the `text` primitive with colour, bold, and optional truncation.

import React from 'react';

interface TextLineProps {
  children: string;
  color?: string;
  bold?: boolean;
  dim?: boolean;
  /** Fixed column width — content is NOT automatically truncated by Yoga */
  width?: number;
}

export function TextLine({
  children,
  color = 'white',
  bold = false,
  dim = false,
  width,
}: TextLineProps): React.ReactElement {
  const fg = dim ? 'grey' : color;
  return (
    <btext
      content={children}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ fg, bold } as any}
      height={1}
      width={width}
    />
  );
}
