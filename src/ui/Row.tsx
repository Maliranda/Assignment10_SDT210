// === src/ui/Row.tsx ===
// Horizontal flex container — lays children left-to-right.
// Equivalent to `display: flex; flex-direction: row` in CSS.

import React from 'react';

interface RowProps {
  height?: number;
  padding?: number;
  paddingLeft?: number;
  paddingRight?: number;
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  alignItems?: 'flex-start' | 'center' | 'flex-end';
  children: React.ReactNode;
}

export function Row({
  height = 1,
  padding,
  paddingLeft,
  paddingRight,
  justifyContent,
  alignItems,
  children,
}: RowProps): React.ReactElement {
  return (
    <box
      flexDirection="row"
      height={height}
      padding={padding}
      paddingLeft={paddingLeft}
      paddingRight={paddingRight}
      justifyContent={justifyContent}
      alignItems={alignItems}
    >
      {children}
    </box>
  );
}
