// === src/ui/Screen.tsx ===
// Full-terminal-size root wrapper.  Fills the entire Yoga container and stacks
// its children in a column — the first UI Kit component every app uses.

import React from 'react';

interface ScreenProps {
  children: React.ReactNode;
}

export function Screen({ children }: ScreenProps): React.ReactElement {
  return (
    <box flexGrow={1} flexDirection="column">
      {children}
    </box>
  );
}
