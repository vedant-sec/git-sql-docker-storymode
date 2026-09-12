export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  parents: string[];
  files: Record<string, string>; // path -> content
}

export interface GitHead {
  type: 'branch' | 'detached';
  ref: string; // branch name or commit hash
}

export interface GitConflict {
  file: string;
  ours: string;
  theirs: string;
}

export interface GitState {
  initialized: boolean;
  commits: Record<string, GitCommit>; // hash -> commit
  branches: Record<string, string>; // branch name -> commit hash
  HEAD: GitHead;
  staging: Record<string, string>; // staged files: path -> content
  workingDirectory: Record<string, string>; // virtual files: path -> content
  isMerging: boolean;
  mergeTargetBranch?: string;
  conflictedFiles: string[];
}

export interface GitCommandResult {
  output: string;
  error?: boolean;
  state: GitState;
}

export interface GitValidationContext {
  command: string;
  args: string[];
  result: GitCommandResult;
  state: GitState;
}
