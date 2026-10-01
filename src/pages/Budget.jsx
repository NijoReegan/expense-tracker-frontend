import { useState } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAppData } from '../context/useAppData';
import { money } from '../utils/format';

const categoryIcons = {
  'Food & Dining': 'restaurant',
  'Rent & Utilities': 'home',
  'Entertainment': 'movie',
  'Shopping': 'shopping_bag',
  'Transport': 'commute',
  'Health': 'favorite',
  'Education': 'school',
  'Other': 'category',
};

const categoryIconsBg = {
  'Food & Dining': 'bg-secondary-container/20 text-secondary',
  'Rent & Utilities': 'bg-primary-container/20 text-primary',
  'Entertainment': 'bg-error-container text-error',
  'Shopping': 'bg-tertiary-fixed text-tertiary',
  'Transport': 'bg-tertiary-container/20 text-tertiary',
  'Health': 'bg-error/10 text-error',
  'Education': 'bg-primary/10 text-primary',
  'Other': 'bg-surface-variant text-outline',
};

const barOptions = ['bg-secondary', 'bg-primary', 'bg-error', 'bg-tertiary'];

const emptyForm = { name: '', total: '', spent: '0' };

export default function Budget() {
  const { data, addBudget, updateBudget, deleteBudget } = useAppData();
  const budgets = data.budgets;
  const currency = data.settings.currency;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  const totalBudget = budgets.reduce((s, b) => s + b.total, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const pctSpent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const overBudget = budgets.filter((b) => b.spent > b.total);
  const remaining = totalBudget - totalSpent;

  const getBarStyle = (b) => {
    const pct = b.total > 0 ? Math.min(100, Math.round((b.spent / b.total) * 100)) : 100;
    return { width: `${pct}%` };
  };

  const getBudgetMeta = (b) => {
    const pct = b.total > 0 ? Math.min(100, Math.round((b.spent / b.total) * 100)) : 100;
    if (b.spent > b.total) return { pctLabel: 'Exceeded', pctLabelCls: 'text-error', remaining: `Over: -${money(b.spent - b.total, currency)}`, over: true };
    if (pct >= 100) return { pctLabel: 'At Limit', pctLabelCls: 'text-outline', remaining: `Remaining: ${money(0, currency)}`, over: false };
    return { pctLabel: `${100 - pct}% Left`, pctLabelCls: 'text-secondary', remaining: `Remaining: ${money(b.total - b.spent, currency)}`, over: false };
  };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (budget) => {
    setEditing(budget);
    setForm({ name: budget.name, total: String(budget.total), spent: String(budget.spent) });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.total.trim()) return;
    const total = Number(form.total);
    if (!Number.isFinite(total) || total <= 0) return;
    const spent = Number(form.spent) || 0;

    const payload = {
      name: form.name,
      icon: categoryIcons[form.name] || 'category',
      iconBg: categoryIconsBg[form.name] || 'bg-surface-variant text-outline',
      spent,
      total,
    };

    if (editing) {
      updateBudget(editing.id, payload);
    } else {
      addBudget(payload);
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditing(null);
  };

  const handleDelete = () => {
    deleteBudget(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      {overBudget.length > 0 && (
        <section className="mb-8">
          <div className="bg-error-container text-on-error-container p-4 rounded-xl flex items-center gap-4 border border-error/20 shadow-sm animate-pulse">
            <Icon name="warning" className="text-error" />
            <div className="flex-1">
              <p className="font-body-md text-body-md font-bold">Budget Alert</p>
              <p className="font-body-sm text-body-sm opacity-90">{overBudget.length} categor{overBudget.length > 1 ? 'ies have' : 'y has'} exceeded the monthly limit.</p>
            </div>
            <button onClick={() => setDetailTarget(overBudget[0])} className="px-4 py-2 bg-on-error-container text-white rounded-lg font-title-sm text-title-sm hover:opacity-90 transition-opacity">
              View Details
            </button>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden h-full justify-center">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary-fixed/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary-fixed-dim/20 rounded-full blur-3xl"></div>
            <h3 className="font-title-sm text-title-sm text-outline-variant uppercase tracking-widest mb-6">Monthly Overview</h3>
            <div className="relative w-64 h-64 mb-8">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-surface-variant stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8"></circle>
                <circle
                  className="text-secondary stroke-current progress-ring__circle"
                  cx="50" cy="50" fill="transparent" r="40"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * pctSpent) / 100}
                  strokeLinecap="round" strokeWidth="8"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display-lg text-display-lg text-on-surface">{pctSpent}%</span>
                <span className="font-label-caps text-label-caps text-outline">Spent</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 w-full border-t border-outline-variant/10 pt-8">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline mb-1">Total Budget</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">{money(totalBudget, currency)}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-outline mb-1">Actual Spent</span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">{money(totalSpent, currency)}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Category Budgets</h3>
              <p className="font-body-sm text-body-sm text-outline">Manage your spending limits per category</p>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl shadow-lg hover:shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95">
              <Icon name="add_circle" />
              <span className="font-title-sm text-title-sm">Create New Budget</span>
            </button>
          </div>
          {budgets.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Icon name="account_balance_wallet" size={40} className="text-outline mx-auto mb-4" />
              <p className="font-title-sm text-title-sm text-on-surface">No budgets yet</p>
              <p className="text-on-surface-variant text-body-sm mt-1">Create a budget to start tracking your spending limits.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((b, idx) => {
                const meta = getBudgetMeta(b);
                const barCls = b.spent > b.total ? 'bg-error' : barOptions[idx % barOptions.length];
                return (
                  <div key={b.id} className={`glass-card p-6 flex flex-col gap-4 group transition-colors ${meta.over ? 'ring-2 ring-error/10 bg-error-container/5' : 'hover:border-secondary/30'}`}>
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-xl ${b.iconBg}`}>
                        <Icon name={b.icon} />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(b)} className="p-2 text-outline-variant hover:text-primary transition-colors"><Icon name="edit" size={18} /></button>
                        <button onClick={() => setDeleteTarget(b)} className="p-2 text-outline-variant hover:text-error transition-colors"><Icon name="delete" size={18} /></button>
                        <button onClick={() => setDetailTarget(b)} className="p-2 text-outline-variant hover:text-on-surface transition-colors"><Icon name="info" size={18} /></button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-title-sm text-title-sm text-on-surface">{b.name}</h4>
                      <div className="flex justify-between items-end mt-2">
                        <span className={`font-headline-md text-headline-md font-bold ${meta.over ? 'text-error' : ''}`}>
                          {money(b.spent, currency)}
                          <span className="text-outline text-body-sm font-normal"> / {money(b.total, currency)}</span>
                        </span>
                        <span className={`font-label-caps text-label-caps font-bold ${meta.pctLabelCls}`}>{meta.pctLabel}</span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden mt-2">
                      <div className={`${barCls} h-full rounded-full transition-all duration-1000`} style={getBarStyle(b)}></div>
                    </div>
                    <div className={`flex justify-between text-body-sm font-body-sm ${meta.over ? 'text-error font-bold' : 'text-outline'}`}>
                      <span>{meta.remaining}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <section className="mt-12 mb-8">
        <div className="glass-card overflow-hidden group">
          <div className="grid grid-cols-1 md:grid-cols-3">
            <div className="p-8 md:col-span-2">
              <h3 className="font-headline-md text-headline-md font-bold mb-2">Budget Summary</h3>
              <p className="text-outline font-body-md text-body-md mb-6 max-w-xl">
                {budgets.length === 0
                  ? 'Create budgets to see your monthly summary here.'
                  : remaining >= 0
                    ? `You have ${money(remaining, currency)} remaining across all categories this month.`
                    : `You are over budget by ${money(Math.abs(remaining), currency)} this month.`}
              </p>
              <div className="flex flex-wrap gap-4">
                <div className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${remaining >= 0 ? 'bg-secondary/10 border-secondary/20' : 'bg-error/10 border-error/20'}`}>
                  <Icon name={remaining >= 0 ? 'trending_down' : 'trending_up'} className={`text-sm ${remaining >= 0 ? 'text-secondary' : 'text-error'}`} />
                  <span className={`font-title-sm text-title-sm ${remaining >= 0 ? 'text-secondary' : 'text-error'}`}>
                    {remaining >= 0 ? `${overBudget.length} over-budget categor${overBudget.length === 1 ? 'y' : 'ies'}` : 'Over monthly limit'}
                  </span>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-lg flex items-center gap-2 border border-primary/20">
                  <Icon name="lightbulb" className="text-primary text-sm" />
                  <span className="text-primary font-title-sm text-title-sm">{budgets.length} active budget{budgets.length === 1 ? '' : 's'}</span>
                </div>
              </div>
            </div>
            <div className="relative bg-secondary overflow-hidden flex items-center justify-center h-48 md:h-auto min-h-[200px]">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.6),transparent_50%)]"></div>
              <div className="relative z-10 text-center p-8">
                <span className="font-display-lg text-display-lg text-white mb-1 block">{pctSpent}%</span>
                <p className="text-white font-bold text-lg">Budget Utilized</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Budget' : 'Create New Budget'}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Category Name</label>
            <select
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            >
              <option value="">Select category</option>
              <option value="Food & Dining">Food & Dining</option>
              <option value="Rent & Utilities">Rent & Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Transport">Transport</option>
              <option value="Health">Health</option>
              <option value="Education">Education</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Monthly Budget</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="800"
              type="number"
              min="0"
              value={form.total}
              onChange={(e) => setForm({ ...form, total: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Already Spent</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="0"
              type="number"
              min="0"
              value={form.spent}
              onChange={(e) => setForm({ ...form, spent: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface-variant font-bold hover:bg-surface-variant/30 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all active:scale-95">
              {editing ? 'Update' : 'Create Budget'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!detailTarget} onClose={() => setDetailTarget(null)} title={detailTarget?.name || 'Budget Details'}>
        {detailTarget && (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl">
              <span className="text-on-surface-variant">Spent</span>
              <span className="font-bold text-on-surface">{money(detailTarget.spent, currency)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-surface-container-low rounded-xl">
              <span className="text-on-surface-variant">Budget</span>
              <span className="font-bold text-primary">{money(detailTarget.total, currency)}</span>
            </div>
            <div className="w-full bg-surface-variant h-3 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${detailTarget.spent > detailTarget.total ? 'bg-error' : 'bg-secondary'}`} style={getBarStyle(detailTarget)}></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">{detailTarget.total > 0 ? Math.round((detailTarget.spent / detailTarget.total) * 100) : 100}% used</span>
              <span className={detailTarget.spent > detailTarget.total ? 'text-error font-bold' : 'text-secondary'}>
                {detailTarget.spent > detailTarget.total
                  ? `Over by ${money(detailTarget.spent - detailTarget.total, currency)}`
                  : `${money(detailTarget.total - detailTarget.spent, currency)} remaining`}
              </span>
            </div>
            <button onClick={() => { setDetailTarget(null); openEdit(detailTarget); }} className="w-full px-4 py-3 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all active:scale-95">
              Edit Budget
            </button>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Budget" size="sm">
        <div className="space-y-4">
          <p className="text-on-surface-variant font-body-md">
            Delete <strong className="text-on-surface">{deleteTarget?.name}</strong> budget?
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