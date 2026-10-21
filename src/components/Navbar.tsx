import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import {
  Sun,
  Moon,
  LogOut,
  Shield,
  FileText,
  BarChart3,
  PenSquare,
  Database,
  History,
  Cpu,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { UserRole } from '../types/index.ts';

interface NavbarProps {
  currentView: 'dashboard' | 'cms' | 'editor' | 'backups' | 'audit' | 'microservices' | 'reader';
  onNavigate: (view: 'dashboard' | 'cms' | 'editor' | 'backups' | 'audit' | 'microservices') => void;
  onNewPost: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onNewPost }) => {
  const { user, isAdmin, logout, switchRole, usersList, loginAs } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate(isAdmin ? 'dashboard' : 'cms')}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                Æ
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  AetherBlog
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Microservices v2
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Strict Admin-only gating for Dashboard, Sync, and Audit) */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            {/* Dashboard is ONLY accessible to Admin */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                  currentView === 'dashboard'
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                    : ''
                }`}
              >
                Dashboard
              </button>
            )}

            {/* Content CMS is available to both Admin and Writers */}
            <button
              onClick={() => onNavigate('cms')}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                currentView === 'cms'
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                  : ''
              }`}
            >
              {isAdmin ? 'Content CMS' : 'My Manuscripts'}
            </button>

            {/* Admin-only: Microservices Cluster Console */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('microservices')}
                className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                  currentView === 'microservices'
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                    : ''
                }`}
              >
                Microservices (Py/Rust/Go)
              </button>
            )}

            {/* Admin-only: Automated Sync & Backups */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('backups')}
                className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                  currentView === 'backups'
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                    : ''
                }`}
              >
                Sync & Backups
              </button>
            )}

            {/* Admin-only: Audit Trail */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('audit')}
                className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer pb-1 ${
                  currentView === 'audit'
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold border-b-2 border-indigo-600 dark:border-indigo-400'
                    : ''
                }`}
              >
                Audit Trail
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions & User Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* New Post CTA Button (available to all authenticated users) */}
            <button
              onClick={onNewPost}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5" />
              <span>Write Post</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* User Profile & Role Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-700"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400">
                    {user.role === 'admin' ? 'Administrator' : 'Author & Editor'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 text-xs z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Privilege:</span>
                      <span className="uppercase font-bold text-indigo-600 dark:text-indigo-400">
                        {user.role === 'admin' ? 'Admin (Full Access)' : 'Author & Editor'}
                      </span>
                    </div>
                  </div>

                  {/* Switch demo accounts easily */}
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Switch Role Profile
                    </span>
                    <div className="mt-1.5 space-y-1">
                      {usersList.map(u => (
                        <button
                          key={u.id}
                          onClick={() => {
                            loginAs(u);
                            setProfileDropdownOpen(false);
                            onNavigate(u.role === 'admin' ? 'dashboard' : 'cms');
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            u.id === user.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span className="truncate">{u.name}</span>
                          <span className="text-[10px] uppercase font-mono text-slate-400">
                            {u.role === 'admin' ? 'Admin' : 'Author & Editor'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role Override Simulation */}
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Toggle Active Role
                    </span>
                    <div className="mt-1.5 flex gap-1">
                      <button
                        onClick={() => {
                          switchRole('admin');
                          onNavigate('dashboard');
                        }}
                        className={`flex-1 px-2 py-1 rounded text-[10px] uppercase font-medium cursor-pointer transition-colors text-center ${
                          user.role === 'admin'
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => {
                          switchRole('writer');
                          onNavigate('cms');
                        }}
                        className={`flex-1 px-2 py-1 rounded text-[10px] uppercase font-medium cursor-pointer transition-colors text-center ${
                          user.role === 'writer'
                            ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Author & Editor
                      </button>
                    </div>
                  </div>

                  {/* Logout Button: redirects immediately to login view */}
                  <div className="px-2 pt-1.5">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out & Lock Vault</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2">
          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span>Dashboard (Admin Only)</span>
            </button>
          )}

          <button
            onClick={() => {
              onNavigate('cms');
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>{isAdmin ? 'Content CMS' : 'My Manuscripts'}</span>
          </button>

          <button
            onClick={() => {
              onNewPost();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg"
          >
            <PenSquare className="w-4 h-4" />
            <span>Write New Post</span>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => {
                  onNavigate('microservices');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>Microservices (Py/Rust/Go)</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('backups');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Database className="w-4 h-4 text-indigo-500" />
                <span>Sync & Backups (Admin Only)</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('audit');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <History className="w-4 h-4 text-indigo-500" />
                <span>Audit Trail (Admin Only)</span>
              </button>
            </>
          )}

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Immediately</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
