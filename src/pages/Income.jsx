import { useState } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAppData } from '../context/useAppData';
import { formatDate, money, toDateInputValue } from '../utils/format';

const sourceOptions = [
  { name: 'Salary', icon: 'account_balance', iconBg: 'bg-primary/10 text-primary' },
  { name: 'Freelance', icon: 'laptop_mac', iconBg: 'bg-secondary/10 text-secondary' },
  { name: 'Investment', icon: 'show_chart', iconBg: 'bg-tertiary-container/10 text-tertiary' },
  { name: 'Business', icon: 'business_center', iconBg: 'bg-secondary-container/20 text-on-secondary-container' },
  { name: 'Rental', icon: 'home', iconBg: 'bg-primary-container/20 text-on-primary-container' },
  { name: 'Gift', icon: 'card_giftcard', iconBg: 'bg-tertiary/10 text-tertiary' },
  { name: 'Other', icon: 'more_horiz', iconBg: 'bg-surface-variant text-outline' },
];

const emptyForm = { name: '', source: '', amount: '', date: toDateInputValue(), recurring: false, freq: 'Monthly' };

export default function Income() {
  const { data, addIncome, updateIncome, deleteIncome } = useAppData();
  const incomes = data.incomes;
  const currency = data.settings.currency;
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterType, setFilterType] = useState('All');

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const recurringIncome = incomes.filter((i) => i.recurring).reduce((s, i) => s + i.amount, 0);
  const oneTimeIncome = incomes.filter((i) => !i.recurring).reduce((s, i) => s + i.amount, 0);

  const filtered = incomes.filter((e) => {
    const matchesSearch = (e.name + ' ' + e.source).toLowerCase().includes(search.toLowerCase());
    if (filterType === 'Recurring') return matchesSearch && e.recurring;
    if (filterType === 'One-time') return matchesSearch && !e.recurring;
    return matchesSearch;
  });

  const getIconMeta = (name) => sourceOptions.find((s) => s.name === name) || sourceOptions[6];

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, date: toDateInputValue() }); setModalOpen(true); };

  const openEdit = (inc) => {
    setEditing(inc);
    setForm({
      name: inc.name,
      source: inc.source,
      amount: String(inc.amount),
      date: toDateInputValue(inc.date),
      recurring: inc.recurring,
      freq: inc.freq || 'Monthly',
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.amount.trim()) return;
    const meta = getIconMeta(form.name);
    const isKnownType = sourceOptions.some((s) => s.name === form.name);
    const payload = {
      name: form.name.trim(),
      source: form.source.trim() || form.name.trim(),
      icon: editing && !isKnownType ? editing.icon : meta.icon,
      iconBg: editing && !isKnownType ? editing.iconBg : meta.iconBg,
      amount: Number(form.amount),
      date: form.date ? new Date(form.date + 'T00:00:00').toISOString() : new Date().toISOString(),
      recurring: form.recurring,
      freq: form.recurring ? form.freq : '',
    };

    if (editing) {
      updateIncome(editing.id, payload);
    } else {
      addIncome(payload);
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditing(null);
  };

  const handleDelete = () => {
    deleteIncome(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="font-display-lg text-display-lg text-on-surface hidden md:block">Income Management</h2>
        <h2 className="font-display-lg-mobile text-display-lg-mobile text-on-surface md:hidden">Income</h2>
        <p className="text-on-surface-variant font-body-md mt-1">Track and manage all your income sources.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Total Income</p>
          <h3 className="font-headline-md text-headline-md text-primary font-extrabold mt-2">{money(totalIncome, currency)}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Across {incomes.length} source{incomes.length === 1 ? '' : 's'}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-secondary/10 rounded-full blur-2xl"></div>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Recurring</p>
          <h3 className="font-headline-md text-headline-md text-secondary font-extrabold mt-2">{money(recurringIncome, currency)}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Steady monthly flow</p>
        </div>
        <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl"></div>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">One-time</p>
          <h3 className="font-headline-md text-headline-md text-tertiary font-extrabold mt-2">{money(oneTimeIncome, currency)}</h3>
          <p className="text-xs text-on-surface-variant mt-1">Irregular earnings</p>
        </div>
      </div>

      <section className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
            <input
              className="w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline/60 font-body-md text-body-md"
              placeholder="Search income source or name..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-primary text-on-primary rounded-2xl font-bold text-body-md hover:shadow-lg transition-all active:scale-95">
            <Icon name="add" className="text-on-primary" />
            <span>Add Income</span>
          </button>
        </div>
        <div className="flex gap-2">
          {['All', 'Recurring', 'One-time'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps shadow-sm transition-colors ${
                filterType === f
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-3xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-highest/50 backdrop-blur-md">
                <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider">Income Source</th>
                <th className="px-6 py-4 font-label-caps text-label-caps text-outline uppercase tracking-wider mobile-hide">Type</th>
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
                    No income entries found
                  </td>
                </tr>
              )}
              {filtered.map((inc) => (
                <tr key={inc.id} className="hover:bg-primary-container/5 transition-colors group cursor-pointer">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inc.iconBg}`}>
                        <Icon name={inc.icon} />
                      </div>
                      <div>
                        <p className="font-title-sm text-on-surface font-semibold">{inc.name}</p>
                        <p className="md:hidden text-xs text-on-surface-variant">{inc.source} • {formatDate(inc.date)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 mobile-hide">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight ${
                      inc.recurring ? 'bg-secondary/10 text-secondary' : 'bg-surface-variant text-outline'
                    }`}>
                      {inc.recurring ? inc.freq || 'Recurring' : 'One-time'}
                    </span>
                  </td>
                  <td className="px-6 py-5 mobile-hide font-body-sm text-body-sm text-on-surface-variant">{formatDate(inc.date)}</td>
                  <td className="px-6 py-5 text-right font-headline-md text-secondary whitespace-nowrap">+{money(inc.amount, currency)}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(inc)} className="p-2 text-outline hover:text-primary"><Icon name="edit" /></button>
                      <button onClick={() => setDeleteTarget(inc)} className="p-2 text-outline hover:text-error"><Icon name="delete" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-card rounded-3xl p-6">
          <h5 className="font-title-sm text-title-sm font-bold mb-4">Income Breakdown</h5>
          {incomes.length === 0 ? (
            <p className="text-on-surface-variant font-body-sm">Add income entries to see the breakdown.</p>
          ) : (
            <div className="space-y-3">
              {incomes.map((inc) => {
                const pct = totalIncome > 0 ? Math.round((inc.amount / totalIncome) * 100) : 0;
                return (
                  <div key={inc.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${inc.iconBg}`}>
                      <Icon name={inc.icon} size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-body-sm font-bold">{inc.name}</span>
                        <span className="text-body-sm text-on-surface-variant">{pct}%</span>
                      </div>
                      <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h5 className="font-title-sm text-title-sm font-bold mb-2">Income Insights</h5>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {totalIncome > 0
                  ? `Your recurring income of ${money(recurringIncome, currency)} accounts for ${totalIncome > 0 ? Math.round((recurringIncome / totalIncome) * 100) : 0}% of your total.`
                  : 'Add income entries to start tracking your earnings and see insights here.'}
              </p>
            </div>
          </div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
        </div>
      </section>

      <button onClick={openAdd} className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center z-50 active:scale-90 transition-transform inner-glow">
        <Icon name="add" size={28} className="text-white" />
      </button>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Income' : 'Add Income'}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Income Type</label>
            <div className="grid grid-cols-4 gap-2">
              {sourceOptions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setForm({ ...form, name: s.name })}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-xs ${
                    form.name === s.name
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-outline-variant/30 text-outline hover:border-primary/50'
                  }`}
                >
                  <Icon name={s.icon} size={18} />
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Source / Description</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="e.g. Acme Corp, Upwork, Property Name"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
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
            <label className="font-label-caps text-label-caps text-on-surface-variant">Date Received</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-body-md text-body-md font-semibold">Recurring Income</p>
              <p className="text-xs text-on-surface-variant">This is a regular income source</p>
            </div>
            <button
              onClick={() => setForm({ ...form, recurring: !form.recurring })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.recurring ? 'bg-primary' : 'bg-outline-variant/30'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.recurring ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
          </div>
          {form.recurring && (
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Frequency</label>
              <select
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                value={form.freq}
                onChange={(e) => setForm({ ...form, freq: e.target.value })}
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface-variant font-bold hover:bg-surface-variant/30 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all active:scale-95">
              {editing ? 'Update' : 'Add Income'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Income" size="sm">
        <div className="space-y-4">
          <p className="text-on-surface-variant font-body-md">
            Are you sure you want to delete <strong className="text-on-surface">{deleteTarget?.name}</strong> from {deleteTarget?.source}? This action cannot be undone.
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