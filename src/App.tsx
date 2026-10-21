import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { ContentManager } from './components/ContentManager.tsx';
import { MarkdownEditor } from './components/MarkdownEditor.tsx';
import { PostReader } from './components/PostReader.tsx';
import { BackupManager } from './components/BackupManager.tsx';
import { ActivityLogView } from './components/ActivityLogView.tsx';
import { MicroservicesConsole } from './components/MicroservicesConsole.tsx';
import { Post, PostStatus } from './types/index.ts';
import {
  getPosts,
  savePosts,
  upsertPost,
  deletePost as removePostFromStorage,
  addActivityLog,
} from './lib/storage.ts';

type ActiveView = 'dashboard' | 'cms' | 'editor' | 'reader' | 'backups' | 'audit' | 'microservices';

function MainApp() {
  const { user, isAdmin, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ActiveView>('cms');
  const [posts, setPosts] = useState<Post[]>([]);
  const [activePost, setActivePost] = useState<Post | null>(null);

  // Load posts
  useEffect(() => {
    setPosts(getPosts());
  }, []);

  // Set default view on login based on user role
  useEffect(() => {
    if (user) {
      if (isAdmin) {
        // Admin starts at Dashboard
        setCurrentView(prev => (prev === 'cms' ? 'dashboard' : prev));
      } else {
        // Author & Editor starts directly at My Manuscripts (CMS)
        // Strictly prevent Writers from accessing Dashboard, Backups, Audit, or Microservices
        setCurrentView(prev => {
          if (prev === 'dashboard' || prev === 'backups' || prev === 'audit' || prev === 'microservices') {
            return 'cms';
          }
          return prev;
        });
      }
    }
  }, [user, isAdmin]);

  // Strict Authentication Guard:
  // If no user is authenticated, render the Login Screen immediately.
  // When a user logs out, AuthContext immediately sets user to null, returning them here.
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs">
        Initializing secure environment...
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  const handleSelectPost = (post: Post) => {
    setActivePost(post);
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditPost = (post: Post) => {
    setActivePost(post);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewPost = () => {
    setActivePost(null);
    setCurrentView('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSavePost = (updatedPost: Post) => {
    upsertPost(updatedPost);
    setPosts(getPosts());
    setActivePost(updatedPost);
    setCurrentView('cms');
  };

  const handleDeletePost = (postId: string) => {
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return;
    removePostFromStorage(postId);
    const updated = getPosts();
    setPosts(updated);

    addActivityLog({
      action: 'POST_DELETED',
      actorName: user.name,
      actorRole: user.role,
      details: `Permanently removed manuscript "${postToDelete.title}"`,
      entityId: postId,
      status: 'warning',
    });
  };

  const handleDuplicatePost = (original: Post) => {
    const duplicated: Post = {
      ...original,
      id: 'post_' + Date.now(),
      title: `${original.title} (Copy)`,
      slug: `${original.slug}-copy`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      metrics: {
        views: 0,
        uniqueVisitors: 0,
        avgReadTime: `${original.readTime}m 00s`,
        readRatio: 0,
        claps: 0,
        shares: 0,
        bookmarks: 0,
        viewsHistory: [],
        referrers: [],
        deviceBreakdown: { mobile: 50, desktop: 50, tablet: 0 },
      },
      revisions: [],
      comments: [],
    };
    upsertPost(duplicated);
    setPosts(getPosts());

    addActivityLog({
      action: 'POST_CREATED',
      actorName: user.name,
      actorRole: user.role,
      details: `Duplicated manuscript as "${duplicated.title}"`,
      entityId: duplicated.id,
      status: 'info',
    });
  };

  const handleUpdateStatus = (postId: string, newStatus: PostStatus) => {
    const target = posts.find(p => p.id === postId);
    if (!target) return;
    const updated = { ...target, status: newStatus };
    upsertPost(updated);
    setPosts(getPosts());

    addActivityLog({
      action: newStatus === 'published' ? 'POST_PUBLISHED' : 'POST_UPDATED',
      actorName: user.name,
      actorRole: user.role,
      details: `Updated status of "${target.title}" to ${newStatus}`,
      entityId: target.id,
      status: 'info',
    });
  };

  const handleDataRestored = () => {
    setPosts(getPosts());
    setCurrentView('cms');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      <div>
        <Navbar
          currentView={currentView}
          onNavigate={view => {
            // Role enforcement: Writers cannot navigate to admin-only views
            if (!isAdmin && (view === 'dashboard' || view === 'backups' || view === 'audit' || view === 'microservices')) {
              setCurrentView('cms');
              return;
            }
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNewPost={handleNewPost}
        />

        <main className="w-full">
          {/* Dashboard is strictly for Admin */}
          {currentView === 'dashboard' && isAdmin && (
            <Dashboard
              posts={posts}
              onSelectPost={handleSelectPost}
              onEditPost={handleEditPost}
              onNewPost={handleNewPost}
            />
          )}

          {/* Content CMS / My Manuscripts */}
          {currentView === 'cms' && (
            <ContentManager
              posts={posts}
              onSelectPost={handleSelectPost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onDuplicatePost={handleDuplicatePost}
              onUpdateStatus={handleUpdateStatus}
              onNewPost={handleNewPost}
            />
          )}

          {/* Markdown Editor */}
          {currentView === 'editor' && (
            <MarkdownEditor
              post={activePost}
              onSave={handleSavePost}
              onCancel={() => setCurrentView('cms')}
            />
          )}

          {/* Post Reader */}
          {currentView === 'reader' && activePost && (
            <PostReader
              post={activePost}
              onBack={() => setCurrentView('cms')}
              onEdit={handleEditPost}
              onUpdatePost={updated => {
                upsertPost(updated);
                setPosts(getPosts());
                setActivePost(updated);
              }}
            />
          )}

          {/* Microservices Cluster (Admin Only) */}
          {currentView === 'microservices' && isAdmin && (
            <MicroservicesConsole posts={posts} />
          )}

          {/* Sync & Backups (Admin Only) */}
          {currentView === 'backups' && isAdmin && (
            <BackupManager onDataRestored={handleDataRestored} />
          )}

          {/* Audit Trail (Admin Only) */}
          {currentView === 'audit' && isAdmin && <ActivityLogView />}
        </main>
      </div>

      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">AetherBlog</span>
            <span>·</span>
            <span>Microservices Core (Python NLP · Rust Crypto · Go Sync · Node)</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>AES-256-GCM Verified</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active: {user.role === 'admin' ? 'Administrator' : 'Author & Editor'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
