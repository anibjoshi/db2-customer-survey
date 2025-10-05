import { Problem, ProblemGroup } from '../types';

export const STORAGE_KEY = 'zora_survey_v1';
export const DEFAULT_RATING = 5;
export const MIN_RATING = 1;
export const MAX_RATING = 10;

export const PROBLEMS: Problem[] = [
  // Query Performance & Tuning
  { 
    id: 1, 
    title: 'Query performance keeps degrading over time', 
    group: 'Query Performance & Tuning' 
  },
  { 
    id: 2, 
    title: "It's hard to identify the right indexes or MQTs for workload optimization", 
    group: 'Query Performance & Tuning' 
  },
  { 
    id: 3, 
    title: 'Query plans change unexpectedly and are hard to roll back', 
    group: 'Query Performance & Tuning' 
  },
  
  // Incident Analysis & Resolution
  { 
    id: 4, 
    title: 'Blocking and locking issues are hard to detect and resolve', 
    group: 'Incident Analysis & Resolution' 
  },
  { 
    id: 5, 
    title: 'Queries spill to disk without early warning', 
    group: 'Incident Analysis & Resolution' 
  },
  { 
    id: 6, 
    title: 'WLM queueing causes slowdowns that are difficult to diagnose', 
    group: 'Incident Analysis & Resolution' 
  },
  { 
    id: 7, 
    title: "It's slow to understand what changed before an incident", 
    group: 'Incident Analysis & Resolution' 
  },
  
  // Monitoring & Anomaly Detection
  { 
    id: 8, 
    title: 'Anomalies in system metrics are discovered too late (CPU, I/O, memory, storage, responsiveness, locks, rows read)', 
    group: 'Monitoring & Anomaly Detection' 
  },
  { 
    id: 9, 
    title: 'Forecasting and capacity planning are unreliable', 
    group: 'Monitoring & Anomaly Detection' 
  },
  
  // Maintenance & Operations
  { 
    id: 10, 
    title: 'Deployment and upgrade processes are error-prone', 
    group: 'Maintenance & Operations' 
  },
  { 
    id: 11, 
    title: 'Log management and analysis is painful (diag.log, archive logs, etc.)', 
    group: 'Maintenance & Operations' 
  },
  { 
    id: 12, 
    title: 'Runstats and statistics often go stale without notice', 
    group: 'Maintenance & Operations' 
  },
  { 
    id: 13, 
    title: 'Table health requires constant manual effort (skew, reorg, compression, tablespaces, indexes)', 
    group: 'Maintenance & Operations' 
  },
  { 
    id: 14, 
    title: 'Scripts are scattered, fragile, and lack version control', 
    group: 'Maintenance & Operations' 
  },
  { 
    id: 15, 
    title: 'Support tickets and diagnostic data collection are tedious', 
    group: 'Maintenance & Operations' 
  },
];

export const GROUP_COLORS: Record<ProblemGroup, string> = {
  'Query Performance & Tuning': '#3b82f6',
  'Incident Analysis & Resolution': '#10b981',
  'Monitoring & Anomaly Detection': '#8b5cf6',
  'Maintenance & Operations': '#f59e0b',
  'AI Deployment': '#ec4899',
  'Db2 Workflows and Interfaces': '#06b6d4',
};
