import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Post, PostStatus, PostRevision, Collaborator, PostComment } from '../types/index.ts';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';
import { encryptContent, decryptContent } from '../lib/crypto.ts';
import { addActivityLog } from '../lib/storage.ts';
import { runPythonAnalysis } from '../lib/microservices.ts';
import {
  Save,
  Eye,
  Columns,
  Maximize2,
  Lock,
  Unlock,
  Users,
  History,
  MessageSquare,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Minus,
  Sparkles,
  Check,
  AlertCircle,
  Clock,
  ArrowLeft,
  ShieldCheck,
  Radio,
} from 'lucide-react';

interface MarkdownEditorProps {
  post?: Post | null;
  onSave: (updatedPost: Post) => void;
  onCancel: () => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  post: initialPost,
  onSave,
  onCancel,
}) => {
  const { user, canPublish } = useAuth();

  // Document Fields
  const [title, setTitle] = useState(initialPost?.title || 'Untitled Manuscript');
  const [slug, setSlug] = useState(initialPost?.slug || 'untitled-manuscript');
  const [summary, setSummary] = useState(initialPost?.summary || '');
  const [category, setCategory] = useState(initialPost?.category || 'Architecture');
  const [tagsInput, setTagsInput] = useState(initialPost?.tags?.join(', ') || 'Markdown, Engineering');
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || '');
  const [status, setStatus] = useState<PostStatus>(initialPost?.status || 'draft');
  const [content, setContent] = useState(initialPost?.content || '# Untitled\n\nBegin composing your thoughts here...');

  // View state: 'split' | 'edit' | 'preview'
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // E2EE state
  const [isEncrypted, setIsEncrypted] = useState(initialPost?.isEncrypted || false);
  const [showEncryptModal, setShowEncryptModal] = useState(false);
  const [encryptionPassphrase, setEncryptionPassphrase] = useState('');
  const [encryptionStatusMsg, setEncryptionStatusMsg] = useState('');
  const [encryptedPackage, setEncryptedPackage] = useState(initialPost?.encryptedPackage);
  const [isDecryptedInSession, setIsDecryptedInSession] = useState(false);

  // Revisions & History
  const [revisions, setRevisions] = useState<PostRevision[]>(initialPost?.revisions || []);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Collaborative Presence State
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    initialPost?.collaborators || [
      {
        userId: 'user_editor_marcus',
        name: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
        role: 'editor',
        color: '#6366f1',
        activeNow: true,
        cursorLine: 12,
        statusText: 'Reviewing section 2',
      },
    ]
  );
  const [isSimulatingCollaboration, setIsSimulatingCollaboration] = useState(true);
  const [comments, setComments] = useState<PostComment[]>(initialPost?.comments || []);
  const [newCommentText, setNewCommentText] = useState('');
  const [showCommentsSidebar, setShowCommentsSidebar] = useState(false);
  // Python Microservice Analysis
  const [showPythonModal, setShowPythonModal] = useState(false);
  const [isAnalyzingPython, setIsAnalyzingPython] = useState(false);
  const [pythonResults, setPythonResults] = useState<any | null>(null);

  const handleRunPythonAnalysis = async () => {
    setIsAnalyzingPython(true);
    setShowPythonModal(true);
    try {
      const res = await runPythonAnalysis(content);
      setPythonResults(res);
    } finally {
      setIsAnalyzingPython(false);
    }
  };

  // Autosave and metrics computation
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isSaving, setIsSaving] = useState(false);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialPost) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated || 'untitled');
    }
  }, [title, initialPost]);

  // Simulated live co-author typing
  useEffect(() => {
    if (!isSimulatingCollaboration) return;

    const interval = setInterval(() => {
      setCollaborators(prev =>
        prev.map(c => {
          if (c.activeNow) {
            const nextLine = Math.floor(Math.random() * 20) + 1;
            return { ...c, cursorLine: nextLine };
          }
          return c;
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulatingCollaboration]);

  // Markdown formatting helpers
  const applyFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const replacement = prefix + (selectedText || 'text') + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 50);
  };

  const insertTable = () => {
    const tableTemplate = `\n| Metric | P50 (ms) | P99 (ms) | Status |\n| :--- | :--- | :--- | :--- |\n| Ingest Cluster | 12.4 | 34.2 | Active |\n| Replication Pool | 8.1 | 22.0 | Synchronized |\n\n`;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const newContent = content.substring(0, pos) + tableTemplate + content.substring(pos);
    setContent(newContent);
  };

  // E2EE Encryption Handler
  const handleApplyEncryption = async () => {
    if (!encryptionPassphrase.trim()) {
      setEncryptionStatusMsg('Please provide a secure passphrase.');
      return;
    }

    try {
      setEncryptionStatusMsg('Deriving AES-256 key via PBKDF2 (100k iterations)...');
      const pkg = await encryptContent(content, encryptionPassphrase);
      setEncryptedPackage(pkg);
      setIsEncrypted(true);
      setIsDecryptedInSession(true);
      setEncryptionStatusMsg('');
      setShowEncryptModal(false);

      if (user) {
        addActivityLog({
          action: 'E2EE_ENCRYPT',
          actorName: user.name,
          actorRole: user.role,
          details: `Encrypted manuscript "${title}" using AES-GCM-256`,
          entityId: initialPost?.id,
          status: 'success',
        });
      }
    } catch (err: any) {
      setEncryptionStatusMsg(err.message || 'Encryption failed.');
    }
  };

  const handleRemoveEncryption = () => {
    setIsEncrypted(false);
    setEncryptedPackage(undefined);
    setEncryptionPassphrase('');
    if (user) {
      addActivityLog({
        action: 'E2EE_DECRYPT',
        actorName: user.name,
        actorRole: user.role,
        details: `Decrypted manuscript "${title}" back to plaintext`,
        entityId: initialPost?.id,
        status: 'info',
      });
    }
  };

  // Save Post
  const handleSave = () => {
    if (!user) return;
    setIsSaving(true);

    const now = new Date().toISOString();
    const newRevision: PostRevision = {
      id: 'rev_' + Date.now(),
      timestamp: now,
      authorName: user.name,
      summary: `Revision snapshot by ${user.name} (${wordCount} words)`,
      wordCount,
      content,
    };

    const tagsArray = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const updated: Post = {
      id: initialPost?.id || 'post_' + Date.now(),
      title,
      slug: slug || 'article',
      summary: summary || title,
      content,
      coverImage: coverImage || initialPost?.coverImage || '/src/assets/images/editorial_tech_quantum_1792495931734.jpg',
      status,
      authorId: initialPost?.authorId || user.id,
      authorName: initialPost?.authorName || user.name,
      authorAvatar: initialPost?.authorAvatar || user.avatar,
      authorRole: initialPost?.authorRole || user.role,
      category: category || 'Architecture',
      tags: tagsArray.length > 0 ? tagsArray : ['Markdown', 'Editorial'],
      publishedAt: status === 'published' ? initialPost?.publishedAt || now : undefined,
      createdAt: initialPost?.createdAt || now,
      updatedAt: now,
      readTime,
      wordCount,
      isEncrypted,
      encryptedPackage: isEncrypted ? encryptedPackage : undefined,
      metrics: initialPost?.metrics || {
        views: 0,
        uniqueVisitors: 0,
        avgReadTime: `${readTime}m 00s`,
        readRatio: 80,
        claps: 0,
        shares: 0,
        bookmarks: 0,
        viewsHistory: [{ date: 'Today', views: 1, reads: 1 }],
        referrers: [{ source: 'Direct Preview', percentage: 100, count: 1 }],
        deviceBreakdown: { mobile: 50, desktop: 50, tablet: 0 },
      },
      revisions: [newRevision, ...revisions.slice(0, 19)],
      collaborators,
      comments,
    };

    onSave(updated);

    addActivityLog({
      action: initialPost ? (status === 'published' ? 'POST_PUBLISHED' : 'POST_UPDATED') : 'POST_CREATED',
      actorName: user.name,
      actorRole: user.role,
      details: `${initialPost ? 'Updated' : 'Created'} manuscript "${title}" [${status}]`,
      entityId: updated.id,
      status: 'success',
    });

    setLastSavedTime(new Date().toLocaleTimeString());
    setRevisions([newRevision, ...revisions]);
    setTimeout(() => setIsSaving(false), 300);
  };

  const handleAddComment = () => {
    if (!newCommentText.trim() || !user) return;
    const newComment: PostComment = {
      id: 'comm_' + Date.now(),
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: user.role,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    setComments([newComment, ...comments]);
    setNewCommentText('');
  };

  const handleRestoreRevision = (rev: PostRevision) => {
    setContent(rev.content);
    setShowHistoryModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Header Toolbar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          {/* Back & Document Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Return to content repository"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter document title..."
                className="text-base sm:text-lg font-bold bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1.5 py-0.5 max-w-xs sm:max-w-md truncate"
              />
              <span className="hidden md:inline-block text-xs font-mono text-slate-400 dark:text-slate-500">
                /{slug}
              </span>
            </div>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Live Co-Authors Badge */}
            <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="flex -space-x-1.5 overflow-hidden">
                {collaborators.map(c => (
                  <img
                    key={c.userId}
                    src={c.avatar}
                    alt={c.name}
                    title={`${c.name} (${c.role}) - ${c.statusText || 'Active'}`}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 object-cover"
                  />
                ))}
              </div>
              <button
                onClick={() => setIsSimulatingCollaboration(!isSimulatingCollaboration)}
                className={`text-[11px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                  isSimulatingCollaboration
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Toggle live multi-cursor presence simulation"
              >
                <Radio className={`w-3 h-3 ${isSimulatingCollaboration ? 'animate-pulse' : ''}`} />
                <span>{isSimulatingCollaboration ? 'Live Sync' : 'Offline'}</span>
              </button>
            </div>

            {/* E2EE Lock Toggle Button */}
            <button
              onClick={() => {
                if (isEncrypted) {
                  handleRemoveEncryption();
                } else {
                  setShowEncryptModal(true);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                isEncrypted
                  ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title={isEncrypted ? 'End-to-End Encrypted (AES-256-GCM)' : 'Encrypt draft with AES-256'}
            >
              {isEncrypted ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isEncrypted ? 'E2EE Active' : 'Encrypt'}</span>
            </button>

            {/* Python NLP Analysis Button */}
            <button
              onClick={handleRunPythonAnalysis}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
              title="Analyze text with Python NLP microservice"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Python NLP</span>
            </button>

            {/* Revisions History Drawer Toggle */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Revision timeline"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Collaborative Comments Drawer Toggle */}
            <button
              onClick={() => setShowCommentsSidebar(!showCommentsSidebar)}
              className={`relative p-1.5 rounded-lg transition-colors cursor-pointer ${
                showCommentsSidebar
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Peer review comments"
            >
              <MessageSquare className="w-4 h-4" />
              {comments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {comments.length}
                </span>
              )}
            </button>

            {/* Status Selector */}
            <select
              value={status}
              onChange={e => setStatus(e.target.value as PostStatus)}
              className="text-xs font-medium px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="draft">Draft</option>
              {canPublish() && <option value="published">Published</option>}
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>

            {/* Primary Save / Publish Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : status === 'published' ? 'Publish' : 'Save Draft'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Markdown Toolbar */}
      <div className="bg-slate-100/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => applyFormatting('**', '**')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Bold (**text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('*', '*')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Italic (*text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              onClick={() => applyFormatting('# ')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Heading 1"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('## ')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Heading 2"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('### ')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Heading 3"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              onClick={() => applyFormatting('> ')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('`', '`')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Inline Code (`code`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('```typescript\n', '\n```')}
              className="px-2 py-1 text-[11px] font-mono rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Fenced Code Block"
            >
              ```ts
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              onClick={() => applyFormatting('- ')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('1. ')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Ordered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('- [ ] ')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Task Checklist"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              onClick={() => applyFormatting('[', '](https://example.com)')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('![Architecture](', ')')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Insert Image"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={insertTable}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Insert Markdown Table"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => applyFormatting('\n---\n')}
              className="p-1.5 rounded hover:bg-white dark:hover:bg-slate-800 cursor-pointer"
              title="Horizontal Divider"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Split Mode Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Live Preview
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace (Editor + Preview + Comments Sidebar) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Editor & Preview Column (8 or 12 cols depending on sidebar) */}
        <div className={`${showCommentsSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col gap-4`}>
          {/* Metadata Accordion Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Category / Discipline</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Architecture, AI Systems..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="Distributed, Security, Markdown"
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">One-sentence Summary</label>
              <input
                type="text"
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Brief abstract for social cards & RSS..."
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Active Workspace Viewport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[560px]">
            {/* Editor Pane */}
            {(viewMode === 'edit' || viewMode === 'split') && (
              <div
                className={`relative flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${
                  viewMode === 'edit' ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-400">
                  <span>Markdown Raw Source</span>
                  <div className="flex items-center gap-2">
                    {isSimulatingCollaboration && (
                      <span className="flex items-center gap-1 text-[11px] text-indigo-500 font-sans">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                        Marcus is editing line 12
                      </span>
                    )}
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Draft your markdown manuscript here..."
                  className="flex-1 w-full p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-900 dark:text-slate-100 bg-transparent resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>
            )}

            {/* Live Markdown Preview Pane */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div
                className={`flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${
                  viewMode === 'preview' ? 'md:col-span-2' : ''
                }`}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-400">
                  <span>Live Rendered Prose</span>
                  <span>{readTime} min read</span>
                </div>
                <div className="flex-1 p-6 overflow-y-auto max-h-[700px]">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collaborative Feedback & Comments Sidebar (4 cols when open) */}
        {showCommentsSidebar && (
          <div className="lg:col-span-4 flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 h-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Peer Review & Notes
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">{comments.length} notes</span>
            </div>

            {/* New Comment Input */}
            <div className="mb-4">
              <textarea
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Leave feedback on this section..."
                rows={2}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleAddComment}
                disabled={!newCommentText.trim()}
                className="mt-2 w-full py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer"
              >
                Post Review Note
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No review notes yet. Collaborators can leave remarks during peer review.
                </div>
              ) : (
                comments.map(c => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={c.authorAvatar}
                          alt={c.authorName}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {c.authorName}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono text-indigo-500 font-bold">
                        {c.authorRole}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats & Status Bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-2.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 font-mono tabular-nums">
            <span>{wordCount} words</span>
            <span>·</span>
            <span>{charCount} characters</span>
            <span>·</span>
            <span>~{readTime} min read</span>
            {isEncrypted && (
              <>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-sans font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AES-256-GCM Vault</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>Synced: {lastSavedTime}</span>
          </div>
        </div>
      </div>

      {/* Encryption Passphrase Modal */}
      {showEncryptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 mb-3">
              <Lock className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                End-to-End Encrypt Manuscript
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Your manuscript content will be encrypted client-side using <strong>AES-256-GCM</strong> with 100,000 PBKDF2 rounds. Stored ciphertext cannot be decrypted without this passphrase.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vault Passphrase
              </label>
              <input
                type="password"
                value={encryptionPassphrase}
                onChange={e => setEncryptionPassphrase(e.target.value)}
                placeholder="Enter passphrase..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {encryptionStatusMsg && (
              <div className="mb-4 text-xs text-amber-600 dark:text-amber-400 font-mono">
                {encryptionStatusMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setShowEncryptModal(false);
                  setEncryptionStatusMsg('');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyEncryption}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow cursor-pointer"
              >
                Lock & Encrypt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Revision Timeline & Rollback
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {revisions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No prior revisions recorded. Revisions are created every time you save.
                </div>
              ) : (
                revisions.map((rev, idx) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {rev.summary}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {new Date(rev.timestamp).toLocaleString()} · {rev.wordCount} words
                      </div>
                    </div>

                    <button
                      onClick={() => handleRestoreRevision(rev)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors cursor-pointer"
                    >
                      Rollback
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Python Microservice NLP Analysis Modal */}
      {showPythonModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Python NLP Readability & Metrics
                </h3>
              </div>
              <button
                onClick={() => setShowPythonModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Close
              </button>
            </div>

            {isAnalyzingPython ? (
              <div className="py-12 text-center text-xs text-slate-500 font-mono">
                Dispatching manuscript payload to Python 3.10 microservice...
              </div>
            ) : pythonResults ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 block mb-0.5">Flesch-Kincaid Level</span>
                    <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {pythonResults.reading_grade}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 block mb-0.5">Sentiment Tone</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {pythonResults.sentiment}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 block mb-0.5">Lexical Diversity (TTR)</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {pythonResults.lexical_diversity}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 block mb-0.5">Execution Roundtrip</span>
                    <span className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                      {pythonResults.latency_ms} ms
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="text-slate-500 block mb-1.5 font-medium">Top Keywords Extracted by Python:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {pythonResults.top_keywords.map((kw: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded font-mono text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-[11px] font-mono text-slate-400 text-right">
                  Runtime: {pythonResults.engine}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
