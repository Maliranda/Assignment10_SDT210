// === main.js ===
// This is the NODE.JS PROCESS — spawns terminal-host as a child process
// Demonstrates cross-process IPC via stdin/stdout pipes
const { spawn } = require('child_process');
const readline = require('readline');

// Spawn the terminal host as a SEPARATE PROCESS
const host = spawn('node', ['terminal-host.js'], {
  stdio: ['pipe', 'pipe', 'inherit']  // stdin=pipe, stdout=pipe, stderr=inherit
});

// Send IPC messages as newline-delimited JSON via stdin
function send(msg) {
  host.stdin.write(JSON.stringify(msg) + '\n');
}

// ── Task state ──
// Each task: { id, text, done }
const tasks = [
  { id: 'n3', text: 'Buy groceries',  done: false },
  { id: 'n4', text: 'Walk the dog',   done: false },
  { id: 'n5', text: 'Write homework', done: true  },
];
let nextId = 10;

// ── Filter state: 'all' | 'active' | 'done' ──
let filter = 'all';

// ── Dynamic Y positions ──
// Tasks start at y=3, one row each.
// We always reserve space for ALL tasks (hidden ones stay in place),
// so the separator/buttons/input shift only when new tasks are added.
function separatorY() { return 3 + tasks.length + 1; }
function filterY()    { return separatorY() + 1; }
function labelY()     { return filterY() + 1; }
function inputY()     { return filterY() + 2; }
function boxHeight()  { return inputY() + 3; }

// ── Event listener: handle input from terminal ──
const rl = readline.createInterface({ input: host.stdout });
rl.on('line', (line) => {
  try {
    const event = JSON.parse(line);

    if (event.targetId === 'input1') {
      if (event.event === 'submit') {
        const taskText = (event.value || '').trim();
        if (taskText) {
          addTodo(taskText);
        } else {
          // Empty submit — restart input so the user can keep typing
          send({ op: 'readInput', id: 'input1' });
          send({ op: 'commit' });
        }
      } else if (event.event === 'cancel') {
        // Escape pressed — restart input so the user can keep typing
        send({ op: 'readInput', id: 'input1' });
        send({ op: 'commit' });
      }
    } else if (event.event === 'click') {
      handleClick(event.targetId);
    }
  } catch (e) {
    // Silently ignore non-JSON lines (blessed may emit terminal sequences)
  }
});

host.on('close', (code) => {
  console.error('Terminal process exited with code', code);
  process.exit(0);
});

// ── Filter helpers ──

// Show/hide tasks based on current filter, repositioning visible ones
function renderFilter() {
  let visibleY = 3;
  tasks.forEach((task) => {
    const visible =
      filter === 'all' ||
      (filter === 'active' && !task.done) ||
      (filter === 'done'   &&  task.done);

    if (visible) {
      send({ op: 'layout', id: task.id, x: 1, y: visibleY, w: 38, h: 1 });
      send({ op: 'show',   id: task.id });
      visibleY++;
    } else {
      send({ op: 'hide', id: task.id });
    }
  });
}

// Re-render filter button styles to highlight the active one
function updateFilterButtons() {
  ['all', 'active', 'done'].forEach((f) => {
    const id = f === 'all' ? 'fAll' : f === 'active' ? 'fActive' : 'fDone';
    const active = filter === f;
    send({ op: 'update', id, props: {
      style: { fg: active ? 'black' : 'cyan', bg: active ? 'cyan' : 'default' }
    }});
  });
}

// ── Click handler ──
function handleClick(targetId) {
  if (targetId === 'fAll' || targetId === 'fActive' || targetId === 'fDone') {
    filter = targetId === 'fAll' ? 'all' : targetId === 'fActive' ? 'active' : 'done';
    updateFilterButtons();
    renderFilter();
    send({ op: 'commit' });
    return;
  }

  // Click on a task → toggle done
  const task = tasks.find((t) => t.id === targetId);
  if (task) {
    task.done = !task.done;
    send({ op: 'update', id: task.id, props: {
      content: (task.done ? '[✓] ' : '[ ] ') + task.text,
      style:   { fg: task.done ? 'green' : 'white' },
    }});
    renderFilter();
    send({ op: 'commit' });
  }
}

// ── Add a new todo item dynamically ──
function addTodo(text) {
  const id   = 'n' + (++nextId);
  const task = { id, text, done: false };
  tasks.push(task);

  // Create a clickable box so the user can toggle it done/active
  send({ op: 'create', id, type: 'box', props: {
    content:   '[ ] ' + text,
    style:     { fg: 'white' },
    mouse:     true,
    clickable: true,
  }});
  send({ op: 'appendChild', parentId: 'n1', childId: id });
  // Initial layout — renderFilter will reposition if needed
  send({ op: 'layout', id, x: 1, y: 3 + (tasks.length - 1), w: 38, h: 1 });

  // Shift separator, filter row, label, and input box down by one row
  send({ op: 'layout', id: 'nsep',    x: 1,  y: separatorY(), w: 38, h: 1 });
  send({ op: 'layout', id: 'fAll',    x: 1,  y: filterY(),    w:  7, h: 1 });
  send({ op: 'layout', id: 'fActive', x: 9,  y: filterY(),    w:  9, h: 1 });
  send({ op: 'layout', id: 'fDone',   x: 19, y: filterY(),    w:  7, h: 1 });
  send({ op: 'layout', id: 'nlabel',  x: 1,  y: labelY(),     w: 38, h: 1 });
  send({ op: 'layout', id: 'input1',  x: 1,  y: inputY(),     w: 38, h: 1 });

  // Expand the main box to fit
  send({ op: 'layout', id: 'n1', x: 2, y: 1, w: 44, h: boxHeight() });

  // Apply filter to show/hide the new task
  renderFilter();

  // Clear the textbox and explicitly restart readInput
  // (using 'readInput' op instead of 'focus' because the widget stays focused
  //  between submissions, so inputOnFocus would not re-fire on a plain focus call)
  send({ op: 'setText',   id: 'input1', text: '' });
  send({ op: 'readInput', id: 'input1' });
  send({ op: 'commit' });
}

// ── Build the initial UI ──

// 1. Main container box
send({ op: 'create', id: 'n1', type: 'box', props: {
  border: { type: 'line' },
  label:  ' Todo App ',
  style:  { border: { fg: 'cyan' } },
}});
send({ op: 'appendChild', parentId: 'root', childId: 'n1' });
send({ op: 'layout', id: 'n1', x: 2, y: 1, w: 44, h: boxHeight() });

// 2. Title
send({ op: 'create', id: 'n2', type: 'text', props: {
  content: '📋 My Todos',
  style:   { fg: 'yellow', bold: true },
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'n2' });
send({ op: 'layout', id: 'n2', x: 1, y: 1, w: 38, h: 1 });

// 3. Pre-loaded todo items (clickable boxes so users can toggle done)
tasks.forEach((task, i) => {
  send({ op: 'create', id: task.id, type: 'box', props: {
    content:   (task.done ? '[✓] ' : '[ ] ') + task.text,
    style:     { fg: task.done ? 'green' : 'white' },
    mouse:     true,
    clickable: true,
  }});
  send({ op: 'appendChild', parentId: 'n1', childId: task.id });
  send({ op: 'layout', id: task.id, x: 1, y: 3 + i, w: 38, h: 1 });
});

// 4. Separator between list and controls
send({ op: 'create', id: 'nsep', type: 'text', props: {
  content: '─────────────────────────────────────',
  style:   { fg: 'cyan' },
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'nsep' });
send({ op: 'layout', id: 'nsep', x: 1, y: separatorY(), w: 38, h: 1 });

// 5. Filter buttons  [All]  [Active]  [Done]
send({ op: 'create', id: 'fAll', type: 'box', props: {
  content:   ' All ',
  style:     { fg: 'black', bg: 'cyan' },  // highlighted by default
  mouse:     true,
  clickable: true,
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'fAll' });
send({ op: 'layout', id: 'fAll', x: 1, y: filterY(), w: 7, h: 1 });

send({ op: 'create', id: 'fActive', type: 'box', props: {
  content:   ' Active ',
  style:     { fg: 'cyan' },
  mouse:     true,
  clickable: true,
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'fActive' });
send({ op: 'layout', id: 'fActive', x: 9, y: filterY(), w: 9, h: 1 });

send({ op: 'create', id: 'fDone', type: 'box', props: {
  content:   ' Done ',
  style:     { fg: 'cyan' },
  mouse:     true,
  clickable: true,
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'fDone' });
send({ op: 'layout', id: 'fDone', x: 19, y: filterY(), w: 7, h: 1 });

// 6. Input prompt label
send({ op: 'create', id: 'nlabel', type: 'text', props: {
  content: 'Add task (type & press Enter):',
  style:   { fg: 'cyan' },
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'nlabel' });
send({ op: 'layout', id: 'nlabel', x: 1, y: labelY(), w: 38, h: 1 });

// 7. Textbox for user input
send({ op: 'create', id: 'input1', type: 'textbox', props: {
  style:        { fg: 'white', bg: 'blue' },
  inputOnFocus: true,
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'input1' });
send({ op: 'layout', id: 'input1', x: 1, y: inputY(), w: 38, h: 1 });

// Commit initial render, then focus the input
send({ op: 'commit' });
setTimeout(() => {
  send({ op: 'focus',     id: 'input1' });
  send({ op: 'commit' });
}, 100);
