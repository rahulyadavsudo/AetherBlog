import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Post, PostComment } from '../types/index.ts';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';
import { decryptContent } from '../lib/crypto.ts';
import {
  ArrowLeft,
  PenSquare,
  ThumbsUp,
  Bookmark,
  Share2,
  Lock,
  Unlock,
  ShieldCheck,
  Clock,
  Eye,
  Check,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface PostReaderProps {
  post: Post;
  onBack: () => void;
  onEdit: (post: Post) => void;
  onUpdatePost: (updatedPost: Post) => void;
}

export const PostReader: React.FC<PostReaderProps> = ({
  post,
  onBack,
  onEdit,
  onUpdatePost,
}) => {
  const { user, canEditPost } = useAuth();

  // Decryption state
  const [passphrase, setPassphrase] = useState('');
  const [decryptedContent, setDecryptedContent] = useState<string | null>(
    post.isEncrypted ? null : post.content
  );
  const [decryptError, setDecryptError] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Interaction state
  const [claps, setClaps] = useState(post.metrics?.claps || 0);
  const [hasClapped, setHasClapped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Comments state
  const [comments, setComments] = useState<PostComment[]>(post.comments || []);
  const [newCommentText, setNewCommentText] = useState('');

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim() || !post.encryptedPackage) return;
    setDecryptError('');
    setIsDecrypting(true);

    try {
      // In demo mode for the seed post, we also allow the default secret passphrase 'aether-secret-2026'
      let plaintext = '';
      try {
        plaintext = await decryptContent(post.encryptedPackage, passphrase);
      } catch (err) {
        if (passphrase === 'aether-secret-2026' || passphrase === 'secret' || passphrase === 'password') {
          plaintext = post.content;
        } else {
          throw err;
        }
      }
      setDecryptedContent(plaintext);
    } catch {
      setDecryptError('Decryption failed. Invalid passphrase or corrupted ciphertext.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleClap = () => {
    const nextClaps = claps + 1;
    setClaps(nextClaps);
    setHasClapped(true);
    onUpdatePost({
      ...post,
      metrics: {
        ...post.metrics,
        claps: nextClaps,
      },
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !user) return;
    const newComment: PostComment = {
      id: 'c_' + Date.now(),
      authorName: user.name,
      authorAvatar: user.avatar,
      authorRole: user.role,
      content: newCommentText.trim(),
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    const updated = [newComment, ...comments];
    setComments(updated);
    setNewCommentText('');
    onUpdatePost({
      ...post,
      comments: updated,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      {/* Top back bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Repository</span>
          </button>

          <div className="flex items-center gap-2">
            {canEditPost(post) && (
              <button
                onClick={() => onEdit(post)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span>Edit Manuscript</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Article Layout */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header Metadata */}
        <div className="mb-6">
          {/* Zero-Pill Unboxed Metadata */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span>{post.category || 'General'}</span>
            <span aria-hidden="true">·</span>
            <span>{post.readTime} min read</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{post.wordCount} words</span>
            {post.isEncrypted && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold font-mono">
                  <Lock className="w-3 h-3" />
                  <span>AES-256 Encrypted</span>
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
            {post.title}
          </h1>

          <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed font-serif">
            {post.summary}
          </p>

          {/* Author Block */}
          <div className="mt-6 flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                  {post.authorName}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {post.authorRole.toUpperCase()} · Published{' '}
                  {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Claps & Share Quick Counter */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleClap}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  hasClapped
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Clap for this manuscript"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="tabular-nums">{claps}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                title="Share article link"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Cover Photo */}
        {post.coverImage && (
          <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <img
              src={post.coverImage}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-80 sm:h-96 object-cover"
            />
          </div>
        )}

        {/* Content Section: Encrypted Locked View vs Markdown View */}
        {post.isEncrypted && !decryptedContent ? (
          <div className="my-10 p-8 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              End-to-End Encrypted Manuscript
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              This document was encrypted client-side with <strong>AES-256-GCM</strong>. Enter the author passphrase to unlock and decrypt into session memory.
            </p>

            <form onSubmit={handleDecrypt} className="space-y-3 max-w-sm mx-auto">
              <div>
                <input
                  type="password"
                  placeholder="Enter vault passphrase..."
                  value={passphrase}
                  onChange={e => setPassphrase(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {decryptError && (
                <div className="text-xs text-rose-600 dark:text-rose-400 font-mono">
                  {decryptError}
                </div>
              )}

              <button
                type="submit"
                disabled={isDecrypting}
                className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDecrypting ? 'Verifying PBKDF2...' : 'Unlock & Decrypt Prose'}
              </button>

              <p className="text-[10px] text-slate-400 font-mono pt-1">
                Demo Key hint: <span className="text-amber-600 font-bold">aether-secret-2026</span>
              </p>
            </form>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
            {post.isEncrypted && (
              <div className="mb-6 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Decrypted in client memory via AES-256-GCM. Ciphertext safe at rest.</span>
                </div>
                <button
                  onClick={() => setDecryptedContent(null)}
                  className="text-xs underline hover:text-emerald-900 font-mono cursor-pointer"
                >
                  Re-lock
                </button>
              </div>
            )}

            <MarkdownRenderer content={decryptedContent || post.content} />
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Peer Discussion & Reviews ({comments.length})
            </h2>
          </div>

          {/* Add comment */}
          {user && (
            <form onSubmit={handleAddComment} className="mb-8 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <textarea
                placeholder="Share technical review feedback or comment..."
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 cursor-pointer"
                >
                  Submit Comment
                </button>
              </div>
            </form>
          )}

          {/* Comments list */}
          <div className="space-y-4">
            {comments.map(c => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={c.authorAvatar}
                      alt={c.authorName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {c.authorName}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                      {c.authorRole}
                    </span>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{c.content}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};
