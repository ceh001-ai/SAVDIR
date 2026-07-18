import { Note } from '../types';

export const initialNotes: Note[] = [
  {
    id: '1',
    title: 'SQL Window Functions Explained',
    category: 'Databases',
    details: `Window functions perform calculations across a set of table rows that are somehow related to the current row. Unlike regular aggregate functions, window functions do not group rows into a single output row. Instead, the rows retain their individual identities.

### Core Syntax
\`\`\`sql
SELECT val, 
       SUM(val) OVER (PARTITION BY cat ORDER BY date) 
FROM sales;
\`\`\`

### Key Functions
* **ROW_NUMBER()**: Unique continuous index for each partition row, starting from 1.
* **RANK()**: Numeric rank, leaving gaps for duplicate tie values.
* **DENSE_RANK()**: Numeric rank, no gaps for ties.
* **LAG() / LEAD()**: Access preceding or succeeding row values directly without self-joins.`,
    tags: ['SQL', 'Databases', 'Query Optimization'],
    createdAt: '2026-07-08T10:30:00.000Z',
    updatedAt: '2026-07-08T10:30:00.000Z'
  },
  {
    id: '2',
    title: 'Python Decorators Under the Hood',
    category: 'Python',
    details: `A decorator in Python is a design pattern that allows a user to add new functionality to an existing object without modifying its structure. Decorators are usually called before the definition of a function you want to decorate.

### Implementation
\`\`\`python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print("Something is happening before the function is called.")
        result = func(*args, **kwargs)
        print("Something is happening after the function is called.")
        return result
    return wrapper

@my_decorator
def say_hello():
    print("Hello!")
\`\`\`

By using \`@my_decorator\`, we wrap \`say_hello\` inside \`wrapper\` dynamically. This is highly useful for logging, execution timing, authentication gates, and route declarations.`,
    tags: ['Python', 'Backend', 'Programming Patterns'],
    createdAt: '2026-07-09T14:15:00.000Z',
    updatedAt: '2026-07-09T14:15:00.000Z'
  },
  {
    id: '3',
    title: 'Mastering React 19 UseEffect Dependencies',
    category: 'JavaScript',
    details: `React 19 continues to leverage functional component lifecycles. However, writing robust hooks requires careful configuration of dependencies to prevent infinite loops and memory leaks.

### Guidelines
1. **Stabilize Reference Values**: Avoid referencing inline-created objects or functions inside dependency arrays. Use \`useMemo\` or \`useCallback\`.
2. **Primitive Values**: Prefer passing primitive properties (e.g., \`id\`, \`status\`, \`flag\`) to avoid unnecessary re-renders.
3. **Clean-up Functions**: Always return clean-up functions to prevent active network socket leaks, active timers, or DOM window listeners.
4. **Avoid Sync States**: Do not use effects to synchronize component states; derive them directly from state/props whenever possible.`,
    tags: ['JavaScript', 'React', 'Frontend'],
    createdAt: '2026-07-10T09:00:00.000Z',
    updatedAt: '2026-07-10T09:00:00.000Z'
  },
  {
    id: '4',
    title: 'Database Indexing Strategies',
    category: 'Databases',
    details: `Database indexes are specialized data structures (typically B-Trees or Hash tables) that store references to table rows to speed up search lookups.

### Index Types
* **B-Tree Indexes**: Default index type. Excellent for range queries (\`>\`, \`<\`) and equality matches.
* **Hash Indexes**: Only suitable for exact equality (\`=\`) searches. Highly performant but no sorting capabilities.
* **Composite Indexes**: Multi-column indexing. Highly dependent on column order! The leading column must be included in queries to activate the index (Leftmost Prefix Rule).`,
    tags: ['Databases', 'SQL', 'Backend'],
    createdAt: '2026-07-10T11:45:00.000Z',
    updatedAt: '2026-07-10T11:45:00.000Z'
  },
  {
    id: '5',
    title: 'Asynchronous Event Loop in JavaScript',
    category: 'JavaScript',
    details: `The JavaScript runtime utilizes a single-threaded execution context with non-blocking concurrency via the Event Loop.

### Key Components
* **Call Stack**: Synchronous execution frames.
* **Microtask Queue**: Promises, mutation observers (executed immediately after current stack clears, before next rendering cycle).
* **Macrotask Queue**: \`setTimeout\`, \`setInterval\`, UI events, file and socket I/O.

Always understand that Microtasks have absolute priority over Macrotasks. If a microtask keeps spawning other microtasks, it can starve the render tree!`,
    tags: ['JavaScript', 'Frontend', 'Asynchronous Programming'],
    createdAt: '2026-07-10T13:30:00.000Z',
    updatedAt: '2026-07-10T13:30:00.000Z'
  }
];
