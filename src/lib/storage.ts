import { Post, ActivityLog, BackupSnapshot, User } from '../types/index.ts';

export const DEFAULT_USERS: User[] = [
  {
    id: 'user_admin_elena',
    name: 'Elena Rostova',
    email: 'elena@aetherblog.internal',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    role: 'admin',
    title: 'Editor-in-Chief & Lead Architect',
    bio: 'Oversees publication standards, cryptographic security audits, and systems architecture.'
  },
  {
    id: 'user_editor_marcus',
    name: 'Marcus Vance',
    email: 'marcus@aetherblog.internal',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    role: 'editor',
    title: 'Senior Managing Editor',
    bio: 'Manages peer reviews, editorial curation, and live collaborative workflows.'
  },
  {
    id: 'user_author_maya',
    name: 'Maya Lin',
    email: 'maya@aetherblog.internal',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
    role: 'author',
    title: 'Staff Research Writer',
    bio: 'Specializes in distributed databases, cryptographic consensus, and technical deep-dives.'
  }
];

const INITIAL_POST_1_CONTENT = `# Engineering Resilient Distributed Architecture

Modern web systems demand resilient architectures that gracefully handle node partitions, network jitter, and dynamic load surges. In this technical retrospective, we examine real-world strategies for scaling state across distributed topologies.

---

## 01. The Three Foundations of High Availability

When building decoupled services, architectural trade-offs determine stability:

1. **Idempotent State Mutators**: Ensure every mutation endpoint can safely replay upon transient packet drop without side effects.
2. **Backpressure Propagation**: Apply reactive streams so slow consumer nodes never overwhelm ingest buffers.
3. **Partition Tolerance**: Balance consistency against availability using tunable read/write quorums.

### System Verification Checklist

- [x] Connection pool health probes running on background workers
- [x] End-to-end payload encryption verified before disk flush
- [x] Automated rollback triggers wired to error budget thresholds
- [ ] Multi-region active-active read replication benchmarked

---

## 02. Benchmarked Latency Metrics

The following metrics reflect our P99 throughput under artificial stress:

| Cluster Node | P50 (ms) | P95 (ms) | P99 (ms) | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ap-southeast-1** | 14.2 | 28.6 | 41.2 | Optimal |
| **us-east-1** | 9.8 | 19.4 | 32.5 | Optimal |
| **eu-west-1** | 16.5 | 31.0 | 48.9 | Calibrated |

> *"Simplicity is prerequisite for reliability. Complex state coordination protocols fail in unpredictable ways during cascaded outages."*
> — Senior Distributed Systems Lead

\`\`\`typescript
// Resilient retry pipeline with bounded exponential backoff
export async function executeWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 250
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      const jitter = Math.random() * 100;
      const delay = Math.pow(2, attempt) * baseDelayMs + jitter;
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Exhausted retries");
}
\`\`\`

## 03. Conclusion

By treating every network boundary as untrusted and adopting strict client-side encryption, systems remain robust against catastrophic failures.`;

const INITIAL_POST_2_CONTENT = `# The Frontier of Autonomous Multi-Agent Reasoning

Autonomous agents coordinated through deterministic protocol contracts are redefining automated synthesis and peer reviews. This document details the security constraints and consensus mechanisms required for untrusted collaboration.

---

## Key Protocols & Governance

- **Zero-Knowledge Draft Verification**: Authors sign drafts with client keys before syncing.
- **Role Isolation**: Editors can suggest changes while authors maintain sovereign ownership.
- **Continuous Audit Log**: Every edit operation appends an immutable hash.

\`\`\`json
{
  "protocol": "Aether-E2EE-v1",
  "cipher": "AES-GCM-256",
  "consensus": "Optimistic-Concurrent-Sync",
  "auditVerification": true
}
\`\`\`

> *"When every collaborator operates with verified encryption, trust is mathematical rather than institutional."*`;

const INITIAL_POST_3_CONTENT = `# The Architecture of Prose: Markdown as an Intentional Medium

Writing is not simply the transcription of thought; it is the deliberate construction of structure. Markdown strips away the baroque clutter of word processors, leaving only hierarchy, pacing, and clarity.

---

## Why Plain Text Endures

1. **Portability**: Content written in 2004 opens cleanly in 2026 and will open in 2046.
2. **Version Control Compatibility**: Git diffs illuminate conceptual evolution line-by-line.
3. **Cognitive Focus**: Zero toolbar popups or formatting distractions during composition.

### Typographic Discipline

\`\`\`markdown
# Refined Headline
## Clean Subheading

Body prose with intentional line-height and measure (65–75 characters per line).
\`\`\`

When writers control both structure and rhythm, the clarity of argument naturally follows.`;

const SEED_POSTS: Post[] = [
  {
    id: 'post_001_distributed_systems',
    title: 'Engineering Resilient Distributed Architecture: Notes on Scale and Consistency',
    slug: 'engineering-resilient-distributed-architecture',
    summary: 'A technical retrospective on designing fault-tolerant systems, bounded backoff retry loops, and zero-downtime database migrations.',
    content: INITIAL_POST_1_CONTENT,
    coverImage: '/src/assets/images/editorial_tech_quantum_1792495931734.jpg',
    status: 'published',
    authorId: 'user_admin_elena',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    authorRole: 'admin',
    category: 'Architecture',
    tags: ['Distributed Systems', 'PostgreSQL', 'High Availability', 'Architecture'],
    publishedAt: '2026-10-18T14:30:00Z',
    createdAt: '2026-10-14T09:00:00Z',
    updatedAt: '2026-10-19T11:20:00Z',
    readTime: 6,
    wordCount: 840,
    isEncrypted: false,
    metrics: {
      views: 14280,
      uniqueVisitors: 9840,
      avgReadTime: '4m 38s',
      readRatio: 78.4,
      claps: 642,
      shares: 184,
      bookmarks: 312,
      viewsHistory: [
        { date: 'Oct 14', views: 320, reads: 240 },
        { date: 'Oct 15', views: 890, reads: 680 },
        { date: 'Oct 16', views: 2450, reads: 1920 },
        { date: 'Oct 17', views: 3820, reads: 3010 },
        { date: 'Oct 18', views: 4120, reads: 3280 },
        { date: 'Oct 19', views: 2680, reads: 2110 },
      ],
      referrers: [
        { source: 'Hacker News / Tech Aggregators', percentage: 46, count: 6568 },
        { source: 'Direct & Bookmarks', percentage: 24, count: 3427 },
        { source: 'Organic Search (Google)', percentage: 18, count: 2570 },
        { source: 'Newsletter Subscribers', percentage: 12, count: 1715 },
      ],
      deviceBreakdown: { mobile: 52, desktop: 42, tablet: 6 },
    },
    revisions: [
      {
        id: 'rev_1',
        timestamp: '2026-10-14T09:00:00Z',
        authorName: 'Elena Rostova',
        summary: 'Initial technical outline and topology notes',
        wordCount: 420,
        content: '# Engineering Resilient Distributed Architecture\n\nInitial draft notes on quorums and idempotency.',
      },
      {
        id: 'rev_2',
        timestamp: '2026-10-17T16:15:00Z',
        authorName: 'Marcus Vance',
        summary: 'Added P99 latency benchmark matrix and code sample',
        wordCount: 780,
        content: INITIAL_POST_1_CONTENT,
      },
    ],
    collaborators: [
      {
        userId: 'user_editor_marcus',
        name: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
        role: 'editor',
        color: '#6366f1',
        activeNow: true,
        cursorLine: 24,
        statusText: 'Reviewing latency table',
      },
      {
        userId: 'user_author_maya',
        name: 'Maya Lin',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
        role: 'author',
        color: '#10b981',
        activeNow: false,
        statusText: 'Last edited 2 hours ago',
      },
    ],
    comments: [
      {
        id: 'c_01',
        authorName: 'Marcus Vance',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
        authorRole: 'editor',
        content: 'The backoff jitter formula looks exceptionally clean. Let us verify the P99 numbers against the latest run before the morning newsletter release.',
        createdAt: '2026-10-18T10:14:00Z',
        resolved: false,
      },
    ],
  },
  {
    id: 'post_002_ai_systems_e2ee',
    title: 'The Frontier of Autonomous Multi-Agent Reasoning (Encrypted Draft)',
    slug: 'autonomous-multi-agent-reasoning',
    summary: 'Restricted research memo encrypted with AES-256-GCM. Requires author passphrase to unlock and inspect plaintext.',
    content: INITIAL_POST_2_CONTENT,
    coverImage: '/src/assets/images/editorial_ai_systems_1792495931449.jpg',
    status: 'draft',
    authorId: 'user_author_maya',
    authorName: 'Maya Lin',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=80',
    authorRole: 'author',
    category: 'AI & Security',
    tags: ['Multi-Agent', 'Zero-Knowledge', 'E2EE', 'Cryptography'],
    createdAt: '2026-10-17T11:00:00Z',
    updatedAt: '2026-10-19T08:45:00Z',
    readTime: 4,
    wordCount: 490,
    isEncrypted: true,
    encryptedPackage: {
      ciphertext: 'S01QTEVZX0NFTlNPX1NFQ1JFVF9DSVBIRVJURVhUX1JBTkRPTR5f67g9+321a9f0d...',
      iv: 'x891F84Ka29L1m78',
      salt: 'q9824jklmsduf813',
      algorithm: 'AES-GCM-256 / PBKDF2-SHA256',
      tagLength: 128,
      encryptedAt: '2026-10-19T08:45:00Z',
    },
    metrics: {
      views: 420,
      uniqueVisitors: 310,
      avgReadTime: '3m 12s',
      readRatio: 82.1,
      claps: 88,
      shares: 14,
      bookmarks: 49,
      viewsHistory: [
        { date: 'Oct 17', views: 80, reads: 65 },
        { date: 'Oct 18', views: 190, reads: 155 },
        { date: 'Oct 19', views: 150, reads: 120 },
      ],
      referrers: [
        { source: 'Internal Author Review', percentage: 70, count: 294 },
        { source: 'Encrypted Peer Link', percentage: 30, count: 126 },
      ],
      deviceBreakdown: { mobile: 25, desktop: 70, tablet: 5 },
    },
    revisions: [
      {
        id: 'rev_e2ee_1',
        timestamp: '2026-10-17T11:00:00Z',
        authorName: 'Maya Lin',
        summary: 'Encrypted first pass of multi-agent specification',
        wordCount: 490,
        content: INITIAL_POST_2_CONTENT,
      },
    ],
    collaborators: [
      {
        userId: 'user_admin_elena',
        name: 'Elena Rostova',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
        role: 'admin',
        color: '#f59e0b',
        activeNow: true,
        cursorLine: 8,
        statusText: 'Viewing encrypted manifest',
      },
    ],
    comments: [],
  },
  {
    id: 'post_003_writing_craft',
    title: 'The Architecture of Prose: Markdown as an Intentional Medium',
    slug: 'architecture-of-prose-markdown',
    summary: 'Why plain text remains the most future-proof format for serious literature, knowledge work, and technical communication.',
    content: INITIAL_POST_3_CONTENT,
    coverImage: '/src/assets/images/editorial_writing_craft_1792495931728.jpg',
    status: 'published',
    authorId: 'user_editor_marcus',
    authorName: 'Marcus Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
    authorRole: 'editor',
    category: 'Editorial',
    tags: ['Writing', 'Markdown', 'Productivity', 'Typography'],
    publishedAt: '2026-10-12T08:00:00Z',
    createdAt: '2026-10-10T14:20:00Z',
    updatedAt: '2026-10-12T08:00:00Z',
    readTime: 5,
    wordCount: 620,
    isEncrypted: false,
    metrics: {
      views: 8940,
      uniqueVisitors: 6210,
      avgReadTime: '5m 02s',
      readRatio: 72.8,
      claps: 512,
      shares: 98,
      bookmarks: 245,
      viewsHistory: [
        { date: 'Oct 12', views: 1820, reads: 1320 },
        { date: 'Oct 13', views: 2410, reads: 1750 },
        { date: 'Oct 14', views: 1980, reads: 1440 },
        { date: 'Oct 15', views: 1240, reads: 910 },
        { date: 'Oct 16', views: 890, reads: 650 },
        { date: 'Oct 17', views: 600, reads: 440 },
      ],
      referrers: [
        { source: 'Design & Writing Newsletters', percentage: 52, count: 4648 },
        { source: 'Direct Bookmarks', percentage: 28, count: 2503 },
        { source: 'Social Channels (X / Threads)', percentage: 20, count: 1789 },
      ],
      deviceBreakdown: { mobile: 64, desktop: 30, tablet: 6 },
    },
    revisions: [],
    collaborators: [],
    comments: [],
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log_01',
    timestamp: '2026-10-20T04:20:15Z',
    action: 'BACKUP_SYNC',
    actorName: 'System Daemon',
    actorRole: 'admin',
    details: 'Automated incremental backup snapshot verified (3 documents, 28.4 KB)',
    status: 'success',
  },
  {
    id: 'log_02',
    timestamp: '2026-10-20T03:52:10Z',
    action: 'COLLAB_JOIN',
    actorName: 'Marcus Vance',
    actorRole: 'editor',
    details: 'Joined collaborative session on "Engineering Resilient Distributed Architecture"',
    entityId: 'post_001_distributed_systems',
    status: 'info',
  },
  {
    id: 'log_03',
    timestamp: '2026-10-19T08:45:00Z',
    action: 'E2EE_ENCRYPT',
    actorName: 'Maya Lin',
    actorRole: 'author',
    details: 'Encrypted document body using AES-256-GCM / PBKDF2-SHA256 (100k rounds)',
    entityId: 'post_002_ai_systems_e2ee',
    status: 'success',
  },
  {
    id: 'log_04',
    timestamp: '2026-10-18T14:30:00Z',
    action: 'POST_PUBLISHED',
    actorName: 'Elena Rostova',
    actorRole: 'admin',
    details: 'Published "Engineering Resilient Distributed Architecture" to public index',
    entityId: 'post_001_distributed_systems',
    status: 'success',
  },
  {
    id: 'log_05',
    timestamp: '2026-10-18T09:12:00Z',
    action: 'AUTH_LOGIN',
    actorName: 'Elena Rostova',
    actorRole: 'admin',
    details: 'Successful authenticated session initiated with Admin privileges',
    status: 'info',
  },
];

const POSTS_KEY = 'aether_posts_v1';
const LOGS_KEY = 'aether_logs_v1';
const BACKUPS_KEY = 'aether_backups_v1';

export function getPosts(): Post[] {
  try {
    const raw = localStorage.getItem(POSTS_KEY);
    if (!raw) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(SEED_POSTS));
      return SEED_POSTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Storage read error, falling back to seed posts:', err);
    return SEED_POSTS;
  }
}

export function savePosts(posts: Post[]): void {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save posts to localStorage:', err);
  }
}

export function getPostById(id: string): Post | undefined {
  const posts = getPosts();
  return posts.find(p => p.id === id);
}

export function upsertPost(post: Post): void {
  const posts = getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  if (index >= 0) {
    posts[index] = { ...post, updatedAt: new Date().toISOString() };
  } else {
    posts.unshift({
      ...post,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  savePosts(posts);
}

export function deletePost(id: string): void {
  const posts = getPosts().filter(p => p.id !== id);
  savePosts(posts);
}

export function getActivityLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) {
      localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_LOGS));
      return INITIAL_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return INITIAL_LOGS;
  }
}

export function addActivityLog(
  log: Omit<ActivityLog, 'id' | 'timestamp'>
): void {
  try {
    const logs = getActivityLogs();
    const newLog: ActivityLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...log,
    };
    logs.unshift(newLog);
    // keep max 100 logs
    const trimmed = logs.slice(0, 100);
    localStorage.setItem(LOGS_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to write activity log:', err);
  }
}

export function getBackupSnapshots(): BackupSnapshot[] {
  try {
    const raw = localStorage.getItem(BACKUPS_KEY);
    if (!raw) {
      const initialSnapshot: BackupSnapshot = {
        id: 'snap_init_' + Date.now(),
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        postCount: 3,
        sizeBytes: 28410,
        hash: 'sha256-e9b41...89a2',
        autoGenerated: true,
        data: JSON.stringify(SEED_POSTS),
      };
      localStorage.setItem(BACKUPS_KEY, JSON.stringify([initialSnapshot]));
      return [initialSnapshot];
    }
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function createBackupSnapshot(autoGenerated = false): BackupSnapshot {
  const posts = getPosts();
  const serialized = JSON.stringify(posts);
  const sizeBytes = new Blob([serialized]).size;
  const hash = 'sha256-' + Math.random().toString(36).substring(2, 10) + '...' + Date.now().toString(36);
  
  const snapshot: BackupSnapshot = {
    id: 'snap_' + Date.now(),
    timestamp: new Date().toISOString(),
    postCount: posts.length,
    sizeBytes,
    hash,
    autoGenerated,
    data: serialized,
  };

  const current = getBackupSnapshots();
  current.unshift(snapshot);
  const trimmed = current.slice(0, 20); // Keep last 20 snapshots
  localStorage.setItem(BACKUPS_KEY, JSON.stringify(trimmed));

  return snapshot;
}

export function restoreBackupSnapshot(snapshotId: string): boolean {
  const snapshots = getBackupSnapshots();
  const target = snapshots.find(s => s.id === snapshotId);
  if (!target) return false;

  try {
    const restoredPosts = JSON.parse(target.data);
    savePosts(restoredPosts);
    return true;
  } catch (err) {
    console.error('Failed to parse snapshot data:', err);
    return false;
  }
}

export function exportBackupBundle(): string {
  const posts = getPosts();
  const logs = getActivityLogs();
  const bundle = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    posts,
    logs,
  };
  return JSON.stringify(bundle, null, 2);
}

export function importBackupBundle(jsonString: string): { success: boolean; count?: number; error?: string } {
  try {
    const bundle = JSON.parse(jsonString);
    if (bundle && Array.isArray(bundle.posts)) {
      savePosts(bundle.posts);
      if (Array.isArray(bundle.logs)) {
        localStorage.setItem(LOGS_KEY, JSON.stringify(bundle.logs.slice(0, 100)));
      }
      return { success: true, count: bundle.posts.length };
    }
    return { success: false, error: 'Invalid bundle format. Missing posts array.' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Corrupt JSON file' };
  }
}
