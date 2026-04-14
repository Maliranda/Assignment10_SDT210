// === src/ui/Badge.tsx ===
// Compact coloured label — used for status indicators, counts, and tags.
// Renders as a single-line text element with a foreground colour.

import React from 'react';

interface BadgeProps {
  /** Display text */
  label: string;
  /** Blessed colour name, e.g. 'green', 'red', 'yellow', 'cyan' */
  color?: string;
  bold?: boolean;
  width?: number;
}

export function Badge({ label, color = 'white', bold = false, width }: BadgeProps): React.ReactElement {
  return (
    <btext
      content={label}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ fg: color, bold } as any}
      width={width}
      height={1}
    />
  );
}
