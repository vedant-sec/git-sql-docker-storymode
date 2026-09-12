import {
  GitCommit,
  GitCommandResult,
  GitHead,
  GitState
} from '../../types/git';

function generateShortHash(): string {
  return Math.random().toString(16).substring(2, 9);
}

export class GitEngine {
  private state: GitState;

  constructor(initialState?: Partial<GitState>) {
    this.state = {
      initialized: false,
      commits: {},
      branches: {},
      HEAD: { type: 'branch', ref: 'main' },
      staging: {},
      workingDirectory: {},
      isMerging: false,
      conflictedFiles: [],
      ...initialState
    };
  }

  getState(): GitState {
    return { ...this.state };
  }

  setState(newState: GitState): void {
    this.state = { ...newState };
  }

  getWorkingFile(path: string): string | undefined {
    return this.state.workingDirectory[path];
  }

  setWorkingFile(path: string, content: string): void {
    this.state.workingDirectory = {
      ...this.state.workingDirectory,
      [path]: content
    };
  }

  deleteWorkingFile(path: string): void {
    const updated = { ...this.state.workingDirectory };
    delete updated[path];
    this.state.workingDirectory = updated;
  }

  private getCurrentCommit(): GitCommit | null {
    const { HEAD, branches, commits } = this.state;
    const commitHash = HEAD.type === 'branch' ? branches[HEAD.ref] : HEAD.ref;
    return commitHash ? commits[commitHash] || null : null;
  }

  execute(commandLine: string): GitCommandResult {
    const raw = commandLine.trim();
    if (!raw.startsWith('git')) {
      return {
        output: `Command '${raw.split(' ')[0]}' not recognized. Use 'git <command>'`,
        error: true,
        state: this.getState()
      };
    }

    const tokens = this.tokenize(raw.slice(3).trim());
    if (tokens.length === 0) {
      return {
        output: 'usage: git [--version] [--help] [-C <path>] [-c <name>=<value>]\n           <command> [<args>]',
        error: false,
        state: this.getState()
      };
    }

    const subCommand = tokens[0];
    const args = tokens.slice(1);

    switch (subCommand) {
      case 'init':
        return this.handleInit(args);
      case 'status':
        return this.handleStatus(args);
      case 'add':
        return this.handleAdd(args);
      case 'commit':
        return this.handleCommit(args);
      case 'branch':
        return this.handleBranch(args);
      case 'checkout':
        return this.handleCheckout(args);
      case 'switch':
        return this.handleCheckout(args);
      case 'merge':
        return this.handleMerge(args);
      case 'log':
        return this.handleLog(args);
      case 'diff':
        return this.handleDiff(args);
      default:
        return {
          output: `git: '${subCommand}' is not a git command. See 'git --help'.\nAvailable commands: init, status, add, commit, branch, checkout, merge, log, diff`,
          error: true,
          state: this.getState()
        };
    }
  }

  private tokenize(cmdStr: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (let i = 0; i < cmdStr.length; i++) {
      const char = cmdStr[i];
      if ((char === '"' || char === "'") && (!inQuotes || quoteChar === char)) {
        inQuotes = !inQuotes;
        quoteChar = inQuotes ? char : '';
      } else if (char === ' ' && !inQuotes) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    if (current.length > 0) {
      tokens.push(current);
    }
    return tokens;
  }

  private handleInit(_args: string[]): GitCommandResult {
    const wasInit = this.state.initialized;
    this.state.initialized = true;
    if (!this.state.HEAD.ref) {
      this.state.HEAD = { type: 'branch', ref: 'main' };
    }
    return {
      output: wasInit
        ? 'Reinitialized existing Git repository in /home/forensics/investigation-repo/.git/'
        : 'Initialized empty Git repository in /home/forensics/investigation-repo/.git/',
      error: false,
      state: this.getState()
    };
  }

  private handleStatus(_args: string[]): GitCommandResult {
    if (!this.state.initialized) {
      return {
        output: 'fatal: not a git repository (or any of the parent directories): .git',
        error: true,
        state: this.getState()
      };
    }

    const lines: string[] = [];
    const currentBranch = this.state.HEAD.type === 'branch' ? this.state.HEAD.ref : `HEAD detached at ${this.state.HEAD.ref}`;
    lines.push(`On branch ${currentBranch}`);

    if (this.state.isMerging) {
      lines.push('You have unmerged paths.');
      lines.push('  (fix conflicts and run "git commit")');
      lines.push('  (use "git merge --abort" to abort the merge)\n');
    }

    const currentCommit = this.getCurrentCommit();
    const headFiles = currentCommit ? currentCommit.files : {};
    const stagedFiles = this.state.staging;
    const workFiles = this.state.workingDirectory;

    // Staged files
    const stagedChanges: { path: string; status: 'new' | 'modified' | 'deleted' }[] = [];
    for (const [path, content] of Object.entries(stagedFiles)) {
      if (!(path in headFiles)) {
        stagedChanges.push({ path, status: 'new' });
      } else if (headFiles[path] !== content) {
        stagedChanges.push({ path, status: 'modified' });
      }
    }
    for (const path of Object.keys(headFiles)) {
      if (!(path in stagedFiles)) {
        stagedChanges.push({ path, status: 'deleted' });
      }
    }

    if (stagedChanges.length > 0) {
      lines.push('Changes to be committed:');
      lines.push('  (use "git restore --staged <file>..." to unstage)');
      for (const item of stagedChanges) {
        const desc = item.status === 'new' ? 'new file:' : item.status === 'modified' ? 'modified:' : 'deleted:';
        lines.push(`\t\x1b[32m${desc.padEnd(12)} ${item.path}\x1b[0m`);
      }
      lines.push('');
    }

    // Unstaged conflicts & changes
    if (this.state.conflictedFiles.length > 0) {
      lines.push('Unmerged paths:');
      lines.push('  (use "git add <file>..." to mark resolution)');
      for (const file of this.state.conflictedFiles) {
        lines.push(`\t\x1b[31mboth modified:   ${file}\x1b[0m`);
      }
      lines.push('');
    }

    const unstagedChanges: { path: string; status: 'modified' | 'deleted' }[] = [];
    for (const [path, content] of Object.entries(workFiles)) {
      if (path in stagedFiles && stagedFiles[path] !== content && !this.state.conflictedFiles.includes(path)) {
        unstagedChanges.push({ path, status: 'modified' });
      }
    }
    for (const path of Object.keys(stagedFiles)) {
      if (!(path in workFiles)) {
        unstagedChanges.push({ path, status: 'deleted' });
      }
    }

    if (unstagedChanges.length > 0) {
      lines.push('Changes not staged for commit:');
      lines.push('  (use "git add <file>..." to update what will be committed)');
      for (const item of unstagedChanges) {
        lines.push(`\t\x1b[31m${item.status}:   ${item.path}\x1b[0m`);
      }
      lines.push('');
    }

    // Untracked files
    const untracked: string[] = [];
    for (const path of Object.keys(workFiles)) {
      if (!(path in stagedFiles) && !(path in headFiles)) {
        untracked.push(path);
      }
    }

    if (untracked.length > 0) {
      lines.push('Untracked files:');
      lines.push('  (use "git add <file>..." to include in what will be committed)');
      for (const file of untracked) {
        lines.push(`\t\x1b[31m${file}\x1b[0m`);
      }
      lines.push('');
    }

    if (stagedChanges.length === 0 && unstagedChanges.length === 0 && untracked.length === 0 && this.state.conflictedFiles.length === 0) {
      lines.push('nothing to commit, working tree clean');
    }

    return {
      output: lines.join('\n'),
      error: false,
      state: this.getState()
    };
  }

  private handleAdd(args: string[]): GitCommandResult {
    if (!this.state.initialized) {
      return { output: 'fatal: not a git repository', error: true, state: this.getState() };
    }
    if (args.length === 0) {
      return { output: 'Nothing specified, nothing added.\nMaybe you wanted to say "git add ."?', error: false, state: this.getState() };
    }

    const target = args[0];
    if (target === '.' || target === '-A') {
      // Stage all working directory files
      this.state.staging = { ...this.state.workingDirectory };
      // Check if conflicted files still have conflict markers
      this.checkAndResolveConflicts(Object.keys(this.state.workingDirectory));
    } else {
      for (const file of args) {
        if (!(file in this.state.workingDirectory)) {
          return {
            output: `fatal: pathspec '${file}' did not match any files`,
            error: true,
            state: this.getState()
          };
        }
        this.state.staging[file] = this.state.workingDirectory[file];
        this.checkAndResolveConflicts([file]);
      }
    }

    return {
      output: '',
      error: false,
      state: this.getState()
    };
  }

  private checkAndResolveConflicts(files: string[]): void {
    for (const file of files) {
      const content = this.state.workingDirectory[file] || '';
      // If user removed conflict markers <<<<<<<, =======, >>>>>>>
      if (!content.includes('<<<<<<<') && !content.includes('>>>>>>>')) {
        this.state.conflictedFiles = this.state.conflictedFiles.filter(f => f !== file);
      }
    }
  }

  private handleCommit(args: string[]): GitCommandResult {
    if (!this.state.initialized) {
      return { output: 'fatal: not a git repository', error: true, state: this.getState() };
    }

    let message = '';
    const mIdx = args.indexOf('-m');
    if (mIdx !== -1 && args[mIdx + 1]) {
      message = args[mIdx + 1];
    } else {
      return {
        output: 'error: switch `m` requires a value\nUsage: git commit -m "<message>"',
        error: true,
        state: this.getState()
      };
    }

    if (this.state.isMerging && this.state.conflictedFiles.length > 0) {
      return {
        output: `error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.`,
        error: true,
        state: this.getState()
      };
    }

    const currentCommit = this.getCurrentCommit();
    const headFiles = currentCommit ? currentCommit.files : {};
    const stagedFiles = this.state.staging;

    // Check if any staged changes
    let hasChanges = Object.keys(stagedFiles).length !== Object.keys(headFiles).length;
    if (!hasChanges) {
      for (const [path, content] of Object.entries(stagedFiles)) {
        if (headFiles[path] !== content) {
          hasChanges = true;
          break;
        }
      }
    }

    if (!hasChanges && !this.state.isMerging) {
      return {
        output: 'On branch ' + (this.state.HEAD.type === 'branch' ? this.state.HEAD.ref : 'detached') + '\nnothing to commit, working tree clean',
        error: false,
        state: this.getState()
      };
    }

    const hash = generateShortHash();
    const parents: string[] = [];
    if (currentCommit) {
      parents.push(currentCommit.hash);
    }
    if (this.state.isMerging && this.state.mergeTargetBranch) {
      const targetHash = this.state.branches[this.state.mergeTargetBranch];
      if (targetHash && !parents.includes(targetHash)) {
        parents.push(targetHash);
      }
    }

    const newCommit: GitCommit = {
      hash,
      message,
      author: 'Forensics Operative <cipher@nexus-forensics.internal>',
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      parents,
      files: { ...stagedFiles }
    };

    this.state.commits[hash] = newCommit;

    if (this.state.HEAD.type === 'branch') {
      this.state.branches[this.state.HEAD.ref] = hash;
    } else {
      this.state.HEAD.ref = hash;
    }

    const wasMerge = this.state.isMerging;
    this.state.isMerging = false;
    this.state.mergeTargetBranch = undefined;
    this.state.conflictedFiles = [];

    const changedCount = Object.keys(stagedFiles).length;
    return {
      output: `[${this.state.HEAD.type === 'branch' ? this.state.HEAD.ref : 'detached HEAD'} ${hash}] ${message}\n ${changedCount} file${changedCount === 1 ? '' : 's'} committed${wasMerge ? ' (Merge commit)' : ''}`,
      error: false,
      state: this.getState()
    };
  }

  private handleBranch(args: string[]): GitCommandResult {
    if (!this.state.initialized) {
      return { output: 'fatal: not a git repository', error: true, state: this.getState() };
    }

    if (args.length === 0 || args[0] === '-a' || args[0] === '--list') {
      const branchNames = Object.keys(this.state.branches);
      if (branchNames.length === 0) {
        return { output: '', error: false, state: this.getState() };
      }
      const out = branchNames.map(b => {
        const isCurrent = this.state.HEAD.type === 'branch' && this.state.HEAD.ref === b;
        return isCurrent ? `\x1b[32m* ${b}\x1b[0m` : `  ${b}`;
      }).join('\n');
      return { output: out, error: false, state: this.getState() };
    }

    const branchName = args[0];
    const currentCommit = this.getCurrentCommit();
    if (!currentCommit) {
      return { output: 'fatal: Not a valid object name: \'main\'.', error: true, state: this.getState() };
    }

    if (this.state.branches[branchName]) {
      return { output: `fatal: A branch named '${branchName}' already exists.`, error: true, state: this.getState() };
    }

    this.state.branches[branchName] = currentCommit.hash;
    return { output: '', error: false, state: this.getState() };
  }

  private handleCheckout(args: string[]): GitCommandResult {
    if (!this.state.initialized) {
      return { output: 'fatal: not a git repository', error: true, state: this.getState() };
    }

    if (args.length === 0) {
      return { output: 'fatal: missing branch or commit argument', error: true, state: this.getState() };
    }

    if (args[0] === '-b') {
      const newBranch = args[1];
      if (!newBranch) {
        return { output: 'fatal: missing branch name after -b', error: true, state: this.getState() };
      }
      const currentCommit = this.getCurrentCommit();
      if (!currentCommit) {
        return { output: 'fatal: cannot create branch from unborn HEAD', error: true, state: this.getState() };
      }
      this.state.branches[newBranch] = currentCommit.hash;
      this.state.HEAD = { type: 'branch', ref: newBranch };
      return {
        output: `Switched to a new branch '${newBranch}'`,
        error: false,
        state: this.getState()
      };
    }

    const target = args[0];
    if (this.state.branches[target]) {
      this.state.HEAD = { type: 'branch', ref: target };
      const commit = this.state.commits[this.state.branches[target]];
      if (commit) {
        this.state.workingDirectory = { ...commit.files };
        this.state.staging = { ...commit.files };
      }
      return {
        output: `Switched to branch '${target}'`,
        error: false,
        state: this.getState()
      };
    }

    if (this.state.commits[target]) {
      this.state.HEAD = { type: 'detached', ref: target };
      const commit = this.state.commits[target];
      this.state.workingDirectory = { ...commit.files };
      this.state.staging = { ...commit.files };
      return {
        output: `Note: switching to '${target}'.\nYou are in 'detached HEAD' state.`,
        error: false,
        state: this.getState()
      };
    }

    return {
      output: `error: pathspec '${target}' did not match any file(s) known to git`,
      error: true,
      state: this.getState()
    };
  }

  private handleMerge(args: string[]): GitCommandResult {
    if (!this.state.initialized) {
      return { output: 'fatal: not a git repository', error: true, state: this.getState() };
    }
    if (args.length === 0) {
      return { output: 'fatal: No remote for the current branch.', error: true, state: this.getState() };
    }

    const targetBranch = args[0];
    const targetHash = this.state.branches[targetBranch];
    if (!targetHash) {
      return { output: `merge: ${targetBranch} - not something we can merge`, error: true, state: this.getState() };
    }

    const currentCommit = this.getCurrentCommit();
    if (!currentCommit) {
      return { output: 'fatal: Current branch has no commits.', error: true, state: this.getState() };
    }

    if (currentCommit.hash === targetHash) {
      return { output: 'Already up to date.', error: false, state: this.getState() };
    }

    const targetCommit = this.state.commits[targetHash];
    if (!targetCommit) {
      return { output: `fatal: commit ${targetHash} not found`, error: true, state: this.getState() };
    }

    // Check for merge conflicts across files
    const conflicted: string[] = [];
    const mergedFiles = { ...currentCommit.files };

    for (const [path, targetContent] of Object.entries(targetCommit.files)) {
      if (path in currentCommit.files) {
        if (currentCommit.files[path] !== targetContent) {
          conflicted.push(path);
          // Inject conflict markers into working copy!
          mergedFiles[path] = `<<<<<<< HEAD\n${currentCommit.files[path]}\n=======\n${targetContent}\n>>>>>>> ${targetBranch}`;
        }
      } else {
        mergedFiles[path] = targetContent;
      }
    }

    if (conflicted.length > 0) {
      this.state.isMerging = true;
      this.state.mergeTargetBranch = targetBranch;
      this.state.conflictedFiles = conflicted;
      this.state.workingDirectory = { ...this.state.workingDirectory, ...mergedFiles };

      const out = [
        `Auto-merging ${conflicted.join(', ')}`,
        `CONFLICT (content): Merge conflict in ${conflicted.join(', ')}`,
        `Automatic merge failed; fix conflicts and then commit the result.`
      ].join('\n');

      return {
        output: out,
        error: true,
        state: this.getState()
      };
    }

    // Clean merge: fast-forward or new commit
    this.state.workingDirectory = { ...mergedFiles };
    this.state.staging = { ...mergedFiles };
    return this.handleCommit(['-m', `Merge branch '${targetBranch}'`]);
  }

  private handleLog(_args: string[]): GitCommandResult {
    if (!this.state.initialized) {
      return { output: 'fatal: not a git repository', error: true, state: this.getState() };
    }

    const currentCommit = this.getCurrentCommit();
    if (!currentCommit) {
      return { output: 'fatal: your current branch does not have any commits yet', error: true, state: this.getState() };
    }

    const visited = new Set<string>();
    const queue = [currentCommit.hash];
    const logEntries: string[] = [];

    while (queue.length > 0) {
      const hash = queue.shift()!;
      if (visited.has(hash)) continue;
      visited.add(hash);

      const commit = this.state.commits[hash];
      if (!commit) continue;

      // Find branches pointing here
      const branchPointers: string[] = [];
      for (const [bName, bHash] of Object.entries(this.state.branches)) {
        if (bHash === hash) {
          if (this.state.HEAD.type === 'branch' && this.state.HEAD.ref === bName) {
            branchPointers.push(`\x1b[36mHEAD -> \x1b[32m${bName}\x1b[0m`);
          } else {
            branchPointers.push(`\x1b[32m${bName}\x1b[0m`);
          }
        }
      }

      const deco = branchPointers.length > 0 ? ` (${branchPointers.join(', ')})` : '';

      logEntries.push(
        `\x1b[33mcommit ${commit.hash}\x1b[0m${deco}\n` +
        `Author: ${commit.author}\n` +
        `Date:   ${commit.date}\n\n` +
        `    ${commit.message}\n`
      );

      for (const parent of commit.parents) {
        if (!visited.has(parent)) {
          queue.push(parent);
        }
      }
    }

    return {
      output: logEntries.join('\n'),
      error: false,
      state: this.getState()
    };
  }

  private handleDiff(_args: string[]): GitCommandResult {
    if (!this.state.initialized) {
      return { output: 'fatal: not a git repository', error: true, state: this.getState() };
    }

    const diffs: string[] = [];
    for (const [path, workContent] of Object.entries(this.state.workingDirectory)) {
      const stagedContent = this.state.staging[path] ?? '';
      if (workContent !== stagedContent) {
        diffs.push(`diff --git a/${path} b/${path}`);
        diffs.push(`--- a/${path}`);
        diffs.push(`+++ b/${path}`);
        diffs.push(`@@ -1 +1 @@`);
        for (const line of stagedContent.split('\n')) {
          if (line) diffs.push(`\x1b[31m-${line}\x1b[0m`);
        }
        for (const line of workContent.split('\n')) {
          if (line) diffs.push(`\x1b[32m+${line}\x1b[0m`);
        }
      }
    }

    return {
      output: diffs.length > 0 ? diffs.join('\n') : '',
      error: false,
      state: this.getState()
    };
  }
}
