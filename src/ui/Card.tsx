// === src/ui/Card.tsx ===
// Bordered box with an optional label — analogous to a panel or dialog.
// Uses blessed's line-border and cyan accent colour from the theme.

import React from 'react';

interface CardProps {
  label?: string;
  /** Yoga flex props forwarded to the inner box */
  flexGrow?: number;
  flexDirection?: 'row' | 'column';
  padding?: number;
  height?: number;
  width?: number;
  children?: React.ReactNode;
}

export function Card({
  label,
  flexGrow,
  flexDirection = 'column',
  padding,
  height,
  width,
  children,
}: CardProps): React.ReactElement {
  return (
    <box
      border={{ type: 'line' }}
      label={label ? ` ${label} ` : undefined}
      style={{ border: { fg: 'cyan' }, label: { fg: 'cyan' } }}
      flexGrow={flexGrow}
      flexDirection={flexDirection}
      padding={padding}
      height={height}
      width={width}
    >
      {children}
    </box>
  );
}
