import { GitEngine } from '../engine/git/gitEngine';
import { DockerEngine } from '../engine/docker/dockerEngine';
import { chapter1Sql } from '../data/chapters/chapter1_sql';
import { chapter2Git } from '../data/chapters/chapter2_git';
import { chapter3Docker } from '../data/chapters/chapter3_docker';

function assert(condition: any, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

async function testGitEngine() {
  console.log('\n--- TESTING GIT SIMULATION ENGINE ---');
  const initialFiles = { ...chapter2Git.initialFiles };
  const recoveredHash = 'c7f912a';

  const git = new GitEngine({
    initialized: false,
    commits: {
      [recoveredHash]: {
        hash: recoveredHash,
        message: 'feat(exfil): update sftp credentials and routing payload',
        author: 'Marcus Vance <vance@nexus-internal.net>',
        date: '2026-09-11 02:28:14',
        parents: [],
        files: {
          'forensic_tracer.sh': initialFiles['forensic_tracer.sh'] || '',
          'config.env': `EXFIL_SERVER="sftp://exfil.darknet-shadow.onion:9922"\nENCRYPTION_SALT="SHADOW_KEY_9921_PROD"\n`
        }
      }
    },
    branches: {
      'forensics/recovered-payload': recoveredHash
    },
    workingDirectory: { ...initialFiles }
  });

  // 1. git init
  let res = git.execute('git init');
  assert(!res.error && git.getState().initialized, 'git init initializes repo');

  // 2. git status
  res = git.execute('git status');
  assert(res.output.includes('Untracked files:') && res.output.includes('config.env'), 'git status detects untracked files');

  // 3. git add .
  res = git.execute('git add .');
  assert(!res.error && Object.keys(git.getState().staging).length === 2, 'git add stages working directory files');

  // 4. git commit -m "initial baseline"
  res = git.execute('git commit -m "initial baseline"');
  assert(!res.error && Object.keys(git.getState().commits).length === 2, 'git commit creates commit snapshot');

  // Validate Puzzle 2.1
  const v1 = chapter2Git.puzzles[0].validate!({
    command: 'git commit -m "initial baseline"',
    args: ['commit', '-m', 'initial baseline'],
    result: res,
    state: git.getState()
  });
  assert(v1.isCorrect, 'Puzzle 2.1 validator passes');

  // 5. git branch
  res = git.execute('git branch');
  assert(res.output.includes('* main') && res.output.includes('forensics/recovered-payload'), 'git branch lists branches');

  // 6. git checkout forensics/recovered-payload
  res = git.execute('git checkout forensics/recovered-payload');
  assert(git.getState().HEAD.ref === 'forensics/recovered-payload', 'git checkout switches branch');

  // Validate Puzzle 2.2
  const v2 = chapter2Git.puzzles[1].validate!({
    command: 'git checkout forensics/recovered-payload',
    args: ['checkout', 'forensics/recovered-payload'],
    result: res,
    state: git.getState()
  });
  assert(v2.isCorrect, 'Puzzle 2.2 validator passes');

  // 7. git checkout main
  res = git.execute('git checkout main');
  assert(git.getState().HEAD.ref === 'main', 'git checkout switches back to main');

  // 8. git merge forensics/recovered-payload -> should trigger conflict
  res = git.execute('git merge forensics/recovered-payload');
  assert(res.error && git.getState().isMerging, 'git merge detects conflict');
  assert(git.getWorkingFile('config.env')?.includes('<<<<<<< HEAD'), 'git merge writes conflict markers into config.env');

  // 9. Resolve conflict: remove conflict markers and save
  git.setWorkingFile(
    'config.env',
    `EXFIL_SERVER="sftp://exfil.darknet-shadow.onion:9922"\nENCRYPTION_SALT="SHADOW_KEY_9921_PROD"\n`
  );

  // 10. git add config.env
  res = git.execute('git add config.env');
  assert(git.getState().conflictedFiles.length === 0, 'git add clears resolved conflict from conflictedFiles');

  // 11. git commit -m "Merge resolved"
  res = git.execute('git commit -m "Merge resolved"');
  assert(!res.error && !git.getState().isMerging, 'git commit finalizes merge');

  // Validate Puzzle 2.3
  const v3 = chapter2Git.puzzles[2].validate!({
    command: 'git commit -m "Merge resolved"',
    args: ['commit', '-m', 'Merge resolved'],
    result: res,
    state: git.getState()
  });
  assert(v3.isCorrect, 'Puzzle 2.3 validator passes');
}

async function testDockerEngine() {
  console.log('\n--- TESTING DOCKER SIMULATION ENGINE ---');
  const initialFiles = { ...chapter3Docker.initialFiles };

  const docker = new DockerEngine(
    {
      images: {
        'alpine:3.19': {
          id: 'a1b2c3d4e5f6',
          repository: 'alpine',
          tag: '3.19',
          created: '2 weeks ago',
          size: '7.34MB',
          layers: [{ id: 'l1', instruction: 'FROM alpine:3.19', cached: true }],
          exposedPorts: [],
          env: {},
          cmd: ['/bin/sh']
        },
        'shadow-proxy:v1': {
          id: '99e8d7c6b5a4',
          repository: 'shadow-proxy',
          tag: 'v1',
          created: '3 hours ago',
          size: '88.2MB',
          layers: [{ id: 'l2', instruction: 'FROM alpine:3.19', cached: true }],
          exposedPorts: [8080],
          env: {},
          cmd: ['/usr/bin/proxy']
        }
      },
      containers: {
        'rogue-proxy': {
          id: 'f72a901c3e44',
          name: 'rogue-proxy',
          imageId: '99e8d7c6b5a4',
          imageName: 'shadow-proxy:v1',
          created: '3 hours ago',
          status: 'running',
          ports: [{ hostPort: 8080, containerPort: 8080 }],
          volumes: [],
          env: {},
          logs: ['[+] Stealth reverse proxy listening on 0.0.0.0:8080'],
          cmd: ['/usr/bin/proxy']
        }
      }
    },
    initialFiles
  );

  // 1. docker ps
  let res = docker.execute('docker ps');
  assert(res.output.includes('rogue-proxy') && res.output.includes('8080'), 'docker ps displays running container');

  // 2. Realistic error: docker rm without -f on running container
  res = docker.execute('docker rm rogue-proxy');
  assert(res.error && res.output.includes('You cannot remove a running container'), 'docker rm fails on running container without -f');

  // 3. Realistic error: port already allocated on docker run -p 8080:8080 collision
  res = docker.execute('docker run -d -p 8080:8080 alpine:3.19');
  assert(res.error && res.output.includes('port is already allocated'), 'docker run detects port conflict');

  // 4. Stop and remove rogue-proxy
  res = docker.execute('docker stop rogue-proxy');
  assert(!res.error, 'docker stop halts container');
  res = docker.execute('docker rm rogue-proxy');
  assert(!res.error, 'docker rm removes container');

  // Validate Puzzle 3.1
  const v1 = chapter3Docker.puzzles[0].validate!({
    command: 'docker rm rogue-proxy',
    args: ['rm', 'rogue-proxy'],
    result: res,
    state: docker.getState()
  });
  assert(v1.isCorrect, 'Puzzle 3.1 validator passes');

  // 5. docker build -t honeypot:v1 .
  res = docker.execute('docker build -t honeypot:v1 .');
  assert(!res.error && res.output.includes('Successfully tagged honeypot:v1'), 'docker build succeeds');

  // 6. Test layer caching on re-build
  const resRebuild = docker.execute('docker build -t honeypot:v1 .');
  assert(resRebuild.output.includes('---> Using cache'), 'docker build utilizes layer cache on rebuild');

  // Validate Puzzle 3.2
  const v2 = chapter3Docker.puzzles[1].validate!({
    command: 'docker build -t honeypot:v1 .',
    args: ['build', '-t', 'honeypot:v1', '.'],
    result: res,
    state: docker.getState()
  });
  assert(v2.isCorrect, 'Puzzle 3.2 validator passes');

  // 7. docker run honeypot
  res = docker.execute('docker run -d -p 8080:8080 -e TRACE_MODE=verbose --name honeypot-service honeypot:v1');
  assert(!res.error, 'docker run starts honeypot container');

  // 8. docker logs honeypot-service
  res = docker.execute('docker logs honeypot-service');
  assert(res.output.includes('Intercepted exfiltration socket'), 'docker logs returns container runtime logs');

  // 9. docker exec honeypot-service cat /app/exfil_destination.txt
  res = docker.execute('docker exec honeypot-service cat /app/exfil_destination.txt');
  assert(res.output.includes('VANCE_SHADOW_KEY_01') && res.output.includes('ACCT-OFFSHORE-707'), 'docker exec extracts decrypted exfil data');

  // Validate Puzzle 3.3
  const v3 = chapter3Docker.puzzles[2].validate!({
    command: 'docker exec honeypot-service cat /app/exfil_destination.txt',
    args: ['exec', 'honeypot-service', 'cat', '/app/exfil_destination.txt'],
    result: res,
    state: docker.getState()
  });
  assert(v3.isCorrect, 'Puzzle 3.3 validator passes');
}

async function testSqlValidationRules() {
  console.log('\n--- TESTING SQL PUZZLE VALIDATION LOGIC ---');

  // Test Puzzle 1.1 validator
  const p1Valid = chapter1Sql.puzzles[0].validate!({
    query: "SELECT * FROM access_logs WHERE status = 'FAILED';",
    result: {
      columns: ['id', 'timestamp', 'employee_id', 'ip_address', 'status'],
      values: [
        [2, '2026-09-10 23:45:11', null, '198.51.100.77', 'FAILED'],
        [3, '2026-09-10 23:45:19', null, '198.51.100.77', 'FAILED']
      ],
      rowCount: 2
    }
  });
  assert(p1Valid.isCorrect, 'Chapter 1 Puzzle 1.1 validator matches failed IP');

  // Test Puzzle 1.2 validator
  const p2Valid = chapter1Sql.puzzles[1].validate!({
    query: "SELECT recipient_account, SUM(amount) FROM transactions GROUP BY recipient_account HAVING SUM(amount) >= 1000000;",
    result: {
      columns: ['recipient_account', 'SUM(amount)'],
      values: [
        ['ACCT-SHADOW-X9', 2500000],
        ['ACCT-OFFSHORE-707', 1200000]
      ],
      rowCount: 2
    }
  });
  assert(p2Valid.isCorrect, 'Chapter 1 Puzzle 1.2 validator matches aggregated amount');

  // Test Puzzle 1.3 validator
  const p3Valid = chapter1Sql.puzzles[2].validate!({
    query: "SELECT e.name, e.role, a.action FROM employees e JOIN access_logs a ON e.id = a.employee_id WHERE a.ip_address = '198.51.100.77';",
    result: {
      columns: ['name', 'role', 'action'],
      values: [
        ['Marcus Vance', 'Lead Cloud Architect', 'DB_EXPORT']
      ],
      rowCount: 1
    }
  });
  assert(p3Valid.isCorrect, 'Chapter 1 Puzzle 1.3 validator matches joined suspect employee');

  // Test Puzzle 1.4 validator
  const p4Valid = chapter1Sql.puzzles[3].validate!({
    query: "SELECT * FROM transactions WHERE sender_account IN (SELECT sender_account FROM transactions WHERE flagged = 1) AND recipient_account = 'ACCT-OFFSHORE-707';",
    result: {
      columns: ['id', 'sender_account', 'recipient_account', 'amount'],
      values: [
        [9, 'CORP-TREASURY-01', 'ACCT-OFFSHORE-707', 1200000]
      ],
      rowCount: 1
    }
  });
  assert(p4Valid.isCorrect, 'Chapter 1 Puzzle 1.4 validator matches offshore transaction subquery');
}

async function main() {
  await testGitEngine();
  await testDockerEngine();
  await testSqlValidationRules();
  console.log('\n🎉 ALL INTEGRATION & VALIDATION TESTS PASSED SUCCESSFULLY!\n');
}

main().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
