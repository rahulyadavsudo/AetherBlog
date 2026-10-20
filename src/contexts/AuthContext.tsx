import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Post } from '../types/index.ts';
import { DEFAULT_USERS, addActivityLog } from '../lib/storage.ts';

interface AuthContextType {
  user: User | null;
  usersList: User[];
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAs: (user: User) => void;
  register: (name: string, email: string, role: UserRole, title?: string) => Promise<boolean>;
  logout: () => void;
  canEditPost: (post: Post) => boolean;
  canDeletePost: (post: Post) => boolean;
  canPublish: () => boolean;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'aether_auth_user_v1';
const USERS_LIST_KEY = 'aether_all_users_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(DEFAULT_USERS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_LIST_KEY);
      if (storedUsers) {
        setUsersList(JSON.parse(storedUsers));
      } else {
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(DEFAULT_USERS));
      }

      const activeUser = localStorage.getItem(AUTH_USER_KEY);
      if (activeUser) {
        setUser(JSON.parse(activeUser));
      }
    } catch (e) {
      console.error('Failed to load auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string): Promise<boolean> => {
    const found = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setUser(found);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(found));
      addActivityLog({
        action: 'AUTH_LOGIN',
        actorName: found.name,
        actorRole: found.role,
        details: `Signed in as ${found.name} (${found.role})`,
        status: 'info',
      });
      return true;
    }
    return false;
  };

  const loginAs = (targetUser: User) => {
    setUser(targetUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(targetUser));
    addActivityLog({
      action: 'AUTH_LOGIN',
      actorName: targetUser.name,
      actorRole: targetUser.role,
      details: `Switched active profile to ${targetUser.name} (${targetUser.role})`,
      status: 'info',
    });
  };

  const register = async (name: string, email: string, role: UserRole, title?: string): Promise<boolean> => {
    const newUser: User = {
      id: 'user_' + Date.now(),
      name,
      email,
      role,
      title: title || (role === 'admin' ? 'System Administrator' : role === 'editor' ? 'Contributing Editor' : 'Author'),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80`,
      bio: 'Author on AetherBlog.',
    };

    const updated = [...usersList, newUser];
    setUsersList(updated);
    localStorage.setItem(USERS_LIST_KEY, JSON.stringify(updated));

    setUser(newUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));

    addActivityLog({
      action: 'AUTH_LOGIN',
      actorName: newUser.name,
      actorRole: newUser.role,
      details: `Registered new account as ${newUser.name} with ${newUser.role} privileges`,
      status: 'success',
    });

    return true;
  };

  const logout = () => {
    if (user) {
      addActivityLog({
        action: 'AUTH_LOGOUT',
        actorName: user.name,
        actorRole: user.role,
        details: `User ${user.name} logged out. Session terminated.`,
        status: 'info',
      });
    }
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    addActivityLog({
      action: 'ROLE_UPDATED',
      actorName: user.name,
      actorRole: newRole,
      details: `Switched operational role to ${newRole}`,
      status: 'info',
    });
  };

  const canEditPost = (post: Post): boolean => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'editor') return true;
    return post.authorId === user.id;
  };

  const canDeletePost = (post: Post): boolean => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return post.authorId === user.id;
  };

  const canPublish = (): boolean => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'editor';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        usersList,
        isLoading,
        login,
        loginAs,
        register,
        logout,
        canEditPost,
        canDeletePost,
        canPublish,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
