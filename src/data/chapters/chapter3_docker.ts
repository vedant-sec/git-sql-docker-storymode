import { ChapterDefinition, PuzzleValidationResult } from '../../types/game';
import { DockerValidationContext } from '../../types/docker';

export const chapter3Docker: ChapterDefinition = {
  id: 'ch3',
  number: 3,
  title: 'Chapter 3: The Ghost Container',
  subtitle: 'Daemon & Runtime Interception with Docker',
  tool: 'docker',
  initialFiles: {
    'Dockerfile': `FROM alpine:3.19
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
`,
    'server.js': `const http = require('http');
console.log('Honeypot Decryptor listening on port 8080...');
`,
    'exfil_destination.txt': `=== [DECRYPTED EXFILTRATION CHANNEL] ===
Target C2 Server: sftp://exfil.darknet-shadow.onion:9922
Target Vault: ACCT-OFFSHORE-707 (Cayman Shadow Holdings)
Auth Token: 99f8a4e12b7c61d0a0b9432e
Attacker Signature: "VANCE_SHADOW_KEY_01"
`
  },
  storyIntro: [
    {
      speaker: 'David Chen',
      role: 'SecOps Threat Analyst',
      text: 'Cipher! Vance spun up a stealth background container on our edge staging daemon before cutting his connection. It is intercepting internal database traffic.',
      timestamp: '04:05:10'
    },
    {
      speaker: 'Chief Elena Ramos',
      role: 'Chief Forensics Lead',
      text: 'We need to inspect the Docker daemon, terminate the rogue container, stand up our own forensic honeypot on port 8080, and capture his outgoing decryption keys.',
      timestamp: '04:05:32'
    }
  ],
  storyOutro: [
    {
      speaker: 'Chief Elena Ramos',
      role: 'Chief Forensics Lead',
      text: 'CASE CLOSED. With the decrypted C2 token and offshore destination ACCT-OFFSHORE-707 in hand, federal cyber units intercepted Vance at the international terminal.',
      timestamp: '04:30:00'
    },
    {
      speaker: 'David Chen',
      role: 'SecOps Threat Analyst',
      text: 'Outstanding investigation, Cipher. Real SQL queries, git reconstruction, and Docker container analysis cracked the case end-to-end. Drinks are on SecOps!',
      timestamp: '04:30:25'
    }
  ],
  puzzles: [
    {
      id: 'docker-1',
      title: 'Evidence 3.1: Neutralize the Rogue Container',
      description:
        'A rogue container named `rogue-proxy` is actively binding port 8080. If you try to remove it while running without `-f`, Docker will reject it. Inspect running containers with `docker ps`, then stop and remove `rogue-proxy` (or use `docker rm -f rogue-proxy`).',
      objective:
        'Run `docker ps` to find the running rogue container, then remove it using `docker stop rogue-proxy && docker rm rogue-proxy` (or `docker rm -f rogue-proxy`).',
      tool: 'docker',
      starterCode: 'docker ps',
      concept: {
        title: 'CONTAINER LIFECYCLE (PS, STOP, RM)',
        description: "Containers run isolated user-space processes. 'docker ps' checks active containers, while removing running containers requires either stopping them first or using the force flag (-f).",
        example: "docker ps\ndocker stop rogue-proxy\ndocker rm rogue-proxy\n# or force remove:\ndocker rm -f rogue-proxy",
        keyPoints: [
          "'docker ps' lists running containers and their port mappings",
          "'docker stop <id|name>' sends SIGTERM to gracefully shut down",
          "'docker rm <id|name>' deletes container filesystem state"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'View running containers with docker ps. Notice rogue-proxy holding port 8080.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'You cannot remove a running container without stopping it first: `docker stop rogue-proxy` then `docker rm rogue-proxy` (or use `docker rm -f rogue-proxy`).'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: 'docker rm -f rogue-proxy'
        }
      ],
      clueReward: {
        id: 'clue-docker-rm',
        title: 'Port 8080 Liberated',
        description: 'Terminated and removed rogue-proxy container. Port 8080 is now available for our forensic honeypot.',
        category: 'Runtime Forensics'
      },
      validate: (ctx: DockerValidationContext): PuzzleValidationResult => {
        const { state } = ctx;
        const rogueRunning = Object.values(state.containers).some(
          c => (c.name === 'rogue-proxy' || c.imageName.includes('shadow-proxy')) && c.status === 'running'
        );
        const rogueExists = Object.values(state.containers).some(
          c => c.name === 'rogue-proxy' || c.imageName.includes('shadow-proxy')
        );

        if (!rogueRunning && !rogueExists) {
          return {
            isCorrect: true,
            message: 'Rogue container stopped and removed! Port 8080 is clear.'
          };
        }

        if (!rogueRunning && rogueExists) {
          return {
            isCorrect: false,
            feedback: 'Container `rogue-proxy` is stopped but still exists. Run `docker rm rogue-proxy` to free resources.'
          };
        }

        return {
          isCorrect: false,
          feedback: 'Container `rogue-proxy` is still running on port 8080. Use `docker stop rogue-proxy && docker rm rogue-proxy` (or `docker rm -f rogue-proxy`).'
        };
      }
    },
    {
      id: 'docker-2',
      title: 'Evidence 3.2: Build the Honeypot Image',
      description:
        'We prepared a `Dockerfile` in the current directory configured to intercept exfiltration calls. Build the image and tag it as `honeypot:v1`. If you rebuild it, you will notice Docker\'s layer cache in action (`---> Using cache`).',
      objective:
        'Run `docker build -t honeypot:v1 .` to build the honeypot image.',
      tool: 'docker',
      starterCode: 'docker build -t honeypot:v1 .',
      concept: {
        title: 'DOCKER BUILD & LAYER CACHING',
        description: "Images are immutable templates built from instructions in a Dockerfile. Each instruction creates an intermediate read-only layer cached by Docker to accelerate subsequent builds.",
        example: "docker build -t honeypot:v1 .\ndocker images",
        keyPoints: [
          "'docker build -t name:tag .' packages the build context into an image",
          "Unchanged layers are cached ('---> Using cache')",
          "Base images are specified with 'FROM', runtime instructions with 'CMD'"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'Use the docker build command with tag flag -t honeypot:v1 pointing to the current directory.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'Run `docker build -t honeypot:v1 .` in the terminal.'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: 'docker build -t honeypot:v1 .'
        }
      ],
      clueReward: {
        id: 'clue-docker-build',
        title: 'Honeypot Image Compiled',
        description: 'Successfully built honeypot:v1 with layer caching verified. Ready for deployment.',
        category: 'Runtime Forensics'
      },
      validate: (ctx: DockerValidationContext): PuzzleValidationResult => {
        const { state } = ctx;
        const hasImage = Boolean(state.images['honeypot:v1'] || state.images['honeypot']);

        if (hasImage) {
          return {
            isCorrect: true,
            message: 'Honeypot image successfully built and cached!'
          };
        }

        return {
          isCorrect: false,
          feedback: 'Image `honeypot:v1` not found. Run `docker build -t honeypot:v1 .`.'
        };
      }
    },
    {
      id: 'docker-3',
      title: 'Evidence 3.3: Deploy Honeypot & Extract Exfiltration Data',
      description:
        'Deploy the honeypot container named `honeypot-service` in detached mode on port 8080 with verbose tracing (`-e TRACE_MODE=verbose`). Then execute `docker exec honeypot-service cat /app/exfil_destination.txt` to read the decrypted C2 destination and finalize the case!',
      objective:
        'Run `docker run -d -p 8080:8080 -e TRACE_MODE=verbose --name honeypot-service honeypot:v1`, then run `docker exec honeypot-service cat /app/exfil_destination.txt`.',
      tool: 'docker',
      starterCode: 'docker run -d -p 8080:8080 -e TRACE_MODE=verbose --name honeypot-service honeypot:v1',
      concept: {
        title: 'DOCKER RUN & EXEC INSPECTION',
        description: "'docker run -d' starts an isolated container detached in the background. 'docker exec' runs commands inside a live container without terminating it.",
        example: "docker run -d -p 8080:8080 --name honeypot-service honeypot:v1\ndocker exec honeypot-service cat /app/exfil_destination.txt",
        keyPoints: [
          "'-p hostPort:containerPort' forwards host traffic to container",
          "'-e KEY=val' passes environment variables into the container environment",
          "'docker exec <container> <cmd>' runs diagnostic inspection inside the running instance"
        ]
      },
      hints: [
        {
          tier: 1,
          label: 'Narrative Nudge',
          content: 'Start the container with docker run, binding port 8080 and setting TRACE_MODE=verbose. Then use docker exec to cat the file.'
        },
        {
          tier: 2,
          label: 'Technical Hint',
          content: 'First run: `docker run -d -p 8080:8080 -e TRACE_MODE=verbose --name honeypot-service honeypot:v1`. Then: `docker exec honeypot-service cat /app/exfil_destination.txt`.'
        },
        {
          tier: 3,
          label: 'Direct Solution',
          content: 'docker run -d -p 8080:8080 -e TRACE_MODE=verbose --name honeypot-service honeypot:v1\ndocker exec honeypot-service cat /app/exfil_destination.txt'
        }
      ],
      clueReward: {
        id: 'clue-docker-exec',
        title: 'Master Decrypted Exfiltration Dossier',
        description: 'Confirmed Vance\'s cryptographic signature and Cayman shell account destination. Full proof of guilt obtained!',
        category: 'Conclusive Evidence'
      },
      validate: (ctx: DockerValidationContext): PuzzleValidationResult => {
        const { state, command } = ctx;
        const honeypot = Object.values(state.containers).find(
          c => c.name === 'honeypot-service' || c.imageName.includes('honeypot')
        );

        if (!honeypot || honeypot.status !== 'running') {
          return {
            isCorrect: false,
            feedback: 'Container `honeypot-service` must be running on port 8080. Run `docker run -d -p 8080:8080 -e TRACE_MODE=verbose --name honeypot-service honeypot:v1`.'
          };
        }

        const isCatExec = command.includes('exec') && (command.includes('exfil_destination.txt') || command.includes('cat'));
        if (isCatExec || (ctx.result.output && ctx.result.output.includes('VANCE_SHADOW_KEY_01'))) {
          return {
            isCorrect: true,
            message: 'PAYLOAD DECRYPTED! Final evidence acquired: Marcus Vance\'s signature and offshore account confirmed.'
          };
        }

        return {
          isCorrect: false,
          feedback: 'Honeypot container is running! Now inspect the decrypted evidence with `docker exec honeypot-service cat /app/exfil_destination.txt`.'
        };
      }
    }
  ]
};
