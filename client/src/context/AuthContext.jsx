import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [lang, setLang] = useState(localStorage.getItem('preferred_lang') || 'en');
  const [theme, setTheme] = useState(localStorage.getItem('preferred_theme') || 'light');
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = translations[lang] || translations.en;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('preferred_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('preferred_lang', newLang);
  };

  // Fetch demo users for the role switcher
  const fetchDemoUsers = async () => {
    try {
      const res = await fetch('/api/auth/demo-users');
      const data = await res.json();
      if (data.success) {
        setDemoUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to load demo users:', err);
    }
  };

  // Switch active demo persona
  const switchDemoUser = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/switch-demo-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_id', data.user.id);
      }
    } catch (err) {
      console.error('Error switching user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await fetchDemoUsers();
      // Default to worker_ramesh (id: 8) or first worker for instant demo experience
      const savedUserId = localStorage.getItem('user_id') || '8';
      await switchDemoUser(parseInt(savedUserId, 10));
      setLoading(false);
    };
    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        lang,
        theme,
        t,
        demoUsers,
        loading,
        changeLanguage,
        toggleTheme,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
