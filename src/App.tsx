// === src/App.tsx ===
// Todo App — exercises all renderer capabilities:
//   Creation  : initial list + adding todos
//   Updates   : toggling done state
//   Removal   : deleting a todo
//   Text      : live counter updates
//   Layout    : Yoga column + row positioning via IPC
//
// Keyboard shortcuts (captured by blessed screen → IPC → React state):
//   j / ↓       move selection down
//   k / ↑       move selection up
//   space       toggle done
//   d           delete selected todo
//   a           open input prompt to type a new task
//   1 / 2 / 3   switch filter (All / Active / Done)
//   q           quit

import React, { useState, useEffect, useCallback } from 'react';
import { Screen, Card, Row, TextLine, Badge, Spacer } from './ui';
import { FilterTabs, type Filter } from './components/FilterTabs';
import { TodoItem } from './components/TodoItem';
import { registerCallback, unregisterCallback } from './ipc';

// ── Types ────────────────────────────────────────────────────────────────────
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

let nextTodoId = 100;

// ── App ──────────────────────────────────────────────────────────────────────
export default function App(): React.ReactElement {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Buy groceries',  done: false },
    { id: 2, text: 'Walk the dog',   done: false },
    { id: 3, text: 'Write homework', done: true  },
  ]);
  const [filter, setFilter]       = useState<Filter>('all');
  const [selected, setSelected]   = useState(0);
  const [inputMode, setInputMode] = useState(false);
  const [inputText, setInputText] = useState('');

  // ── Filtered view ──────────────────────────────────────────────────────────
  const visible = todos.filter(t =>
    filter === 'all'    ? true :
    filter === 'active' ? !t.done :
    /* done */            t.done,
  );

  const clamp = (i: number) => Math.max(0, Math.min(i, visible.length - 1));

  // ── Keyboard handler ───────────────────────────────────────────────────────
  const handleKey = useCallback((event: { key: string; ch: string }) => {
    const key = event.key ?? event.ch;
    const ch  = event.ch;

    // ── Input mode: every keypress builds the new task text ──────────────────
    if (inputMode) {
      switch (key) {
        case 'return':
          // Submit: add todo if text is non-empty, then leave input mode
          if (inputText.trim()) {
            setTodos(ts => [...ts, { id: nextTodoId++, text: inputText.trim(), done: false }]);
          }
          setInputMode(false);
          setInputText('');
          break;
        case 'escape':
          // Cancel without adding
          setInputMode(false);
          setInputText('');
          break;
        case 'backspace':
          setInputText(t => t.slice(0, -1));
          break;
        default:
          // Append any printable character
          if (ch) {
            setInputText(t => t + ch);
          }
          break;
      }
      return;
    }

    // ── Normal mode ──────────────────────────────────────────────────────────
    setTodos(prev => {
      const vis = prev.filter(t =>
        filter === 'all'    ? true :
        filter === 'active' ? !t.done :
        /* done */            t.done,
      );

      switch (key) {
        case 'j': case 'down':
          setSelected(s => clamp(s + 1));
          break;
        case 'k': case 'up':
          setSelected(s => clamp(s - 1));
          break;
        case 'space': case 'return': {
          const target = vis[selected];
          if (!target) break;
          return prev.map(t => t.id === target.id ? { ...t, done: !t.done } : t);
        }
        case 'd': {
          const target = vis[selected];
          if (!target) break;
          setSelected(s => clamp(s - 1));
          return prev.filter(t => t.id !== target.id);
        }
        case 'a':
          // Enter input mode so user can type their own task
          setInputMode(true);
          setInputText('');
          break;
        case '1': setFilter('all');    break;
        case '2': setFilter('active'); break;
        case '3': setFilter('done');   break;
        case 'q':
          process.exit(0);
          break;
        default: break;
      }
      return prev;
    });
  }, [filter, selected, inputMode, inputText, clamp]);

  // Register the screen-level keypress callback
  useEffect(() => {
    registerCallback('screen', 'keypress', handleKey as (...args: unknown[]) => void);
    return () => unregisterCallback('screen', 'keypress');
  }, [handleKey]);

  // ── Derived counts ─────────────────────────────────────────────────────────
  const remaining = todos.filter(t => !t.done).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Screen>
      <Card label="TerminalReact Todo" flexGrow={1} flexDirection="column" padding={1}>

        {/* Filter tabs row */}
        <FilterTabs current={filter} onSelect={setFilter} />
        <Spacer size={1} />

        {/* Todo list */}
        {visible.length === 0 ? (
          <TextLine color="grey" dim>  (nothing here)</TextLine>
        ) : (
          visible.map((todo, idx) => (
            <TodoItem
              key={todo.id}
              text={todo.text}
              done={todo.done}
              selected={idx === selected}
            />
          ))
        )}

        {/* Input row — shown when user presses 'a' */}
        {inputMode && (
          <>
            <TextLine color="grey" dim>  Type your task, then press Enter to add or Escape to cancel</TextLine>
            <Row height={1} paddingLeft={2}>
              <Badge label="New: " color="yellow" width={6} />
              <TextLine color="white">{inputText + '█'}</TextLine>
            </Row>
          </>
        )}

        <Spacer flex />

        {/* Status bar */}
        <Row height={1} paddingLeft={2}>
          <Badge label={`${remaining} item${remaining !== 1 ? 's' : ''} left`} color="yellow" width={16} />
          <TextLine color="grey" dim>
            {inputMode
              ? '  Enter:add  Esc:cancel  Backspace:del'
              : '  j/k:move  space:toggle  d:del  a:add  1-3:filter  q:quit'}
          </TextLine>
        </Row>

      </Card>
    </Screen>
  );
}
