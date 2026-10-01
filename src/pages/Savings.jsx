import { useState } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAppData } from '../context/useAppData';
import { money } from '../utils/format';

const iconOptions = [
  'emergency_home', 'directions_car', 'beach_access', 'home', 'flight', 'school', 'favorite', 'pets', 'local_hospital', 'card_giftcard', 'build', 'camera_alt',
];

const emptyForm = { name: '', targetDate: '', saved: '', targetAmount: '', icon: 'savings' };

const barOptions = ['progress-gradient', 'bg-secondary', 'bg-tertiary', 'bg-primary'];
const pctClsOptions = ['bg-primary/10 text-primary', 'bg-secondary/10 text-secondary', 'bg-tertiary/10 text-tertiary', 'bg-primary/10 text-primary'];
const iconBgOptions = ['bg-primary-container/20 text-primary', 'bg-secondary-container/20 text-secondary', 'bg-tertiary-container/10 text-tertiary', 'bg-primary-container/20 text-primary'];

const metaText = (pct) => {
  if (pct >= 100) return 'Goal achieved!';
  if (pct >= 75) return 'Almost there!';
  if (pct >= 40) return 'On track for target';
  return 'Just getting started';
};

export default function Savings() {
  const { data, addGoal, updateGoal, deleteGoal } = useAppData();
  const goals = data.goals;
  const currency = data.settings.currency;
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (goal) => {
    setEditing(goal);
    setForm({ name: goal.name, targetDate: goal.targetDate, saved: String(goal.saved), targetAmount: String(goal.targetAmount), icon: goal.icon });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.targetAmount.trim()) return;
    const payload = {
      name: form.name.trim(),
      targetDate: form.targetDate.trim() || 'TBD',
      icon: form.icon,
      saved: Number(form.saved) || 0,
      targetAmount: Number(form.targetAmount),
    };

    if (editing) {
      updateGoal(editing.id, payload);
    } else {
      addGoal(payload);
    }
    setModalOpen(false);
    setForm(emptyForm);
    setEditing(null);
  };

  const handleDelete = () => {
    deleteGoal(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface mb-2 hidden md:block">Savings Goals</h1>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-2 md:hidden">Savings Goals</h1>
            <p className="text-on-surface-variant font-body-md">Strategic wealth building through goal-oriented tracking.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-title-sm transition-all hover:translate-y-[-2px] btn-glow">
            <Icon name="add_circle" />
            <span>Add Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2 glass-card p-card-padding rounded-xl relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-label-caps text-primary uppercase font-bold">Total Savings Velocity</span>
              <div className="text-display-lg font-display-lg mt-2">{money(totalSaved, currency)}</div>
              <p className="text-on-surface-variant text-body-sm mt-1">Across {goals.length} active goal{goals.length === 1 ? '' : 's'}{goals.length > 0 ? ` toward ${money(totalTarget, currency)}.` : '.'}</p>
              <div className="mt-8 h-2 bg-surface-variant rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${overallPct > 0 ? 'progress-gradient' : ''}`} style={{ width: `${overallPct}%` }}></div>
              </div>
            </div>
          </div>
          <div className="glass-card p-card-padding rounded-xl flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center mb-4 text-on-secondary-container">
              <Icon name="auto_awesome" size={36} />
            </div>
            <span className="font-title-sm text-title-sm">Overall Progress</span>
            <p className="text-on-surface-variant text-body-sm mt-2">
              {goals.length > 0 ? `${overallPct}% of your total savings target reached.` : 'Create your first goal!'}
            </p>
          </div>
        </div>

        {goals.length === 0 && (
          <div className="glass-card rounded-xl p-10 text-center mb-8">
            <Icon name="savings" size={40} className="text-outline mx-auto mb-4" />
            <p className="font-title-sm text-title-sm text-on-surface">No savings goals yet</p>
            <p className="text-on-surface-variant text-body-sm mt-1">Create your first goal to start tracking your savings.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {goals.map((goal, idx) => {
            const pct = Math.min(100, Math.round((goal.saved / Math.max(goal.targetAmount, 1)) * 100));
            const clsIdx = idx % 4;
            return (
              <div key={goal.id} className="glass-card p-card-padding rounded-xl group transition-all duration-300 hover:shadow-2xl hover:translate-y-[-4px]">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgOptions[clsIdx]}`}>
                      <Icon name={goal.icon} size={27} />
                    </div>
                    <div>
                      <h3 className="font-title-sm text-title-sm">{goal.name}</h3>
                      <span className="text-label-caps text-outline uppercase font-bold">Target: {goal.targetDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(goal)} className="p-2 text-outline hover:text-primary transition-colors"><Icon name="edit" size={20} /></button>
                    <button onClick={() => setDeleteTarget(goal)} className="p-2 text-outline hover:text-error transition-colors"><Icon name="delete" size={20} /></button>
                  </div>
                </div>
                <div className="flex justify-between items-end mb-2">
                  <div className="text-display-lg-mobile font-display-lg-mobile">{money(goal.saved, currency)}</div>
                  <div className={`${pctClsOptions[clsIdx]} text-label-caps px-3 py-1 rounded-full font-bold`}>{pct}% Done</div>
                </div>
                <div className="text-on-surface-variant text-body-sm mb-6">of {money(goal.targetAmount, currency)} target amount</div>
                <div className="h-3 bg-surface-variant rounded-full overflow-hidden mb-6">
                  <div className={`h-full rounded-full ${barOptions[clsIdx]}`} style={{ width: `${pct}%` }}></div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                  <span className="text-body-sm text-outline">{metaText(pct)}</span>
                </div>
              </div>
            );
          })}

          <button onClick={openAdd} className="border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary-container/5 transition-all duration-300 rounded-xl flex flex-col items-center justify-center p-card-padding group">
            <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-on-primary transition-colors">
              <Icon name="add" size={27} />
            </div>
            <span className="font-title-sm text-title-sm text-on-surface-variant group-hover:text-primary">Create New Goal</span>
            <p className="text-outline text-body-sm mt-2">Define your next milestone</p>
          </button>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Goal' : 'Create New Goal'}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Goal Name</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="e.g. Emergency Fund"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    form.icon === ic ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant/30 text-outline hover:border-primary/50'
                  }`}
                >
                  <Icon name={ic} size={20} />
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Target Amount</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="20000"
                type="number"
                min="0"
                value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Already Saved</label>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="0"
                type="number"
                min="0"
                value={form.saved}
                onChange={(e) => setForm({ ...form, saved: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Target Date</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="e.g. Dec 2024"
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface-variant font-bold hover:bg-surface-variant/30 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all active:scale-95">
              {editing ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Goal" size="sm">
        <div className="space-y-4">
          <p className="text-on-surface-variant font-body-md">
            Are you sure you want to delete <strong className="text-on-surface">{deleteTarget?.name}</strong>? All progress will be lost.
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