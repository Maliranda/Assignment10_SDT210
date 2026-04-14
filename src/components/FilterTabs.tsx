// === src/components/FilterTabs.tsx ===
// Horizontal tab bar for switching between All / Active / Done filters.
// Composed from Row + Button UI Kit components.

import React from 'react';
import { Row, Button, Badge } from '../ui';

export type Filter = 'all' | 'active' | 'done';

interface FilterTabsProps {
  current: Filter;
  onSelect: (f: Filter) => void;
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',    label: 'All'    },
  { key: 'active', label: 'Active' },
  { key: 'done',   label: 'Done'   },
];

export function FilterTabs({ current, onSelect }: FilterTabsProps): React.ReactElement {
  return (
    <Row height={1} paddingLeft={2}>
      <Badge label="Filter: " color="grey" width={8} />
      {FILTERS.map(({ key, label }) => (
        <Button
          key={key}
          label={label}
          active={current === key}
          onClick={() => onSelect(key)}
        />
      ))}
    </Row>
  );
}
