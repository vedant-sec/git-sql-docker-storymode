import {
  DockerCommandResult,
  DockerContainer,
  DockerDaemonState,
  DockerImage,
  DockerLayer,
  PortBinding
} from '../../types/docker';

function generateShortId(): string {
  return Math.random().toString(16).substring(2, 14);
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(12, '0').slice(0, 12);
}

export class DockerEngine {
  private state: DockerDaemonState;
  private virtualFiles: Record<string, string>;

  constructor(
    initialState?: Partial<DockerDaemonState>,
    initialFiles?: Record<string, string>
  ) {
    this.state = {
      images: {},
      containers: {},
      layerCache: {},
      ...initialState
    };
    this.virtualFiles = { ...initialFiles };
  }

  getState(): DockerDaemonState {
    return {
      images: { ...this.state.images },
      containers: { ...this.state.containers },
      layerCache: { ...this.state.layerCache }
    };
  }

  setState(newState: DockerDaemonState): void {
    this.state = { ...newState };
  }

  getVirtualFile(path: string): string | undefined {
    return this.virtualFiles[path];
  }

  setVirtualFile(path: string, content: string): void {
    this.virtualFiles[path] = content;
  }

  execute(commandLine: string): DockerCommandResult {
    const raw = commandLine.trim();
    if (!raw.startsWith('docker')) {
      return {
        output: `Command '${raw.split(' ')[0]}' not recognized. Use 'docker <command>'`,
        error: true,
        state: this.getState()
      };
    }

    const tokens = this.tokenize(raw.slice(6).trim());
    if (tokens.length === 0) {
      return {
        output: 'Usage: docker [OPTIONS] COMMAND\n\nA self-sufficient runtime for containers',
        error: false,
        state: this.getState()
      };
    }

    const subCommand = tokens[0];
    const args = tokens.slice(1);

    switch (subCommand) {
      case 'build':
        return this.handleBuild(args);
      case 'run':
        return this.handleRun(args);
      case 'ps':
        return this.handlePs(args);
      case 'stop':
        return this.handleStop(args);
      case 'rm':
        return this.handleRm(args);
      case 'rmi':
        return this.handleRmi(args);
      case 'images':
        return this.handleImages(args);
      case 'image':
        if (args[0] === 'ls') return this.handleImages(args.slice(1));
        return { output: 'Usage: docker image ls', error: true, state: this.getState() };
      case 'container':
        if (args[0] === 'ls') return this.handlePs(args.slice(1));
        return { output: 'Usage: docker container ls', error: true, state: this.getState() };
      case 'logs':
        return this.handleLogs(args);
      case 'exec':
        return this.handleExec(args);
      default:
        return {
          output: `docker: '${subCommand}' is not a docker command.\nSee 'docker --help'`,
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

  private handleBuild(args: string[]): DockerCommandResult {
    let tag = 'latest';
    let dockerfilePath = 'Dockerfile';

    for (let i = 0; i < args.length; i++) {
      if (args[i] === '-t' || args[i] === '--tag') {
        tag = args[i + 1] || tag;
        i++;
      } else if (args[i] === '-f' || args[i] === '--file') {
        dockerfilePath = args[i + 1] || dockerfilePath;
        i++;
      }
    }

    const dockerfileContent = this.virtualFiles[dockerfilePath];
    if (!dockerfileContent) {
      return {
        output: `unable to prepare context: unable to evaluate symlinks in Dockerfile path: lstat /workspace/${dockerfilePath}: no such file or directory`,
        error: true,
        state: this.getState()
      };
    }

    const lines = dockerfileContent
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('#'));

    if (lines.length === 0) {
      return {
        output: 'Error: Dockerfile is empty',
        error: true,
        state: this.getState()
      };
    }

    const outputLines: string[] = [
      `[+] Building 1.2s (8/8) FINISHED`,
      ` => [internal] load build definition from ${dockerfilePath}`,
      ` => => transferring dockerfile: ${dockerfileContent.length}B done`
    ];

    let cumulativeHash = '';
    const layers: DockerLayer[] = [];
    const exposedPorts: number[] = [];
    const env: Record<string, string> = {};
    let workdir = '/app';
    let cmd: string[] = ['sh'];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const stepNum = i + 1;
      const totalSteps = lines.length;
      const [instruction, ...rest] = line.split(' ');
      const uppercaseInst = instruction.toUpperCase();
      const instructionArgs = rest.join(' ');

      cumulativeHash = simpleHash(cumulativeHash + '|' + line);
      const isCached = Boolean(this.state.layerCache[cumulativeHash]);
      const layerId = isCached ? this.state.layerCache[cumulativeHash] : simpleHash(cumulativeHash + Date.now().toString());

      this.state.layerCache[cumulativeHash] = layerId;
      layers.push({
        id: layerId,
        instruction: line,
        cached: isCached
      });

      outputLines.push(`Step ${stepNum}/${totalSteps} : ${line}`);
      if (isCached) {
        outputLines.push(` ---> Using cache`);
        outputLines.push(` ---> ${layerId}`);
      } else {
        outputLines.push(` ---> Running in ${generateShortId()}`);
        outputLines.push(` ---> ${layerId}`);
      }

      if (uppercaseInst === 'EXPOSE') {
        const port = parseInt(instructionArgs, 10);
        if (!isNaN(port)) exposedPorts.push(port);
      } else if (uppercaseInst === 'WORKDIR') {
        workdir = instructionArgs;
      } else if (uppercaseInst === 'ENV') {
        const [k, v] = instructionArgs.split('=');
        if (k && v) env[k.trim()] = v.trim();
      } else if (uppercaseInst === 'CMD') {
        try {
          cmd = JSON.parse(instructionArgs);
        } catch {
          cmd = instructionArgs.split(' ');
        }
      }
    }

    const imageId = simpleHash(cumulativeHash + tag);
    let repo = tag;
    let imageTag = 'latest';
    if (tag.includes(':')) {
      const parts = tag.split(':');
      repo = parts[0];
      imageTag = parts[1];
    }

    const newImage: DockerImage = {
      id: imageId,
      repository: repo,
      tag: imageTag,
      created: 'Just now',
      size: '142MB',
      layers,
      workdir,
      exposedPorts,
      env,
      cmd
    };

    this.state.images[tag] = newImage;
    this.state.images[imageId] = newImage;

    outputLines.push(`Successfully built ${imageId}`);
    outputLines.push(`Successfully tagged ${tag}`);

    return {
      output: outputLines.join('\n'),
      error: false,
      state: this.getState()
    };
  }

  private handleRun(args: string[]): DockerCommandResult {
    let isDetached = false;
    let name = '';
    const ports: PortBinding[] = [];
    const env: Record<string, string> = {};
    const volumes: string[] = [];
    let imageArg = '';

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg === '-d' || arg === '--detach') {
        isDetached = true;
      } else if (arg === '-p' || arg === '--publish') {
        const pVal = args[++i];
        if (pVal && pVal.includes(':')) {
          const [h, c] = pVal.split(':').map(Number);
          ports.push({ hostPort: h, containerPort: c });
        }
      } else if (arg === '-e' || arg === '--env') {
        const eVal = args[++i];
        if (eVal && eVal.includes('=')) {
          const [k, v] = eVal.split('=');
          env[k] = v;
        }
      } else if (arg === '-v' || arg === '--volume') {
        volumes.push(args[++i]);
      } else if (arg === '--name') {
        name = args[++i];
      } else if (!arg.startsWith('-')) {
        imageArg = arg;
        break;
      }
    }

    if (!imageArg) {
      return {
        output: 'docker run: requires an image name. See \'docker run --help\'.',
        error: true,
        state: this.getState()
      };
    }

    // Check if image exists
    const image = this.state.images[imageArg];
    if (!image) {
      return {
        output: `Unable to find image '${imageArg}' locally\ndocker: Error response from daemon: pull access denied for ${imageArg}, repository does not exist or may require 'docker login': denied: requested access to the resource is denied.`,
        error: true,
        state: this.getState()
      };
    }

    // Check port conflicts against running containers
    for (const binding of ports) {
      for (const c of Object.values(this.state.containers)) {
        if (c.status === 'running') {
          const hasHostPort = c.ports.some(p => p.hostPort === binding.hostPort);
          if (hasHostPort) {
            return {
              output: `docker: Error response from daemon: driver failed programming external connectivity on endpoint ${name || 'nervous_curie'} (${generateShortId()}): Bind for 0.0.0.0:${binding.hostPort} failed: port is already allocated.`,
              error: true,
              state: this.getState()
            };
          }
        }
      }
    }

    // Check name collision
    const containerId = generateShortId();
    const finalName = name || `container_${containerId.substring(0, 6)}`;
    if (this.state.containers[finalName]) {
      return {
        output: `docker: Error response from daemon: Conflict. The container name "/${finalName}" is already in use by container "${this.state.containers[finalName].id}". You have to remove (or rename) that container to be able to reuse that name.`,
        error: true,
        state: this.getState()
      };
    }

    const containerLogs: string[] = [
      `[${new Date().toISOString()}] Service initialized successfully.`,
      `[${new Date().toISOString()}] Listening on 0.0.0.0:${ports[0]?.containerPort || 8080}`,
      `[${new Date().toISOString()}] Environment loaded: TRACE_MODE=${env['TRACE_MODE'] || 'default'}`
    ];

    if (env['TRACE_MODE'] === 'verbose' || imageArg.includes('honeypot')) {
      containerLogs.push(`[${new Date().toISOString()}] [ALERT] Intercepted exfiltration socket connection from 198.51.100.77`);
      containerLogs.push(`[${new Date().toISOString()}] Decrypted payload target: /app/exfil_destination.txt`);
    }

    const newContainer: DockerContainer = {
      id: containerId,
      name: finalName,
      imageId: image.id,
      imageName: imageArg,
      created: 'Just now',
      status: 'running',
      ports,
      volumes,
      env: { ...image.env, ...env },
      logs: containerLogs,
      cmd: image.cmd
    };

    this.state.containers[finalName] = newContainer;
    this.state.containers[containerId] = newContainer;

    return {
      output: isDetached ? containerId : containerLogs.join('\n'),
      error: false,
      state: this.getState()
    };
  }

  private handlePs(args: string[]): DockerCommandResult {
    const showAll = args.includes('-a') || args.includes('--all');
    const filtered = Object.values(this.state.containers).filter((c, idx, arr) => {
      // deduplicate by id since stored by name and id
      return arr.findIndex(x => x.id === c.id) === idx && (showAll || c.status === 'running');
    });

    const header = [
      'CONTAINER ID'.padEnd(14),
      'IMAGE'.padEnd(20),
      'COMMAND'.padEnd(22),
      'CREATED'.padEnd(16),
      'STATUS'.padEnd(18),
      'PORTS'.padEnd(25),
      'NAMES'
    ].join(' ');

    const rows = filtered.map(c => {
      const portStr = c.ports.map(p => `0.0.0.0:${p.hostPort}->${p.containerPort}/tcp`).join(', ') || '';
      const cmdStr = `"${c.cmd.join(' ')}"`;
      const statusStr = c.status === 'running' ? 'Up 10 minutes' : 'Exited (0) 5 minutes ago';

      return [
        c.id.substring(0, 12).padEnd(14),
        c.imageName.padEnd(20),
        cmdStr.slice(0, 20).padEnd(22),
        c.created.padEnd(16),
        statusStr.padEnd(18),
        portStr.padEnd(25),
        c.name
      ].join(' ');
    });

    return {
      output: [header, ...rows].join('\n'),
      error: false,
      state: this.getState()
    };
  }

  private handleStop(args: string[]): DockerCommandResult {
    if (args.length === 0) {
      return { output: '"docker stop" requires at least 1 argument.', error: true, state: this.getState() };
    }

    const target = args[0];
    const container = this.state.containers[target];
    if (!container) {
      return {
        output: `Error response from daemon: No such container: ${target}`,
        error: true,
        state: this.getState()
      };
    }

    container.status = 'stopped';
    return {
      output: target,
      error: false,
      state: this.getState()
    };
  }

  private handleRm(args: string[]): DockerCommandResult {
    const force = args.includes('-f') || args.includes('--force');
    const targets = args.filter(a => !a.startsWith('-'));

    if (targets.length === 0) {
      return { output: '"docker rm" requires at least 1 argument.', error: true, state: this.getState() };
    }

    const target = targets[0];
    const container = this.state.containers[target];
    if (!container) {
      return {
        output: `Error response from daemon: No such container: ${target}`,
        error: true,
        state: this.getState()
      };
    }

    if (container.status === 'running' && !force) {
      return {
        output: `Error response from daemon: You cannot remove a running container ${container.id}. Stop the container before attempting removal or force remove`,
        error: true,
        state: this.getState()
      };
    }

    delete this.state.containers[container.name];
    delete this.state.containers[container.id];

    return {
      output: target,
      error: false,
      state: this.getState()
    };
  }

  private handleRmi(args: string[]): DockerCommandResult {
    if (args.length === 0) {
      return { output: '"docker rmi" requires at least 1 argument.', error: true, state: this.getState() };
    }

    const target = args[0];
    const image = this.state.images[target];
    if (!image) {
      return {
        output: `Error: No such image: ${target}`,
        error: true,
        state: this.getState()
      };
    }

    // Check if used by containers
    for (const c of Object.values(this.state.containers)) {
      if (c.imageId === image.id || c.imageName === target) {
        return {
          output: `Error response from daemon: conflict: unable to remove repository reference "${target}" (must force) - container ${c.id.substring(0, 12)} is using its referenced image ${image.id.substring(0, 12)}`,
          error: true,
          state: this.getState()
        };
      }
    }

    delete this.state.images[target];
    delete this.state.images[image.id];

    return {
      output: `Untagged: ${target}\nDeleted: sha256:${image.id}`,
      error: false,
      state: this.getState()
    };
  }

  private handleImages(_args: string[]): DockerCommandResult {
    const list = Object.values(this.state.images).filter((img, idx, arr) => {
      return arr.findIndex(x => x.id === img.id) === idx;
    });

    const header = [
      'REPOSITORY'.padEnd(25),
      'TAG'.padEnd(12),
      'IMAGE ID'.padEnd(16),
      'CREATED'.padEnd(18),
      'SIZE'
    ].join(' ');

    const rows = list.map(img => {
      return [
        img.repository.padEnd(25),
        img.tag.padEnd(12),
        img.id.substring(0, 12).padEnd(16),
        img.created.padEnd(18),
        img.size
      ].join(' ');
    });

    return {
      output: [header, ...rows].join('\n'),
      error: false,
      state: this.getState()
    };
  }

  private handleLogs(args: string[]): DockerCommandResult {
    if (args.length === 0) {
      return { output: '"docker logs" requires at least 1 argument.', error: true, state: this.getState() };
    }

    const target = args.find(a => !a.startsWith('-'));
    if (!target) {
      return { output: '"docker logs" requires a container name or id.', error: true, state: this.getState() };
    }

    const container = this.state.containers[target];
    if (!container) {
      return {
        output: `Error response from daemon: No such container: ${target}`,
        error: true,
        state: this.getState()
      };
    }

    return {
      output: container.logs.join('\n'),
      error: false,
      state: this.getState()
    };
  }

  private handleExec(args: string[]): DockerCommandResult {
    if (args.length < 2) {
      return {
        output: 'Usage: docker exec [OPTIONS] CONTAINER COMMAND [ARG...]',
        error: true,
        state: this.getState()
      };
    }

    const nonFlagArgs = args.filter(a => !a.startsWith('-'));
    const containerTarget = nonFlagArgs[0];
    const execCmd = nonFlagArgs.slice(1).join(' ');

    const container = this.state.containers[containerTarget];
    if (!container) {
      return {
        output: `Error response from daemon: No such container: ${containerTarget}`,
        error: true,
        state: this.getState()
      };
    }

    if (container.status !== 'running') {
      return {
        output: `Error response from daemon: Container ${container.id} is not running`,
        error: true,
        state: this.getState()
      };
    }

    if (execCmd === 'ls' || execCmd === 'ls /app') {
      return {
        output: 'Dockerfile  README.md  exfil_destination.txt  package.json  server.js',
        error: false,
        state: this.getState()
      };
    }

    if (execCmd.startsWith('cat') && execCmd.includes('exfil_destination.txt')) {
      return {
        output: [
          '=== [DECRYPTED EXFILTRATION CHANNEL] ===',
          'Target C2 Server: sftp://exfil.darknet-shadow.onion:9922',
          'Target Vault: ACCT-OFFSHORE-707 (Cayman Shadow Holdings)',
          'Auth Token: 99f8a4e12b7c61d0a0b9432e',
          'Attacker Signature: "VANCE_SHADOW_KEY_01"'
        ].join('\n'),
        error: false,
        state: this.getState()
      };
    }

    if (execCmd.startsWith('cat') && execCmd.includes('server.js')) {
      return {
        output: `const express = require('express');\nconst app = express();\napp.listen(process.env.PORT || 8080, () => console.log('Honeypot running'));`,
        error: false,
        state: this.getState()
      };
    }

    return {
      output: `Executed: ${execCmd}\nOutput: command completed successfully.`,
      error: false,
      state: this.getState()
    };
  }
}
