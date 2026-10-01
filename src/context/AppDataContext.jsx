import { useEffect, useState, useCallback, useRef } from 'react';
import { api, relativeTime } from '../api/client';
import { useAuth } from './useAuth';
import { AppDataContext } from './appDataContext';

const emptyData = {
  profile: { name: '', email: '', joined: '' },
  settings: { currency: 'INR', language: 'EN', darkMode: false, glass: true },
  expenses: [],
  incomes: [],
  goals: [],
  budgets: [],
  notifications: [],
};

const joinLabel = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const toProfile = (u) => ({
  name: u.fullName || '',
  email: u.email || '',
  joined: joinLabel(u.createdAt),
});

const toSettings = (u) => ({
  currency: u.currency || 'INR',
  language: u.language || 'EN',
  darkMode: !!u.darkMode,
  glass: u.glass !== false,
});

const toExpenseLocal = (e) => ({
  id: e.id,
  name: e.name,
  amount: Number(e.amount),
  cat: e.category,
  date: e.date,
  icon: e.icon,
  iconBg: e.iconBg,
  catCls: e.catCls,
});

const toIncomeLocal = (i) => ({
  id: i.id,
  name: i.name,
  source: i.source,
  amount: Number(i.amount),
  date: i.date,
  recurring: !!i.recurring,
  freq: i.frequency || '',
  icon: i.icon,
  iconBg: i.iconBg,
});

const toNotificationLocal = (n) => ({
  id: n.id,
  title: n.title,
  message: n.message,
  time: relativeTime(n.createdAt),
  icon: n.icon,
  iconBg: n.iconBg,
  read: !!n.read,
});

export function AppDataProvider({ children }) {
  const { token, updateStoredUser } = useAuth();
  const [data, setData] = useState(emptyData);
  const [error, setError] = useState(null);
  const settingsRef = useRef(data.settings);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!data.settings.darkMode);
  }, [data.settings.darkMode]);

  useEffect(() => {
    settingsRef.current = data.settings;
  }, [data.settings]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!token) {
        setData(emptyData);
        return;
      }
      setError(null);
      try {
const [me, expenses, incomes, goals, budgets, notifications] = await Promise.all([
          api.get('/users/me'),
          api.get('/expenses'),
          api.get('/incomes'),
          api.get('/goals'),
          api.get('/budgets'),
          api.get('/notifications'),
        ]);
        setData((prev) => ({
          ...prev,
          profile: toProfile(me.data),
          settings: toSettings(me.data),
          expenses: expenses.data.map(toExpenseLocal),
          incomes: incomes.data.map(toIncomeLocal),
          goals: goals.data,
          budgets: budgets.data,
          notifications: notifications.data.map(toNotificationLocal),
        }));
        updateStoredUser(me.data);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load your data.');
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [token, updateStoredUser]);

  const refreshExpenses = useCallback(async () => {
    const res = await api.get('/expenses');
    setData((prev) => ({ ...prev, expenses: res.data.map(toExpenseLocal) }));
  }, []);

  const refreshIncomes = useCallback(async () => {
    const res = await api.get('/incomes');
    setData((prev) => ({ ...prev, incomes: res.data.map(toIncomeLocal) }));
  }, []);

  const refreshGoals = useCallback(async () => {
    const res = await api.get('/goals');
    setData((prev) => ({ ...prev, goals: res.data }));
  }, []);

  const refreshBudgets = useCallback(async () => {
    const res = await api.get('/budgets');
    setData((prev) => ({ ...prev, budgets: res.data }));
  }, []);

  const refreshNotifications = useCallback(async () => {
    const res = await api.get('/notifications');
    setData((prev) => ({ ...prev, notifications: res.data.map(toNotificationLocal) }));
  }, []);

  const run = async (fn, refresh) => {
    try {
      await fn();
      if (refresh) await refresh();
      return true;
    } catch (e) {
      setError(e.message || 'Something went wrong.');
      return false;
    }
  };

  const addExpense = (expense) =>
    run(
      () => api.post('/expenses', { ...expense, category: expense.cat, cat: undefined }),
      refreshExpenses,
    );

  const updateExpense = (id, patch) =>
    run(
      () => api.put(`/expenses/${id}`, { ...patch, category: patch.cat, cat: undefined }),
      refreshExpenses,
    );

  const deleteExpense = (id) => run(() => api.delete(`/expenses/${id}`), refreshExpenses);

  const addIncome = (income) =>
    run(
      () => api.post('/incomes', { ...income, frequency: income.freq || null, freq: undefined }),
      refreshIncomes,
    );

  const updateIncome = (id, patch) =>
    run(
      () => api.put(`/incomes/${id}`, { ...patch, frequency: patch.freq || null, freq: undefined }),
      refreshIncomes,
    );

  const deleteIncome = (id) => run(() => api.delete(`/incomes/${id}`), refreshIncomes);

  const addGoal = (goal) => run(() => api.post('/goals', goal), refreshGoals);

  const updateGoal = (id, patch) => run(() => api.put(`/goals/${id}`, patch), refreshGoals);

  const deleteGoal = (id) => run(() => api.delete(`/goals/${id}`), refreshGoals);

  const addBudget = (budget) =>
    run(async () => {
      await api.post('/budgets', budget);
    }, () => Promise.all([refreshBudgets(), refreshNotifications()]));

  const updateBudget = (id, patch) =>
    run(async () => {
      await api.put(`/budgets/${id}`, patch);
    }, () => Promise.all([refreshBudgets(), refreshNotifications()]));

  const deleteBudget = (id) => run(() => api.delete(`/budgets/${id}`), refreshBudgets);

  const updateProfile = (patch) =>
    run(async () => {
      const res = await api.put('/users/me', { fullName: patch.name, email: patch.email });
      updateStoredUser(res.data);
      setData((prev) => ({ ...prev, profile: toProfile(res.data) }));
    });

  const updateSettings = (patch) =>
    run(async () => {
      const merged = { ...settingsRef.current, ...patch };
      const res = await api.put('/users/me/settings', merged);
      updateStoredUser(res.data);
      setData((prev) => ({ ...prev, settings: toSettings(res.data) }));
    });

  const changePassword = async (currentPassword, newPassword) => {
    await api.put('/users/me/password', { currentPassword, newPassword });
  };

  const markNotificationRead = (id) =>
    run(() => api.patch(`/notifications/${id}/read`, {}), refreshNotifications);

  const markAllNotificationsRead = () =>
    run(() => api.patch('/notifications/read-all', {}), refreshNotifications);

  const value = {
    data,
    error,
    dismissError: () => setError(null),
    addExpense,
    updateExpense,
    deleteExpense,
    addIncome,
    updateIncome,
    deleteIncome,
    addGoal,
    updateGoal,
    deleteGoal,
    addBudget,
    updateBudget,
    deleteBudget,
    updateProfile,
    updateSettings,
    changePassword,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}