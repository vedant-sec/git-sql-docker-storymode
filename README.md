# ROOT ACCESS // Operation Broken Cipher

A story-driven interactive learning game that teaches **SQL**, **Git**, and **Docker** through a cybersecurity forensic investigation narrative.

> **DEMO / Prototype Vertical Slice**: Playable in the browser with real in-memory SQLite (compiled to WebAssembly via `sql.js`) and high-fidelity Git and Docker state machine simulations.

---

## ⚡ Tech Stack & Architecture

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **SQL Engine:** `sql.js` (SQLite WebAssembly). Executes **REAL** SQL queries directly in the client browser. No regex string-matching—query result sets are evaluated directly.
- **Git Engine:** Pure in-memory state machine modeling commits, branches, HEAD, staging area, working directory virtual tree, log visualization, and 3-way merge conflict resolution with standard markers (`<<<<<<< HEAD`, `=======`, `>>>>>>>`).
- **Docker Engine:** In-memory daemon state machine parsing Dockerfile instructions (`FROM`, `RUN`, `COPY`, `WORKDIR`, `EXPOSE`, `CMD`), simulating layer caching (`CACHED` / `---> Using cache`), container lifecycles (`run`, `ps`, `stop`, `rm`, `exec`, `logs`), and realistic errors (port collisions, deleting running containers without `-f`).
- **Persistence:** LocalStorage save-state manager.

### Directory Structure

```
src/
├── types/                 # TypeScript interfaces (Game, SQL, Git, Docker)
│   ├── game.ts            # PuzzleDefinition, ChapterDefinition, Clue, Hint
│   ├── sql.ts             # QueryResult, TableSchema
│   ├── git.ts             # GitCommit, GitState, GitConflict
│   └── docker.ts          # DockerImage, DockerContainer, DockerDaemonState
├── engine/                # Core Simulation Engines (completely decoupled from UI)
│   ├── sql/
│   │   ├── sqlEngine.ts   # WebAssembly SQLite runner & schema extractor
│   │   └── seedData.ts    # Forensic database schema & records
│   ├── git/
│   │   └── gitEngine.ts   # Git state machine, command parser, conflict injector
│   └── docker/
│       └── dockerEngine.ts# Docker daemon, build layer cache, container manager
├── data/                  # Content & Narrative (Data-Driven)
│   ├── storyline.ts       # Characters, incident synopsis, metadata
│   ├── hintService.ts     # 3-tier progressive hint engine & AI Provider hook
│   └── chapters/
│       ├── chapter1_sql.ts    # Chapter 1 Puzzles (SELECT, GROUP BY, JOIN, Subquery)
│       ├── chapter2_git.ts    # Chapter 2 Puzzles (Init, Branching, Merge Conflicts)
│       ├── chapter3_docker.ts # Chapter 3 Puzzles (Port collision, Build cache, Exec)
│       └── index.ts           # Chapter registry
├── state/                 # State management & LocalStorage persistence
│   └── useGameStore.ts
├── components/            # UI Components
│   ├── layout/Header.tsx
│   ├── story/StoryPanel.tsx
│   ├── story/ClueDrawer.tsx
│   ├── story/HintDrawer.tsx
│   ├── story/SchemaModal.tsx
│   ├── terminal/Terminal.tsx
│   ├── terminal/TableOutput.tsx
│   └── editor/FileEditorModal.tsx
└── test/
    └── verifyEngines.ts   # Automated integration test suite
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Engine & Puzzle Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🎮 Playable Chapters Walkthrough

### Chapter 1: The Audit Trail (SQL)
- **Engine:** `sql.js` (WebAssembly SQLite)
- **Database Tables:** `employees`, `access_logs`, `transactions`
- **Puzzles:**
  1. **Evidence 1.1 (SELECT & WHERE):** Query `access_logs` for failed logins (`status = 'FAILED'`) to isolate the external attacker IP (`198.51.100.77`).
  2. **Evidence 1.2 (Aggregates & GROUP BY):** Aggregate `transactions` by `recipient_account` with `HAVING SUM(amount) >= 1000000` to spot the mule account (`ACCT-SHADOW-X9`, $2.5M).
  3. **Evidence 1.3 (INNER JOIN):** Join `employees` with `access_logs` where `ip_address = '198.51.100.77'` to unmask insider Marcus Vance (Lead Cloud Architect).
  4. **Evidence 1.4 (Subqueries):** Use a subquery to uncover the offshore recipient (`ACCT-OFFSHORE-707`, $1.2M) funded by flagged treasury accounts.

### Chapter 2: The Tampered Codebase (Git)
- **Engine:** In-memory Git state machine
- **Puzzles:**
  1. **Evidence 2.1 (Init, Status, Add, Commit):** Re-initialize Vance's wiped repo, stage `forensic_tracer.sh` and `config.env`, and commit the baseline.
  2. **Evidence 2.2 (Branching & Checkout):** Inspect recovered branches with `git branch` and switch to `forensics/recovered-payload` with `git checkout`.
  3. **Evidence 2.3 (Merge Conflict Resolution):** Switch back to `main` and run `git merge forensics/recovered-payload`. Resolve the merge conflict markers in `config.env` using the built-in Virtual File Editor, stage with `git add config.env`, and commit to finalize the merge.

### Chapter 3: The Ghost Container (Docker)
- **Engine:** In-memory Docker daemon & layer cache
- **Puzzles:**
  1. **Evidence 3.1 (Inspect & Stop/RM):** Inspect running containers with `docker ps`. Attempting `docker rm rogue-proxy` reproduces the real Docker daemon error (`You cannot remove a running container...`). Stop and remove the container to free port 8080.
  2. **Evidence 3.2 (Dockerfile Build & Layer Cache):** Build `Dockerfile` into `honeypot:v1` with `docker build -t honeypot:v1 .`. Re-running the build demonstrates layer caching (`---> Using cache`).
  3. **Evidence 3.3 (Run, Port Mapping, Exec):** Start the honeypot on port 8080 with `-d -p 8080:8080 -e TRACE_MODE=verbose --name honeypot-service honeypot:v1`. Run `docker exec honeypot-service cat /app/exfil_destination.txt` to capture the final decrypted C2 payload!

---

## 🛠️ How to Add a New Puzzle Without Touching Engine Code

All puzzles and chapters are completely **data-driven**. You never need to touch `src/engine/` or `src/components/` to add new content.

### Step 1: Open the Target Chapter File
Navigate to `src/data/chapters/`:
- For SQL puzzles: `src/data/chapters/chapter1_sql.ts`
- For Git puzzles: `src/data/chapters/chapter2_git.ts`
- For Docker puzzles: `src/data/chapters/chapter3_docker.ts`

### Step 2: Append a New Puzzle Object
Each puzzle satisfies the `PuzzleDefinition` interface:

```typescript
import { PuzzleDefinition, PuzzleValidationResult } from '../../types/game';
import { SqlValidationContext } from '../../types/sql';

export const myNewSqlPuzzle: PuzzleDefinition = {
  id: 'sql-5',
  title: 'Evidence 1.5: High Clearance Audit',
  description: 'Identify all personnel with clearance level 5 in the Executive or Finance departments.',
  objective: "Run a SELECT query on `employees` filtering for `clearance_level = 5` and `department IN ('Executive', 'Finance')`.",
  tool: 'sql',
  starterCode: "SELECT * FROM employees WHERE clearance_level = 5;",
  hints: [
    {
      tier: 1,
      label: 'Narrative Nudge',
      content: 'Filter the employees table for clearance level 5 and specific departments.'
    },
    {
      tier: 2,
      label: 'Technical Hint',
      content: "Use `SELECT name, role, department FROM employees WHERE clearance_level = 5 AND department IN ('Executive', 'Finance');`"
    },
    {
      tier: 3,
      label: 'Direct Solution',
      content: "SELECT * FROM employees WHERE clearance_level = 5 AND (department = 'Executive' OR department = 'Finance');"
    }
  ],
  clueReward: {
    id: 'clue-exec-clearance',
    title: 'High Clearance Roster',
    description: 'Sophia Lin and Arthur Pendelton hold Level 5 authorization keys.',
    category: 'Identity Forensics'
  },
  validate: (ctx: SqlValidationContext): PuzzleValidationResult => {
    const { result } = ctx;
    if (result.error || result.values.length === 0) {
      return { isCorrect: false, feedback: result.error || 'Query returned no rows.' };
    }

    // Evaluate result set
    const names = result.values.flatMap(row => row.map(String));
    const hasSophia = names.some(n => n.includes('Sophia Lin'));
    const hasArthur = names.some(n => n.includes('Arthur Pendelton'));
    const hasMarcus = names.some(n => n.includes('Marcus Vance'));

    if (hasSophia && hasArthur && !hasMarcus) {
      return {
        isCorrect: true,
        message: 'Level 5 clearance roster verified!'
      };
    }

    return {
      isCorrect: false,
      feedback: 'Ensure query only returns employees with clearance_level = 5 in Executive or Finance.'
    };
  }
};
```

### Step 3: Add to Chapter Definition
Add `myNewSqlPuzzle` to the `puzzles` array:
```typescript
export const chapter1Sql: ChapterDefinition = {
  // ...
  puzzles: [
    // ... existing puzzles
    myNewSqlPuzzle
  ]
};
```

That's it! The game will automatically render the new objective, track progress, award the clue, and validate the player's query.

---

## 🤖 Future AI Hint Integration Hook

The game includes a hook in `src/data/hintService.ts` for integrating LLM-based interactive guidance without rewriting game mechanics.

To connect an AI provider:
```typescript
import { hintService, AIHintProvider } from './src/data/hintService';

class GeminiCopilotProvider implements AIHintProvider {
  isAvailable() {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  async generateDynamicHint({ puzzle, playerInput, lastError, unlockedTier }) {
    // Call Gemini API / LLM backend
    const response = await fetch('/api/gemini/hint', {
      method: 'POST',
      body: JSON.stringify({
        puzzleObjective: puzzle.objective,
        attempt: playerInput,
        error: lastError,
        tier: unlockedTier
      })
    });
    const data = await response.json();
    return data.hintText;
  }
}

// Register the provider
hintService.registerAIProvider(new GeminiCopilotProvider());
```

---

## 📄 License
MIT
