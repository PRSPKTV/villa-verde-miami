import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('user_profiles').select('*').eq('id', user.id).single().then(({ data }) => {
      if (data) setProfile({ full_name: data.full_name || '', avatar_url: data.avatar_url || '' });
      setLoading(false);
    });
  }, [user]);

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from('user_profiles').update({
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);
    setSaving(false);
    if (error) {
      alert('Error: ' + error.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleChangePassword = async () => {
    setPwMessage('');
    if (passwords.new !== passwords.confirm) {
      setPwMessage('Passwords do not match.');
      return;
    }
    if (passwords.new.length < 6) {
      setPwMessage('Password must be at least 6 characters.');
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    setPwSaving(false);
    if (error) {
      setPwMessage('Error: ' + error.message);
    } else {
      setPwMessage('Password updated successfully.');
      setPasswords({ current: '', new: '', confirm: '' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-verde-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-verde-800">Settings</h1>
        <p className="text-text-secondary font-body mt-1">Manage your profile and account.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <User size={18} className="text-verde-500" />
          <h2 className="font-heading text-lg font-bold text-verde-800">Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Email</label>
            <div className="px-3 py-2 rounded-lg bg-cream-50 border border-verde-100 font-body text-sm text-text-secondary">{user?.email}</div>
          </div>
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Full Name</label>
            <input
              value={profile.full_name}
              onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            />
          </div>
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Avatar URL</label>
            <input
              value={profile.avatar_url}
              onChange={e => setProfile(p => ({ ...p, avatar_url: e.target.value }))}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors disabled:opacity-50"
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-surface rounded-2xl border border-verde-100 shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-verde-500" />
          <h2 className="font-heading text-lg font-bold text-verde-800">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            />
          </div>
          <div>
            <label className="block font-data text-[10px] uppercase text-text-muted tracking-wider mb-1">Confirm Password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-verde-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            />
          </div>
          {pwMessage && (
            <div className={`font-body text-sm ${pwMessage.includes('Error') || pwMessage.includes('do not') || pwMessage.includes('must be') ? 'text-red-500' : 'text-verde-600'}`}>
              {pwMessage}
            </div>
          )}
          <button
            onClick={handleChangePassword}
            disabled={pwSaving || !passwords.new}
            className="flex items-center gap-2 px-4 py-2 bg-verde-500 text-cream-100 rounded-xl font-body text-sm font-semibold hover:bg-verde-600 transition-colors disabled:opacity-50"
          >
            <Lock size={14} />
            {pwSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}
