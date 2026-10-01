import { useState } from 'react';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAppData } from '../context/useAppData';

export default function Settings() {
  const { data, updateProfile, updateSettings, changePassword } = useAppData();
  const { profile, settings } = data;
  const [saved, setSaved] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleSave = async () => {
    const ok = await updateSettings(settings);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleReset = async () => {
    const ok = await updateSettings({ currency: 'INR', language: 'EN' });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleProfileSave = async () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) return;
    const ok = await updateProfile(profileForm);
    if (ok) setProfileModal(false);
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm) return;
    setPasswordBusy(true);
    setPasswordError('');
    try {
      await changePassword(passwordForm.current, passwordForm.newPass);
      setPasswordModal(false);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setPasswordError(err.message || 'Unable to change password.');
    } finally {
      setPasswordBusy(false);
    }
  };

  const initials = profile.name.split(' ').map((n) => n[0]).join('');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {saved && (
        <div className="fixed top-20 right-6 z-[90] bg-secondary text-white px-6 py-3 rounded-xl shadow-lg font-bold flex items-center gap-2 animate-in">
          <Icon name="check_circle" className="text-white" />
          Changes saved successfully!
        </div>
      )}

      <section className="glass-card rounded-2xl p-card-padding flex flex-col md:flex-row items-center gap-6 mt-4">
        <div className="w-24 h-24 rounded-full border-4 border-primary-container/30 bg-primary-fixed-dim flex items-center justify-center text-primary font-black text-3xl shadow-lg">
            {initials}
          </div>
        <div className="text-center md:text-left space-y-1">
          <h3 className="font-headline-md text-headline-md text-on-surface">{profile.name}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">{profile.email}</p>
          <button onClick={() => { setProfileForm(profile); setProfileModal(true); }} className="inline-block mt-2 font-label-caps text-label-caps text-primary hover:underline transition-all">
            Edit Profile
          </button>
        </div>
        <div className="md:ml-auto flex gap-3">
          <div className="text-center px-4 py-2 bg-surface-container rounded-xl">
            <p className="font-label-caps text-[10px] text-outline uppercase">Joined</p>
            <p className="font-bold text-on-surface">{profile.joined}</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Icon name="tune" className="text-primary" /></div>
            <h4 className="font-title-sm text-title-sm">General</h4>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Default Currency</label>
              <select
                className="w-full bg-transparent border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-primary focus:border-primary transition-all"
                value={settings.currency}
                onChange={(e) => updateSettings({ currency: e.target.value })}
              >
                <option value="INR">INR - Indian Rupee (₹)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant">Language</label>
              <select
                className="w-full bg-transparent border border-outline-variant/50 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-primary focus:border-primary transition-all"
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
              >
                <option value="EN">English (US)</option>
                <option value="FR">Français</option>
                <option value="DE">Deutsch</option>
                <option value="ES">Español</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center"><Icon name="shield" className="text-error" /></div>
            <h4 className="font-title-sm text-title-sm">Security</h4>
          </div>
          <div className="space-y-4">
            <div onClick={() => setPasswordModal(true)} className="flex items-center gap-3 p-3 hover:bg-surface-variant/20 rounded-xl transition-colors cursor-pointer group">
              <Icon name="lock_reset" className="text-outline group-hover:text-primary" />
              <span className="flex-1 font-body-md text-body-md">Change Password</span>
              <Icon name="chevron_right" className="text-outline-variant" />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col md:flex-row gap-4 items-center justify-end">
        <button onClick={handleReset} className="w-full md:w-auto px-8 py-3 text-on-surface-variant font-bold hover:bg-surface-variant/50 rounded-xl transition-all">
          Reset to Default
        </button>
        <button onClick={handleSave} className="w-full md:w-80 px-12 py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 primary-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
          <Icon name="save" className="text-white" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <Modal open={profileModal} onClose={() => setProfileModal(false)} title="Edit Profile">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Full Name</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Email</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setProfileModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface-variant font-bold hover:bg-surface-variant/30 transition-all">
              Cancel
            </button>
            <button onClick={handleProfileSave} className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all active:scale-95">
              Save Profile
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={passwordModal} onClose={() => setPasswordModal(false)} title="Change Password">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Current Password</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              type="password"
              placeholder="Enter current password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">New Password</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              type="password"
              placeholder="Enter new password"
              value={passwordForm.newPass}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="font-label-caps text-label-caps text-on-surface-variant">Confirm Password</label>
            <input
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
            />
            {passwordForm.newPass && passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
              <p className="text-error text-xs">Passwords do not match</p>
            )}
            {passwordError && (
              <p className="text-error text-xs flex items-center gap-1"><Icon name="error_outline" size={14} />{passwordError}</p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setPasswordModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/50 text-on-surface-variant font-bold hover:bg-surface-variant/30 transition-all">
              Cancel
            </button>
            <button
              onClick={handlePasswordSave}
              disabled={!passwordForm.current || !passwordForm.newPass || passwordForm.newPass !== passwordForm.confirm || passwordBusy}
              className="flex-1 px-4 py-3 rounded-xl bg-primary text-on-primary font-bold hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordBusy ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}