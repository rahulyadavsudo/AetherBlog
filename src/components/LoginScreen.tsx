import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { Shield, Lock, Users, Sparkles, ArrowRight, Sun, Moon, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types/index.ts';

export const LoginScreen: React.FC = () => {
  const { login, loginAs, register, usersList } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'quick' | 'email' | 'register'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('author');
  const [regTitle, setRegTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const ok = await login(email, password);
      if (!ok) {
        setErrorMessage('Invalid credentials. Please select one of the pre-configured accounts or register.');
      }
    } catch {
      setErrorMessage('Authentication service error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Please fill in your name and email address.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await register(regName, regEmail, regRole, regTitle);
    } catch {
      setErrorMessage('Registration error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top minimal header */}
      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            Æ
          </div>
          <span className="text-xl font-bold tracking-tight">AetherBlog</span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-400" />}
        </button>
      </div>

      {/* Main card container */}
      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left panel: Product overview & Security highlight */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 mb-6">
                <Shield className="w-4 h-4" />
                <span>Zero-Knowledge Publishing</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight leading-snug mb-4">
                Sovereign prose with end-to-end encryption.
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                AetherBlog is built for writers, editors, and research collectives. Draft markdown cooperatively, track granular engagement metrics, and secure sensitive texts with client-side AES-256-GCM.
              </p>

              <div className="space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time co-authoring with multi-cursor presence</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Personalized author telemetry & read-depth ratios</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Automated revision sync & encrypted vault export</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Strict role-based access control & audit trail</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Security Tier: AES-256-GCM</span>
              <span>PBKDF2-100K</span>
            </div>
          </div>

          {/* Right panel: Login tabs and form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            {/* Tab switchers */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-6">
              <button
                onClick={() => {
                  setActiveTab('quick');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'quick'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Instant Access Profiles
              </button>
              <button
                onClick={() => {
                  setActiveTab('email');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'email'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                }}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Register
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Quick Profiles Tab */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Select a pre-configured role to immediately enter the authenticated workspace:
                </div>

                <div className="space-y-2.5">
                  {usersList.map(u => (
                    <button
                      key={u.id}
                      onClick={() => loginAs(u)}
                      className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {u.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {u.title}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                            u.role === 'admin'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                              : u.role === 'editor'
                              ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {u.role}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-indigo-500 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Email / Password Sign In */}
            {activeTab === 'email' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="elena@aetherblog.internal"
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 text-center">
                  Tip: You can use any default email (e.g. <span className="font-mono text-indigo-500">elena@aetherblog.internal</span>) or select from the Quick Profiles tab.
                </p>
              </form>
            )}

            {/* Custom Account Registration */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Dr. Julian Vance"
                    required
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="julian@university.edu"
                    required
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value as UserRole)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="author">Author (Create & Track)</option>
                      <option value="editor">Editor (Publish & Review)</option>
                      <option value="admin">Admin (Full Control)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Title / Specialty
                    </label>
                    <input
                      type="text"
                      value={regTitle}
                      onChange={e => setRegTitle(e.target.value)}
                      placeholder="Senior Contributor"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Provisioning...' : 'Create Account & Enter'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer quiet branding */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 dark:text-slate-600">
        AetherBlog &copy; 2026. Zero telemetry · Client-Side Cryptographic Vault.
      </footer>
    </div>
  );
};
