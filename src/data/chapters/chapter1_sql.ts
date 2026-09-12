import { ChapterDefinition, PuzzleValidationResult } from '../../types/game';
import { SqlValidationContext } from '../../types/sql';

export const chapter1Sql: ChapterDefinition = {
  id: 'ch1',
  number: 1,
  title: 'Chapter 1: The Audit Trail',
  subtitle: 'Database Forensics with SQL',
  tool: 'sql',
  storyIntro: [
    {
      speaker: 'Chief Elena Ramos',
      role: 'Chief Forensics Lead',
      text: 'Cipher, glad you are plugged in. At 02:30 hours, our SIEM triggered a Level-1 breach alert. Millions of synthetic credits were wired out of Nexus Financial.',
      timestamp: '03:02:15'
    },
    {
      speaker: 'David Chen',
      role: 'SecOps Threat Analyst',
      text: 'The intruder had valid credentials, but our access and transaction ledgers caught the metadata. I dumped the raw database into your session.',
      timestamp: '03:02:40'
    },
    {
      speaker: 'Chief Elena Ramos',
      role: 'Chief Forensics Lead',
      text: 'Query the SQLite database directly. Find the entry vector, follow the stolen funds, and unmask the insider.',
      timestamp: '03:03:05'
    }
  ],
  storyOutro: [
    {
      speaker: 'David Chen',
      role: 'SecOps Threat Analyst',
      text: 'Unbelievable. The query results leave no doubt: Marcus Vance was logged into the jump host, and the funds route directly to offshore shell ACCT-OFFSHORE-707.',
      timestamp: '03:22:18'
    },
    {
      speaker: 'Chief Elena Ramos',
      role: 'Chief Forensics Lead',
      text: 'Vance cleared his desk an hour ago. We just seized his company workstation, but he scrambled the git history on his local tools. Switch your terminal to Chapter 2—we need to recover his repo.',
      timestamp: '03:22:45'
    }
  ],
  puzzles: [
    {
      id: 'sql-1',
      title: 'Evidence 1.1: The Entry Vector',
      description:
        'SecOps believes the attacker initiated a brute-force or credential-stuffing probe just before midnight on September 10. Inspect the `access_logs` table.',
      objective:
        'Run a query selecting records from `access_logs` where `status = \'FAILED\'` (or matching status and timestamp) to identify the attacker\'s IP address.',
      tool: 'sql',
      starterCode: "SELECT * FROM access_logs WHERE status = 'FAILED';",
      concept: {
        title: 'SELECT & WHERE Filtering',
        description: "The 'SELECT' statement specifies which columns to retrieve from a table, while 'WHERE' filters rows according to specified condition criteria (e.g. equality, comparisons, string matches).",
        example: "SELECT ip_address, timestamp, action\nFROM access_logs\nWHERE status = 'FAILED';",
        keyPoints: [
          "Use SELECT * to view all columns or name specific fields",
          "WHERE filters rows before returning results",
          "String literals in SQL use single quotes ('FAILED')"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'Filter the access_logs table for attempts where status indicates failure.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'Use standard SQL syntax: `SELECT ip_address, timestamp, action FROM access_logs WHERE status = \'FAILED\';`'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: "SELECT * FROM access_logs WHERE status = 'FAILED';"
        }
      ],
      clueReward: {
        id: 'clue-ip',
        title: 'Attacker External IP: 198.51.100.77',
        description: 'Repeated failed login attempts followed by an escalated authentication from 198.51.100.77 at 23:45.',
        category: 'Network Forensics'
      },
      validate: (ctx: SqlValidationContext): PuzzleValidationResult => {
        const { result } = ctx;
        if (result.error || result.values.length === 0) {
          return { isCorrect: false, feedback: result.error || 'Query returned no rows.' };
        }
        // Check if ip_address '198.51.100.77' appears in the result rows
        const hasAttackerIp = result.values.some(row =>
          row.some(val => String(val).includes('198.51.100.77'))
        );
        const hasFailedStatus = result.values.some(row =>
          row.some(val => String(val).toUpperCase() === 'FAILED')
        );

        if (hasAttackerIp && (hasFailedStatus || result.values.length <= 5)) {
          return {
            isCorrect: true,
            message: 'Suspicious IP address isolated: 198.51.100.77 with multiple failed login spikes.'
          };
        }

        return {
          isCorrect: false,
          feedback: 'Expected rows from access_logs containing the failed attempts from the external IP (198.51.100.77).'
        };
      }
    },
    {
      id: 'sql-2',
      title: 'Evidence 1.2: Follow the Money',
      description:
        'The attackers didn\'t just breach the perimeter; they drained synthetic reserves. Use aggregation to find accounts that received over $1,000,000 in total from `transactions`.',
      objective:
        'Aggregate `transactions` by `recipient_account` using `GROUP BY` and filter using `HAVING SUM(amount) >= 1000000`.',
      tool: 'sql',
      starterCode: 'SELECT recipient_account, SUM(amount) AS total_received FROM transactions GROUP BY recipient_account HAVING total_received >= 1000000;',
      concept: {
        title: 'GROUP BY & AGGREGATION',
        description: "The 'GROUP BY' statement groups rows that have the same values into summary rows. It is often used with aggregate functions (like 'SUM' or 'COUNT') to perform calculations on each group individually.",
        example: "SELECT recipient_account, SUM(amount) AS total_received\nFROM transactions\nGROUP BY recipient_account\nHAVING SUM(amount) >= 1000000;",
        keyPoints: [
          "'GROUP BY' aggregates distinct key values into single rows",
          "Aggregate functions like SUM(), COUNT(), AVG() calculate group values",
          "'HAVING' filters grouped aggregate results (unlike WHERE which filters before grouping)"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'You need to group transactions by recipient and calculate the total amount transferred.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'Use `SELECT recipient_account, SUM(amount) FROM transactions GROUP BY recipient_account HAVING SUM(amount) >= 1000000;`'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: 'SELECT recipient_account, SUM(amount) FROM transactions GROUP BY recipient_account HAVING SUM(amount) > 1000000;'
        }
      ],
      clueReward: {
        id: 'clue-mule',
        title: 'Mule Account ACCT-SHADOW-X9 ($2.5M Total)',
        description: 'Received three staggered transfers of $750k, $850k, and $900k from CORP-TREASURY-01.',
        category: 'Financial Forensics'
      },
      validate: (ctx: SqlValidationContext): PuzzleValidationResult => {
        const { result } = ctx;
        if (result.error || result.values.length === 0) {
          return { isCorrect: false, feedback: result.error || 'Query returned no rows.' };
        }

        const hasShadowAcct = result.values.some(row =>
          row.some(val => String(val).includes('ACCT-SHADOW-X9'))
        );
        const hasHighAmount = result.values.some(row =>
          row.some(val => typeof val === 'number' && val >= 1000000)
        );

        if (hasShadowAcct && hasHighAmount) {
          return {
            isCorrect: true,
            message: 'Target mule account identified: ACCT-SHADOW-X9 received over $2,500,000 in illicit transfers!'
          };
        }

        return {
          isCorrect: false,
          feedback: 'Make sure to GROUP BY recipient_account and filter with HAVING SUM(amount) >= 1000000.'
        };
      }
    },
    {
      id: 'sql-3',
      title: 'Evidence 1.3: Unmasking the Insider',
      description:
        'Now correlate the rogue IP `198.51.100.77` with our employee roster. Perform an `INNER JOIN` between `employees` and `access_logs` on `employees.id = access_logs.employee_id`.',
      objective:
        'Join `employees` and `access_logs` where `access_logs.ip_address = \'198.51.100.77\'` to discover which employee\'s identity was used.',
      tool: 'sql',
      starterCode: "SELECT e.id, e.name, e.role, a.timestamp, a.action FROM employees e JOIN access_logs a ON e.id = a.employee_id WHERE a.ip_address = '198.51.100.77';",
      concept: {
        title: 'INNER JOIN',
        description: "An 'INNER JOIN' combines records from two or more tables whenever there are matching values in a specified shared column (such as primary and foreign key IDs).",
        example: "SELECT e.name, e.role, a.action\nFROM employees e\nINNER JOIN access_logs a ON e.id = a.employee_id\nWHERE a.ip_address = '198.51.100.77';",
        keyPoints: [
          "'JOIN table ON condition' links related tables",
          "Table aliases like 'e' and 'a' provide clean prefixes",
          "Returns only rows where the ON condition is satisfied"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'Connect the access logs to the employee records using their shared employee ID.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'Use `SELECT employees.name, employees.role, access_logs.action FROM employees JOIN access_logs ON employees.id = access_logs.employee_id WHERE access_logs.ip_address = \'198.51.100.77\';`'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: "SELECT e.name, e.role, a.action, a.ip_address FROM employees e JOIN access_logs a ON e.id = a.employee_id WHERE a.ip_address = '198.51.100.77';"
        }
      ],
      clueReward: {
        id: 'clue-suspect',
        title: 'Primary Suspect: Marcus Vance (Lead Cloud Architect)',
        description: 'Vance\'s employee account was logged performing database exports and key rotations from the rogue IP.',
        category: 'Identity Forensics'
      },
      validate: (ctx: SqlValidationContext): PuzzleValidationResult => {
        const { result } = ctx;
        if (result.error || result.values.length === 0) {
          return { isCorrect: false, feedback: result.error || 'Query returned no rows.' };
        }

        const hasMarcus = result.values.some(row =>
          row.some(val => String(val).toLowerCase().includes('marcus') || String(val).toLowerCase().includes('vance'))
        );

        if (hasMarcus) {
          return {
            isCorrect: true,
            message: 'Match confirmed: Marcus Vance (Lead Cloud Architect) is tied directly to the rogue IP access logs!'
          };
        }

        return {
          isCorrect: false,
          feedback: 'Query must join employees and access_logs and return the employee name associated with IP 198.51.100.77.'
        };
      }
    },
    {
      id: 'sql-4',
      title: 'Evidence 1.4: The Offshore Syndicate',
      description:
        'Ramos suspects Vance routed a second, covert transaction from the same treasury account that funded the mule accounts. Use a subquery to find all transactions where `sender_account` is in the list of accounts that sent flagged transfers.',
      objective:
        'Select transactions where `sender_account IN (SELECT sender_account FROM transactions WHERE flagged = 1)` and `recipient_account NOT LIKE \'%SHADOW%\'`.',
      tool: 'sql',
      starterCode: "SELECT * FROM transactions WHERE sender_account IN (SELECT sender_account FROM transactions WHERE flagged = 1) AND recipient_account NOT LIKE '%SHADOW%';",
      concept: {
        title: 'SUBQUERIES & IN OPERATOR',
        description: "A subquery is a nested query enclosed in parentheses. The 'IN' operator allows evaluating whether an expression matches any value in a subquery's result set.",
        example: "SELECT * FROM transactions\nWHERE sender_account IN (\n  SELECT sender_account FROM transactions WHERE flagged = 1\n)\nAND recipient_account NOT LIKE '%SHADOW%';",
        keyPoints: [
          "Subqueries calculate intermediate datasets dynamically",
          "'WHERE col IN (...)' checks inclusion against the inner query",
          "Enables multi-step forensic filtering in a single query"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'Use a subquery inside the WHERE clause to match sender accounts involved in flagged transactions.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'Try `SELECT * FROM transactions WHERE sender_account IN (SELECT sender_account FROM transactions WHERE flagged = 1) AND recipient_account = \'ACCT-OFFSHORE-707\';`'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: "SELECT * FROM transactions WHERE sender_account IN (SELECT sender_account FROM transactions WHERE flagged = 1) AND recipient_account = 'ACCT-OFFSHORE-707';"
        }
      ],
      clueReward: {
        id: 'clue-offshore',
        title: 'Offshore Vault: ACCT-OFFSHORE-707 ($1.2M Transfer)',
        description: 'Final wire authorized at 04:00 AM directly to an anonymous offshore cayman account.',
        category: 'Financial Forensics'
      },
      validate: (ctx: SqlValidationContext): PuzzleValidationResult => {
        const { result } = ctx;
        if (result.error || result.values.length === 0) {
          return { isCorrect: false, feedback: result.error || 'Query returned no rows.' };
        }

        const hasOffshore = result.values.some(row =>
          row.some(val => String(val).includes('ACCT-OFFSHORE-707'))
        );

        if (hasOffshore) {
          return {
            isCorrect: true,
            message: 'Covert offshore wire uncovered: ACCT-OFFSHORE-707 received $1,200,000 from CORP-TREASURY-01!'
          };
        }

        return {
          isCorrect: false,
          feedback: 'Query should use a subquery to uncover the non-shadow transaction sent to ACCT-OFFSHORE-707.'
        };
      }
    }
  ]
};
