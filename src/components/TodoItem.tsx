// === src/components/TodoItem.tsx ===
// Composed from UI Kit primitives (Row, Badge, TextLine).
// Highlights the selected row and shows a done/pending checkbox.

import React from 'react';
import { Row, Badge, TextLine } from '../ui';

interface TodoItemProps {
  text: string;
  done: boolean;
  selected: boolean;
}

export function TodoItem({ text, done, selected }: TodoItemProps): React.ReactElement {
  const checkbox = done ? '[✓]' : '[ ]';
  const textColor = done ? 'green' : selected ? 'white' : 'white';

  return (
    <Row height={1} paddingLeft={2}>
      {/* Selection indicator */}
      <Badge
        label={selected ? '▶ ' : '  '}
        color={selected ? 'cyan' : 'white'}
        width={2}
      />
      {/* Checkbox */}
      <Badge
        label={checkbox + ' '}
        color={done ? 'green' : selected ? 'cyan' : 'grey'}
        width={5}
      />
      {/* Todo text */}
      <TextLine color={textColor} dim={done}>
        {text}
      </TextLine>
    </Row>
  );
}
