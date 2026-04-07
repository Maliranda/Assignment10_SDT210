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

// Listen for events from the terminal process via stdout
const rl = readline.createInterface({ input: host.stdout });
rl.on('line', (line) => {
  try {
    const event = JSON.parse(line);
    console.error('Event from terminal:', event);
    // In real renderer: dispatch to React event system
  } catch (e) {
    console.error('Event parse error:', e.message);
  }
});

host.on('close', (code) => {
  console.error('Terminal process exited with code', code);
  process.exit(0);
});

// ── Demo: send IPC messages to create a Todo App UI ──

// 1. Create the main container box
send({ op: 'create', id: 'n1', type: 'box', props: {
  border: { type: 'line' },
  label: ' Todo App ',
  style: { border: { fg: 'cyan' } }
}});
send({ op: 'appendChild', parentId: 'root', childId: 'n1' });

// 2. Create a title text
send({ op: 'create', id: 'n2', type: 'text', props: {
  content: '📋 My Todos',
  style: { fg: 'yellow', bold: true }
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'n2' });

// 3. Create todo items
send({ op: 'create', id: 'n3', type: 'text', props: {
  content: '[ ] Buy groceries',
  style: { fg: 'white' }
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'n3' });

send({ op: 'create', id: 'n4', type: 'text', props: {
  content: '[ ] Walk the dog',
  style: { fg: 'white' }
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'n4' });

send({ op: 'create', id: 'n5', type: 'text', props: {
  content: '[✓] Write homework',
  style: { fg: 'green' }
}});
send({ op: 'appendChild', parentId: 'n1', childId: 'n5' });

// 4. Apply Yoga-computed layout positions
send({ op: 'layout', id: 'n1', x: 2,  y: 1,  w: 40, h: 12 });
send({ op: 'layout', id: 'n2', x: 1,  y: 1,  w: 38, h: 1  });
send({ op: 'layout', id: 'n3', x: 1,  y: 3,  w: 38, h: 1  });
send({ op: 'layout', id: 'n4', x: 1,  y: 4,  w: 38, h: 1  });
send({ op: 'layout', id: 'n5', x: 1,  y: 5,  w: 38, h: 1  });

// 5. Commit — triggers screen.render()
send({ op: 'commit' });

// ── Simulate a React state update after 2 seconds ──
setTimeout(() => {
  send({ op: 'setText', id: 'n3', text: '[✓] Buy groceries' });
  send({ op: 'update', id: 'n3', props: { style: { fg: 'green' } } });
  send({ op: 'commit' });
}, 2000);

// ── Simulate adding a new todo after 4 seconds ──
setTimeout(() => {
  send({ op: 'create', id: 'n6', type: 'text', props: {
    content: '[ ] Read react-reconciler docs',
    style: { fg: 'white' }
  }});
  send({ op: 'appendChild', parentId: 'n1', childId: 'n6' });
  send({ op: 'layout', id: 'n6', x: 1, y: 6, w: 38, h: 1 });
  send({ op: 'commit' });
}, 4000);