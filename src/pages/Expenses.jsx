import { useState } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAppData } from '../context/useAppData';
import { formatDate, money, toDateInputValue } from '../utils/format';
import { categories, categoryMeta } from '../constants/categories';

const chips = [
  'All Expenses',
  'Food & Dining',
  'Rent',
  'Technology',
  'This Month',
  'Last 30 Days',
];

const emptyForm = { name: '', amount: '', cat: 'Food & Dining', date: toDateInputValue() };

const inMonth = (iso, year, monthIdx) => {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() === monthIdx;
};

const inLast30 = (iso) => {
  const d = new Date(iso);
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return d.getTime() >= cutoff && d.getTime() <= Date.now();
};

export default function Expenses() {
  const { data, addExpense, updateExpense, deleteExpense } = useAppData();
  const expenses = data.expenses;
  const currency = data.settings.currency;
  const [activeChip, setActiveChip] = useState('All Expenses');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = expenses.filter((e) => {
    const now = new Date();
    const byChip =
      activeChip === 'All Expenses' ||
      e.cat === activeChip ||
      (activeChip === 'This Month' && inMonth(e.date, now.getFullYear(), now.getMonth())) ||
      (activeChip === 'Last 30 Days' && inLast30(e.date));
    return byChip && e.name.toLowerCase().includes(search.toLowerCase());
  });

  const now = new Date();
  const monthExpenses = expenses.filter((e) => inMonth(e.date, now.getFullYear(), now.getMonth()));
  const monthSpent = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const monthBudget = data.budgets.reduce((s, b) => s + Number(b.total), 0);
  const budgetPct = monthBudget > 0 ? Math.min(100, Math.round((monthSpent / monthBudget) * 100)) : 0;

  const byCat = {};
  monthExpenses.forEach((e) => {
    byCat[e.cat] = (byCat[e.cat] || 0) + Number(e.amount);
  });
  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0] || null;

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, date: toDateInputValue() }); setModalOpen(true); };

  const openEdit = (expense) => {
    setEditing(expense);
    setForm({ name: expense.name, amount: String(expense.amount), cat: expense.cat, date: toDateInputValue(expense.date) });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.amount.trim()) return;
    const meta = categoryMeta[form.cat] || categoryMeta['Shopping'];
    const dateIso = form.date ? new Date(form.date + 'T00:00:00').toISOString() : new Date().toISOString();
    const payload = {
      name: form.name.trim(),
      amount: Number(form.amount),
      cat: form.cat,
      date: dateIso,
      icon: meta.icon,
      iconBg: meta.iconBg,
      catCls: meta.catCls,
    };

    if (editing) {
      updateExpense(editing.id, payload);
    } else {
      addExpense(payload);
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditing(null);
  };

  const handleDelete = () => {
    deleteExpense(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <section className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline/60 font-body-md text-body-md"
              placeholder="Search merchant or category..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-2xl font-bold text-body-md hover:shadow-lg transition-all active:scale-95">
              <Icon name="add" className="text-on-primary" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {chips.map((chip, i) => {
            const isActive = chip === activeChip;
            return (
              <div key={chip} className="flex items-center">
                {i === 4 && <div className="w-px h-6 bg-outline-variant/30 self-center mr-2"></div>}
                <button
                  onClick={() => setActiveChip(chip)}
                  className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps shadow-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  {chip}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-card rounded-3xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/50 backdrop-blur-md">
                <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Merchant / Transaction</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider mobile-hide">Category</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider mobile-hide">Date</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider w-16 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">
                    <Icon name="search_off" className="text-4xl text-outline mb-2 block mx-auto" />
                    No expenses found
                  </td>
                </tr>
              )}
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-primary-container/5 transition-colors group cursor-pointer">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${e.iconBg}`}>
                        <Icon name={e.icon} />
                      </div>
                      <div>
                        <p className="font-title-sm text-on-surface font-semibold">{e.name}</p>
                        <p className="md:hidden text-xs text-on-surface-variant">{e.cat} • {formatDate(e.date)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 mobile-hide">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${e.catCls}`}>{e.cat}</span>
                  </td>
                  <td className="px-6 py-5 mobile-hide font-body-sm text-body-sm text-on-surface-variant">{formatDate(e.date)}</td>
                  <td className="px-6 py-5 text-right font-headline-md text-error whitespace-nowrap">-{money(e.amount, currency)}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(e)} className="p-2 text-outline hover:text-primary"><Icon name="edit" /></button>
                      <button onClick={() => setDeleteTarget(e)} className="p-2 text-outline hover:text-error"><Icon name="delete" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="p-6 text-center border-t border-outline-variant/10">
            <p className="font-body-sm text-body-sm text-on-surface-variant">{filtered.length} transaction{filtered.length > 1 ? 's' : ''}</p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-3xl p-card-padding flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <p className="font-label-caps text-label-caps text-outline uppercase">Month Limit</p>
            <Icon name="analytics" className="text-primary" />
          </div>
          <div>
            {monthBudget > 0 ? (
              <>
                <p className="font-headline-md text-on-surface">
                  {budgetPct}% <span className="text-xs text-on-surface-variant font-normal">of budget used</span>
                </p>
                <div className="w-full bg-outline-variant/20 h-2 rounded-full mt-3 overflow-hidden">
                  <div className={`h-full rounded-full animate-pulse ${budgetPct >= 100 ? 'bg-error' : 'bg-gradient-to-r from-primary to-secondary'}`} style={{ width: `${budgetPct}%` }}></div>
                </div>
              </>
            ) : (
              <>
                <p className="font-headline-md text-on-surface">{money(monthSpent, currency)}</p>
                <p className="text-xs text-on-surface-variant mt-1">Set a budget to see limit usage</p>
              </>
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-card-padding flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <p className="font-label-caps text-label-caps text-outline uppercase">Top Category</p>
            <Icon name="fastfood" className="text-secondary" />
          </div>
          <div>
            {topCat ? (
              <>
                <p className="font-headline-md text-on-surface">{topCat[0]}</p>
                <p className="text-xs text-on-surface-variant mt-1">{money(topCat[1], currency)} spent this month</p>
              </>
            ) : (
              <>
                <p className="font-headline-md text-on-surface">—</p>
                <p className="text-xs text-on-surface-variant mt-1">No spending recorded this month</p>
              </>
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-card-padding flex flex-col justify-between h-40">
          <div className="flex justify-between items-start">
            <p className="font-label-caps text-label-caps text-outline uppercase">This Month</p>
            <Icon name="payments" className="text-primary" />
          </div>
          <div>
            <p className="font-headline-md text-on-surface">{money(monthSpent, currency)}</p>
            <p className="text-xs text-on-surface-variant mt-1">{monthExpenses.length} transaction{monthExpenses.length === 1 ? '' : 's'} this month</p>
          </div>
        </div>
      </section>

      <button onClick={openAdd} className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center z-50 active:scale-90 transition-transform inner-glow">
        <Icon name="add" size={28} className="text-white" />
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Add Expense'}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Merchant Name</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="e.g. Amazon, Starbucks"
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
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Date</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface-variant font-bold hover:bg-surface-variant/30 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all active:scale-95">
              {editing ? 'Update' : 'Add Expense'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Expense" size="sm">
        <div className="space-y-4">
          <p className="text-on-surface-variant font-body-md">
            Are you sure you want to delete <strong className="text-on-surface">{deleteTarget?.name}</strong>? This action cannot be undone.
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