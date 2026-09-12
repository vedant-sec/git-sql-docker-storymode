import { ChapterDefinition, PuzzleValidationResult } from '../../types/game';
import { GitValidationContext } from '../../types/git';

export const chapter2Git: ChapterDefinition = {
  id: 'ch2',
  number: 2,
  title: 'Chapter 2: The Tampered Codebase',
  subtitle: 'Version Control Reconstruction with Git',
  tool: 'git',
  initialFiles: {
    'forensic_tracer.sh': `#!/bin/bash
# Forensics capture script left behind on workstation
echo "[*] Tracing exfiltration channel..."
curl -s "http://198.51.100.77/ping"
`,
    'config.env': `EXFIL_SERVER="http://internal-vault:9000"
ENCRYPTION_SALT="vance-salt-01"
`
  },
  storyIntro: [
    {
      speaker: 'Chief Elena Ramos',
      role: 'Chief Forensics Lead',
      text: 'We reached Marcus Vance’s workstation. His browser cache was scrubbed, but his local project repository has dangling files.',
      timestamp: '03:30:12'
    },
    {
      speaker: 'David Chen',
      role: 'SecOps Threat Analyst',
      text: 'He tried to `rm -rf .git`, but his staging drive was write-locked by our enterprise EDR before he could wipe everything. You will have to re-initialize the repository and piece the history back together.',
      timestamp: '03:30:45'
    }
  ],
  storyOutro: [
    {
      speaker: 'David Chen',
      role: 'SecOps Threat Analyst',
      text: 'Brilliant work resolving that merge conflict, Cipher! We now have the complete, untampered payload script and the actual remote C2 address.',
      timestamp: '03:52:10'
    },
    {
      speaker: 'Chief Elena Ramos',
      role: 'Chief Forensics Lead',
      text: 'Chen just spotted active network sockets on our internal staging server. Vance didn’t just write scripts—he deployed a rogue Docker container that is still running. Let\'s move to Chapter 3.',
      timestamp: '03:52:40'
    }
  ],
  puzzles: [
    {
      id: 'git-1',
      title: 'Evidence 2.1: Rebuilding the Repository',
      description:
        'Vance purged the local Git metadata. Initialize a new Git repository, inspect the working directory status, stage all files (`forensic_tracer.sh` and `config.env`), and commit the initial baseline.',
      objective:
        'Run `git init`, stage the untracked files with `git add .`, and commit them with `git commit -m "initial baseline"`.',
      tool: 'git',
      starterCode: 'git init && git add . && git commit -m "initial forensic baseline"',
      concept: {
        title: 'GIT INIT & COMMITS',
        description: "Git tracks version history across snapshots. 'git init' creates a repository, 'git add' stages changes, and 'git commit' records a permanent snapshot.",
        example: "git init\ngit add .\ngit commit -m \"baseline commit\"",
        keyPoints: [
          "'git init' creates the internal .git metadata directory",
          "'git add .' stages all current modified and untracked files",
          "'git commit -m' commits staged files with a descriptive log message"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'You need to initialize the git repo, add the untracked forensic files, and commit.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'Run `git init`, then `git add .` (or `git add config.env forensic_tracer.sh`), followed by `git commit -m "initial baseline"`.'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: 'git init\ngit add .\ngit commit -m "initial baseline"'
        }
      ],
      clueReward: {
        id: 'clue-git-init',
        title: 'Forensic Repo Initialized',
        description: 'Captured Vance\'s local workspace baseline: forensic_tracer.sh and config.env tracked in version control.',
        category: 'Codebase Forensics'
      },
      validate: (ctx: GitValidationContext): PuzzleValidationResult => {
        const { state } = ctx;
        if (!state.initialized) {
          return { isCorrect: false, feedback: 'Repository not yet initialized. Run `git init`.' };
        }
        const commitCount = Object.keys(state.commits).length;
        if (commitCount === 0) {
          return { isCorrect: false, feedback: 'No commits created yet. Stage files with `git add .` and run `git commit -m "<msg>"`.' };
        }
        const currentCommit = state.commits[state.branches[state.HEAD.ref]];
        if (!currentCommit || !currentCommit.files['config.env']) {
          return { isCorrect: false, feedback: 'Commit does not include config.env or forensic_tracer.sh. Make sure you staged with `git add .`.' };
        }

        return {
          isCorrect: true,
          message: 'Repository successfully initialized and forensic baseline committed!'
        };
      }
    },
    {
      id: 'git-2',
      title: 'Evidence 2.2: Recovered Branches',
      description:
        'SecOps recovered a damaged disk sector containing an alternate branch created by Vance: `forensics/recovered-payload`. Inspect your branches and switch to `forensics/recovered-payload` to examine his secret commits.',
      objective:
        'Use `git branch` to view existing branches, then `git checkout forensics/recovered-payload` (or `git switch`) to switch to it.',
      tool: 'git',
      starterCode: 'git checkout forensics/recovered-payload',
      concept: {
        title: 'GIT BRANCH & CHECKOUT',
        description: "Branches in Git represent divergent lines of development. 'git checkout <branch>' moves the HEAD pointer to another branch, updating the working directory.",
        example: "git branch\ngit checkout forensics/recovered-payload",
        keyPoints: [
          "'git branch' lists all available local branches",
          "'git checkout <branch>' switches HEAD to the selected branch",
          "Working tree files update immediately to reflect the branch"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'Check the list of branches with git branch, then switch to the forensics branch.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'Run `git checkout forensics/recovered-payload` to load the recovered branch.'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: 'git checkout forensics/recovered-payload'
        }
      ],
      clueReward: {
        id: 'clue-git-branch',
        title: 'Recovered Payload Branch',
        description: 'Vance modified config.env to point towards sftp://exfil.darknet-shadow.onion:9922 with SHADOW_KEY_9921_PROD.',
        category: 'Codebase Forensics'
      },
      validate: (ctx: GitValidationContext): PuzzleValidationResult => {
        const { state } = ctx;
        if (state.HEAD.type === 'branch' && state.HEAD.ref === 'forensics/recovered-payload') {
          return {
            isCorrect: true,
            message: 'Switched to recovered branch! Inspect `git log` or view `config.env` to see Vance\'s modifications.'
          };
        }

        return {
          isCorrect: false,
          feedback: 'You need to be on branch `forensics/recovered-payload`. Run `git checkout forensics/recovered-payload`.'
        };
      }
    },
    {
      id: 'git-3',
      title: 'Evidence 2.3: The Merge Conflict Resolution',
      description:
        'Switch back to `main` (`git checkout main`) and merge the changes with `git merge forensics/recovered-payload`. You will encounter a merge conflict in `config.env`. Open the Virtual File Editor, remove the conflict markers, keep the exfiltration endpoint `sftp://exfil.darknet-shadow.onion:9922`, stage `config.env`, and finalize the merge commit.',
      objective:
        'Checkout `main`, run `git merge forensics/recovered-payload`, resolve the conflict in `config.env`, `git add config.env`, and `git commit -m "resolved merge"`.',
      tool: 'git',
      starterCode: 'git checkout main && git merge forensics/recovered-payload',
      concept: {
        title: 'GIT MERGE & CONFLICT RESOLUTION',
        description: "Merging incorporates changes from a named branch into the current branch. When overlapping edits conflict, Git inserts markers (<<<<<<<, =======, >>>>>>>) that require manual resolution before committing.",
        example: "git checkout main\ngit merge branch_name\n# Resolve conflicts in editor\ngit add <resolved_file>\ngit commit -m \"Resolved merge\"",
        keyPoints: [
          "'git merge <branch>' combines history into the active branch",
          "Conflicted files highlight both versions between conflict markers",
          "After editing, stage with 'git add' and complete with 'git commit'"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'Return to main branch, run git merge, then use the File Editor button to clear the conflict markers from config.env.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'After running `git merge forensics/recovered-payload`, click "Open File Editor", edit `config.env` so that only `EXFIL_SERVER="sftp://exfil.darknet-shadow.onion:9922"` and `ENCRYPTION_SALT="SHADOW_KEY_9921_PROD"` remain without conflict markers. Then run `git add config.env` and `git commit -m "Merge resolved"`.'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: 'git checkout main\ngit merge forensics/recovered-payload\n# (Open File Editor -> remove <<<<<<<, =======, >>>>>>> markers and save)\ngit add config.env\ngit commit -m "Resolve merge conflict"'
        }
      ],
      clueReward: {
        id: 'clue-git-merge',
        title: 'Tampered History Reconciled',
        description: 'Successfully merged forensic recovery branch into main. The covert C2 address is locked in permanent commit history.',
        category: 'Codebase Forensics'
      },
      validate: (ctx: GitValidationContext): PuzzleValidationResult => {
        const { state } = ctx;
        if (state.HEAD.type !== 'branch' || state.HEAD.ref !== 'main') {
          return { isCorrect: false, feedback: 'Merge must be completed onto the `main` branch.' };
        }
        if (state.isMerging) {
          return { isCorrect: false, feedback: 'Repository is still in a MERGING state. Resolve conflict in config.env, run `git add config.env`, and commit.' };
        }
        const currentCommit = state.commits[state.branches['main']];
        if (!currentCommit) {
          return { isCorrect: false, feedback: 'No commit on main found.' };
        }

        const configContent = currentCommit.files['config.env'] || '';
        const hasNoConflictMarkers = !configContent.includes('<<<<<<<') && !configContent.includes('>>>>>>>');
        const hasDarknetExfil = configContent.includes('darknet-shadow.onion');

        // Check if current commit has at least 2 parents (merge commit) or includes the darknet config
        if (hasNoConflictMarkers && hasDarknetExfil) {
          return {
            isCorrect: true,
            message: 'Conflict resolved cleanly and merge commit created! C2 exfiltration server safely reconstructed.'
          };
        }

        return {
          isCorrect: false,
          feedback: 'Ensure config.env has no <<<<<<< markers, contains the darknet server configuration, and is committed to main.'
        };
      }
    }
  ]
};
