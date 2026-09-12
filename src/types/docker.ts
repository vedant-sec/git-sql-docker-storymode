export interface DockerLayer {
  id: string;
  instruction: string;
  cached: boolean;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  created: string;
  size: string;
  layers: DockerLayer[];
  workdir?: string;
  exposedPorts: number[];
  env: Record<string, string>;
  cmd: string[];
}

export interface PortBinding {
  hostPort: number;
  containerPort: number;
}

export interface DockerContainer {
  id: string;
  name: string;
  imageId: string;
  imageName: string;
  created: string;
  status: 'running' | 'stopped' | 'exited';
  ports: PortBinding[];
  volumes: string[];
  env: Record<string, string>;
  logs: string[];
  cmd: string[];
}

export interface DockerDaemonState {
  images: Record<string, DockerImage>;
  containers: Record<string, DockerContainer>;
  layerCache: Record<string, string>; // instructionHash -> layerId
}

export interface DockerCommandResult {
  output: string;
  error?: boolean;
  state: DockerDaemonState;
}

export interface DockerValidationContext {
  command: string;
  args: string[];
  result: DockerCommandResult;
  state: DockerDaemonState;
}
