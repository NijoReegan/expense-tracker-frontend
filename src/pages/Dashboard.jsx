import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAppData } from '../context/useAppData';
import { formatDate, money } from '../utils/format';
import { categories } from '../constants/categories';

const emptyForm = { name: '', amount: '', cat: '', type: 'expense' };

const inMonth = (iso, year, monthIdx) => {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() === monthIdx;
};

const getLastNMonths = (n) => {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), year: d.getFullYear(), month: d.getMonth() });
  }
  return months;
};

const catColors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-primary-container', 'bg-error', 'bg-secondary-container'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, addExpense, addIncome, deleteExpense, deleteIncome } = useAppData();
  const currency = data.settings.currency;
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const now = new Date();

  const totalIncome = data.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = data.expenses.reduce((s, e) => s + e.amount, 0);

  const monthIncome = data.incomes.filter((i) => inMonth(i.date, now.getFullYear(), now.getMonth())).reduce((s, i) => s + i.amount, 0);
  const monthExpenses = data.expenses.filter((e) => inMonth(e.date, now.getFullYear(), now.getMonth())).reduce((s, e) => s + e.amount, 0);

  const totalSaved = data.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = data.goals.reduce((s, g) => s + g.targetAmount, 0);
  const goalPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const balance = totalIncome - totalExpenses;

  const summaryCards = useMemo(() => [
    {
      label: 'Total Balance',
      value: money(balance, currency),
      icon: 'account_balance_wallet',
      iconBg: 'bg-primary/10 text-primary',
    },
    {
      label: 'Income',
      value: money(monthIncome, currency),
      icon: 'trending_up',
      iconBg: 'bg-secondary/10 text-secondary',
    },
    {
      label: 'Expenses',
      value: money(monthExpenses, currency),
      icon: 'trending_down',
      iconBg: 'bg-error/10 text-error',
    },
    {
      label: 'Savings Goal',
      value: money(totalSaved, currency),
      icon: 'savings',
      iconBg: 'bg-tertiary-container/10 text-tertiary',
      badge: totalTarget > 0 ? `${goalPct}%` : null,
      badgeCls: 'text-on-surface-variant font-label-caps',
      progress: totalTarget > 0 ? Math.min(100, goalPct) : 0,
    },
  ], [balance, monthIncome, monthExpenses, totalSaved, totalTarget, goalPct, currency]);

  const months = useMemo(() => getLastNMonths(8), []);
  const monthlyBars = useMemo(() => months.map((m) => {
    const mExpenses = data.expenses.filter((e) => inMonth(e.date, m.year, m.month)).reduce((s, e) => s + e.amount, 0);
    return mExpenses;
  }), [data.expenses, months]);

  const maxBar = Math.max(...monthlyBars, 1);
  const barPercentages = monthlyBars.map((v) => Math.round((v / maxBar) * 100) || 0);

  const byCat = useMemo(() => {
    const result = {};
    data.expenses.forEach((e) => {
      result[e.cat] = (result[e.cat] || 0) + e.amount;
    });
    return Object.entries(result).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [data.expenses]);

  const recentTransactions = useMemo(() => {
    const expTx = data.expenses.map((e) => ({
      id: 'exp-' + e.id, name: e.name, cat: e.cat, date: e.date,
      amount: -e.amount, type: 'expense', icon: e.icon, iconBg: e.iconBg,
    }));
    const incTx = data.incomes.map((i) => ({
      id: 'inc-' + i.id, name: i.name, cat: i.source || 'Income', date: i.date,
      amount: i.amount, type: 'income', icon: i.icon, iconBg: i.iconBg,
    }));
    return [...expTx, ...incTx].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }, [data.expenses, data.incomes]);

  const handleSave = () => {
    if (!form.name.trim() || !form.amount.trim()) return;
    const num = Number(form.amount);
    if (num <= 0) return;
    const dateIso = new Date().toISOString();

    if (form.type === 'income') {
      addIncome({
        name: form.name.trim(),
        source: form.cat || 'Dashboard',
        icon: 'payments',
        iconBg: 'bg-primary/10 text-primary',
        amount: num,
        date: dateIso,
        recurring: false,
        freq: '',
      });
    } else {
      addExpense({
        name: form.name.trim(),
        amount: num,
        cat: form.cat || 'Other',
        date: dateIso,
        icon: 'shopping_bag',
        iconBg: 'bg-on-surface text-surface',
        catCls: 'bg-surface-variant/50 text-outline',
      });
    }
    setModalOpen(false);
    setForm(emptyForm);
  };

  const handleDelete = () => {
    if (deleteTarget.type === 'income') {
      deleteIncome(deleteTarget.originalId);
    } else {
      deleteExpense(deleteTarget.originalId);
    }
    setDeleteTarget(null);
  };

  const withOriginalId = (tx) => ({
    ...tx,
    originalId: String(tx.id).replace(/^(exp|inc)-/, ''),
  });

  return (
    <>
      <div className="mb-8">
        <h3 className="font-headline-md text-headline-md font-bold mb-1">Financial Dashboard</h3>
        <p className="text-on-surface-variant font-body-sm">
          {data.expenses.length === 0 && data.incomes.length === 0
            ? 'Start by adding transactions to see your financial overview.'
            : `You've spent ${money(monthExpenses, currency)} this month.`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="glass-card inner-stroke rounded-2xl p-card-padding flex flex-col justify-between h-40 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon name={card.icon} />
              </div>
              {card.badge && (
                <span className={card.badgeCls}>{card.badge}</span>
              )}
            </div>
            <div>
              {card.progress !== undefined ? (
                <>
                  <div className="flex justify-between mb-2">
                    <p className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest">{card.label}</p>
                    <span className="text-label-caps font-label-caps">{card.value}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
                    <div className="h-full progress-fill rounded-full" style={{ width: `${card.progress}%` }}></div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-widest mb-1">{card.label}</p>
                  <h4 className="font-headline-md text-headline-md font-extrabold text-primary">{card.value}</h4>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 glass-card inner-stroke rounded-3xl p-8 min-h-[350px] relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h5 className="font-title-sm text-title-sm font-bold">Monthly Spending</h5>
          </div>
          {monthlyBars.every((v) => v === 0) ? (
            <div className="h-56 flex items-center justify-center text-on-surface-variant">
              <p>Add expenses to see your monthly spending chart.</p>
            </div>
          ) : (
            <div className="w-full h-56 flex items-end justify-between gap-1 mt-4">
              {months.map((m, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-lg transition-all hover:bg-primary/80 group relative ${
                    i === months.length - 1 ? 'bg-primary-container' : 'bg-primary/20 hover:bg-primary/40'
                  }`}
                  style={{ height: `${Math.max(barPercentages[i], 3)}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {m.label}: {money(monthlyBars[i], currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card inner-stroke rounded-3xl p-8 min-h-[350px] flex flex-col">
          <h5 className="font-title-sm text-title-sm font-bold mb-6">Category Breakdown</h5>
          <div className="flex-1 flex flex-col justify-center items-center">
            {byCat.length === 0 ? (
              <p className="text-on-surface-variant text-body-sm">Add expenses to see category breakdown.</p>
            ) : (
              <>
                <div className="w-32 h-32 rounded-full border-[12px] border-primary-container relative flex items-center justify-center">
                  <span className="font-headline-md text-headline-md font-bold">{byCat.length}</span>
                </div>
                <div className="mt-8 w-full space-y-3">
                  {byCat.map(([cat, amt], idx) => (
                    <div key={cat} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${catColors[idx % catColors.length]}`}></div>
                        <span className="text-body-sm">{cat}</span>
                      </div>
                      <span className="text-body-sm font-bold">{money(amt, currency)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card inner-stroke rounded-3xl overflow-hidden mb-8">
        <div className="px-8 py-6 flex justify-between items-center border-b border-outline-variant/20">
          <h5 className="font-title-sm text-title-sm font-bold">Recent Transactions</h5>
          <button onClick={() => navigate('/expenses')} className="text-primary font-bold text-body-sm hover:underline">View All</button>
        </div>
        <div className="p-4">
          {recentTransactions.length === 0 ? (
            <div className="px-4 py-10 text-center text-on-surface-variant">
              <Icon name="receipt_long" className="text-4xl text-outline mb-2 block mx-auto" />
              No transactions yet. Add your first one!
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-label-caps font-label-caps text-on-surface-variant border-b border-outline-variant/10">
                <tr>
                  <th className="px-4 py-3">Merchant</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {recentTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-variant/20 transition-colors cursor-pointer group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.iconBg}`}>
                          <Icon name={t.icon} size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-body-md">{t.name}</p>
                          <p className="text-xs text-on-surface-variant sm:hidden">{t.cat} • {formatDate(t.date)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden sm:table-cell">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-primary/10 text-primary' : 'bg-surface-variant'}`}>
                        {t.cat}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-on-surface-variant text-body-sm">{formatDate(t.date)}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-bold text-body-md ${t.amount >= 0 ? 'text-secondary' : 'text-error'}`}>
                        {t.amount >= 0 ? '+' : '-'}{money(Math.abs(t.amount), currency)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => setDeleteTarget(withOriginalId(t))} className="p-1 text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="delete" size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <button
        onClick={() => { setForm(emptyForm); setModalOpen(true); }}
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-14 h-14 rounded-2xl bg-primary text-on-primary shadow-2xl flex items-center justify-center transition-all duration-300 active:scale-90 hover:shadow-primary/40 hover:-translate-y-1 z-50"
      >
        <Icon name="add" size={28} className="text-white" />
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Transaction">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setForm({ ...form, type: 'expense' })}
              className={`flex-1 py-3 rounded-xl font-bold text-body-md transition-all ${form.type === 'expense' ? 'bg-error text-white' : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30'}`}
            >
              Expense
            </button>
            <button
              onClick={() => setForm({ ...form, type: 'income' })}
              className={`flex-1 py-3 rounded-xl font-bold text-body-md transition-all ${form.type === 'income' ? 'bg-secondary text-white' : 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30'}`}
            >
              Income
            </button>
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Merchant / Source</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="e.g. Amazon, Salary"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Amount</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="0.00"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Category</label>
            <select
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={form.cat}
              onChange={(e) => setForm({ ...form, cat: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface-variant font-bold hover:bg-surface-variant/30 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all active:scale-95">
              Add Transaction
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Transaction" size="sm">
        <div className="space-y-4">
          <p className="text-on-surface-variant font-body-md">
            Delete <strong className="text-on-surface">{deleteTarget?.name}</strong>?
          </p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface-variant font-bold hover:bg-surface-variant/30 transition-all">
              Cancel
            </button>
            <button onClick={handleDelete} className="flex-1 px-4 py-3 rounded-xl bg-error text-white font-bold hover:shadow-lg transition-all active:scale-95">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}