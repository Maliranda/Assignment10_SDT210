// === src/ui/Spacer.tsx ===
// Invisible gap element — grows to fill available space (flexGrow=1) or takes
// a fixed number of rows / columns depending on the parent flex direction.

import React from 'react';

interface SpacerProps {
  /** Fixed size in the parent's main axis (rows or columns) */
  size?: number;
  /** Set to true to expand and fill remaining space */
  flex?: boolean;
}

export function Spacer({ size = 1, flex = false }: SpacerProps): React.ReactElement {
  return (
    <box
      flexGrow={flex ? 1 : undefined}
      height={flex ? undefined : size}
      width={flex ? undefined : size}
    />
  );
}
