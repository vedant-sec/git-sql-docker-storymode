export interface Character {
  id: string;
  name: string;
  title: string;
  department: string;
  badgeColor: string;
}

export const CHARACTERS: Record<string, Character> = {
  ramos: {
    id: 'ramos',
    name: 'Chief Elena Ramos',
    title: 'Chief Forensics Lead',
    department: 'Digital Crimes Division',
    badgeColor: '#06b6d4'
  },
  chen: {
    id: 'chen',
    name: 'David Chen',
    title: 'SecOps Threat Analyst',
    department: 'Incident Response',
    badgeColor: '#10b981'
  },
  vance: {
    id: 'vance',
    name: 'Marcus Vance',
    title: 'Lead Cloud Architect (Suspect)',
    department: 'Infrastructure',
    badgeColor: '#f43f5e'
  },
  system: {
    id: 'system',
    name: 'Nexus Security Terminal',
    title: 'Automated SIEM Engine',
    department: 'Core Operations',
    badgeColor: '#8b5cf6'
  }
};

export const STORY_OVERVIEW = {
  title: 'ROOT ACCESS // Operation Broken Cipher',
  synopsis:
    'At 02:30 AM, 2.4 million synthetic credits and high-clearance cryptographic keys were drained from Nexus Financial. The attacker had internal credentials and attempted to cover their tracks across the database, git repositories, and running microservices. You are Lead Operative Cipher. Use your terminal to follow the digital footprints.',
  chapters: [
    {
      id: 'ch1',
      number: 1,
      title: 'Chapter 1: The Audit Trail',
      subtitle: 'Structured Query Forensics (SQL)',
      tool: 'sql'
    },
    {
      id: 'ch2',
      number: 2,
      title: 'Chapter 2: The Tampered Codebase',
      subtitle: 'Version Control Reconstruction (Git)',
      tool: 'git'
    },
    {
      id: 'ch3',
      number: 3,
      title: 'Chapter 3: The Ghost Container',
      subtitle: 'Daemon & Runtime Interception (Docker)',
      tool: 'docker'
    }
  ]
};
