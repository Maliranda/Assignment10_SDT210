// === src/ui/Button.tsx ===
// Clickable text element.  Active/inactive states are shown via colour.
// The onClick prop is stored in the IPC callback store — never serialised.

import React from 'react';

interface ButtonProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  width?: number;
}

export function Button({ label, active = false, onClick, width }: ButtonProps): React.ReactElement {
  return (
    <btext
      content={active ? `[${label}]` : ` ${label} `}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ fg: active ? 'black' : 'cyan', bg: active ? 'cyan' : undefined, bold: active } as any}
      onClick={onClick}
      width={width ?? label.length + 2}
      height={1}
    />
  );
}
