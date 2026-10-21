import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { Post, PostStatus } from '../types/index.ts';
import {
  Search,
  Filter,
  PenSquare,
  Lock,
  Trash2,
  Copy,
  Download,
  Eye,
  CheckCircle,
  MoreVertical,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ContentManagerProps {
  posts: Post[];
  onSelectPost: (post: Post) => void;
  onEditPost: (post: Post) => void;
  onDeletePost: (postId: string) => void;
  onDuplicatePost: (post: Post) => void;
  onUpdateStatus: (postId: string, newStatus: PostStatus) => void;
  onNewPost: () => void;
}

export const ContentManager: React.FC<ContentManagerProps> = ({
  posts,
  onSelectPost,
  onEditPost,
  onDeletePost,
  onDuplicatePost,
  onUpdateStatus,
  onNewPost,
}) => {
  const { user, canEditPost, canDeletePost, canPublish } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(user?.role === 'writer' ? 'my-posts' : 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'updated' | 'views' | 'title'>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [actionMenuPostId, setActionMenuPostId] = useState<string | null>(null);

  // Extract unique categories
  const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));

  // Filter posts
  const filteredPosts = posts
    .filter(p => {
      // My posts tab
      if (activeTab === 'my-posts' && p.authorId !== user?.id) return false;

      // Status tab
      if (activeTab === 'published' && p.status !== 'published') return false;
      if (activeTab === 'draft' && p.status !== 'draft') return false;
      if (activeTab === 'archived' && p.status !== 'archived') return false;
      if (activeTab === 'encrypted' && !p.isEncrypted) return false;

      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSummary = p.summary.toLowerCase().includes(q);
        const matchesAuthor = p.authorName.toLowerCase().includes(q);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesAuthor && !matchesTags) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'views') {
        return (b.metrics?.views || 0) - (a.metrics?.views || 0);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const exportMarkdown = (post: Post) => {
    const blob = new Blob([post.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${post.slug || 'article'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {user?.role === 'writer' ? 'My Blog Manuscripts & Editor' : 'Manuscript & Content Repository'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.role === 'writer'
              ? 'Compose, edit, and publish your blog posts with real-time markdown and peer collaboration.'
              : 'Authoritative catalog of drafts, published articles, and encrypted archival packages.'}
          </p>
        </div>

        <button
          onClick={onNewPost}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <PenSquare className="w-4 h-4" />
          <span>Compose New Manuscript</span>
        </button>
      </div>

      {/* Control bar: Tabs + Search + Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status segmented tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium overflow-x-auto">
          {[
            ...(user?.role === 'writer' ? [{ id: 'my-posts', label: 'My Manuscripts' }] : []),
            { id: 'all', label: user?.role === 'writer' ? 'All Publications' : 'All Articles' },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
            { id: 'encrypted', label: 'Encrypted' },
            { id: 'archived', label: 'Archived' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, tag, or author..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Disciplines</option>
            {categories.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="updated">Recently Updated</option>
            <option value="views">Most Read</option>
            <option value="title">Alphabetical</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zero results state */}
      {filteredPosts.length === 0 && (
        <div className="p-12 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            No articles match the current filter or search criteria.
          </p>
          <button
            onClick={onNewPost}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white cursor-pointer"
          >
            Compose New Post
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map(post => {
            const editable = canEditPost(post);
            const deletable = canDeletePost(post);

            return (
              <div
                key={post.id}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Image Cover or Fallback Banner */}
                <div className="h-44 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-200 to-indigo-100 dark:from-slate-800 dark:to-indigo-950/40 text-slate-400">
                      <Sparkles className="w-8 h-8 opacity-40" />
                    </div>
                  )}

                  {/* Top badges (clean unobtrusive status) */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold backdrop-blur-md ${
                        post.status === 'published'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : post.status === 'draft'
                          ? 'bg-slate-900/80 text-slate-300 border border-slate-700/60'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {post.status}
                    </span>

                    {post.isEncrypted && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold backdrop-blur-md bg-amber-950/80 text-amber-300 border border-amber-800/60 inline-flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        <span>AES-256</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Zero-Pill Clean Unboxed Metadata */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                      <span>{post.category || 'General'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.readTime} min read</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{post.wordCount} words</span>
                    </div>

                    <h2
                      onClick={() => onSelectPost(post)}
                      className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer line-clamp-2 leading-snug"
                    >
                      {post.title}
                    </h2>

                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {post.summary}
                    </p>
                  </div>

                  {/* Footer Author & Actions */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {post.authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectPost(post)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Read manuscript"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {editable && (
                        <button
                          onClick={() => onEditPost(post)}
                          className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                          title="Edit manuscript"
                        >
                          <PenSquare className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => exportMarkdown(post)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Download Markdown (.md)"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {deletable && (
                        <button
                          onClick={() => onDeletePost(post.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete manuscript"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="px-5 py-3">Document</th>
                  <th className="px-4 py-3">Discipline</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Word Count</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredPosts.map(post => {
                  const editable = canEditPost(post);
                  const deletable = canDeletePost(post);

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-5 py-3.5 max-w-sm truncate">
                        <button
                          onClick={() => onSelectPost(post)}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-left transition-colors cursor-pointer"
                        >
                          {post.title}
                        </button>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {post.summary}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {post.category}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={post.authorAvatar}
                            alt={post.authorName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{post.authorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            post.status === 'published'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : post.status === 'draft'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {post.status}
                        </span>
                        {post.isEncrypted && (
                          <span className="ml-1.5 text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                            E2EE
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono tabular-nums whitespace-nowrap">
                        {post.wordCount}
                      </td>
                      <td className="px-4 py-3.5 font-mono tabular-nums whitespace-nowrap font-semibold">
                        {post.metrics?.views?.toLocaleString() || 0}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => onSelectPost(post)}
                            className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            Read
                          </button>
                          {editable && (
                            <button
                              onClick={() => onEditPost(post)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => exportMarkdown(post)}
                            className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Export .md"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          {deletable && (
                            <button
                              onClick={() => onDeletePost(post.id)}
                              className="text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
