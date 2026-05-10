// frontend/src/pages/SettingsPage.tsx
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useForm } from "react-hook-form";
import { User, Lock, Settings } from "lucide-react";
import api from "@/api/axiosInstance";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, fetchUser } = useAuthStore();
  const [tab, setTab] = useState<"profile" | "security">("profile");
  const [saving, setSaving] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile } = useForm({
    defaultValues: { full_name: user?.full_name || "", avatar_url: user?.avatar_url || "", language: user?.language || "en" },
  });
  const { register: regPw, handleSubmit: handlePw, reset: resetPw } = useForm({
    defaultValues: { current_password: "", new_password: "", confirm_password: "" },
  });

  const onProfile = async (data: any) => {
    setSaving(true);
    try { await api.put("/auth/me", data); await fetchUser(); toast.success("Profile updated"); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed to update"); }
    finally { setSaving(false); }
  };

  const onPassword = async (data: any) => {
    if (data.new_password !== data.confirm_password) { toast.error("Passwords don't match"); return; }
    setSaving(true);
    try { await api.post("/auth/password", { current_password: data.current_password, new_password: data.new_password }); toast.success("Password changed"); resetPw(); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed to change password"); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><Settings className="h-6 w-6 text-text-secondary" /> Settings</h1>
        <div className="flex gap-1 bg-surface rounded-lg p-1">
          <button onClick={() => setTab("profile")} className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "profile" ? "bg-white shadow-sm text-primary" : "text-text-muted"}`}><User className="h-4 w-4" /> Profile</button>
          <button onClick={() => setTab("security")} className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "security" ? "bg-white shadow-sm text-primary" : "text-text-muted"}`}><Lock className="h-4 w-4" /> Security</button>
        </div>
        {tab === "profile" && (
          <form onSubmit={handleProfile(onProfile)} className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
              <input {...regProfile("full_name")} className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Avatar URL</label>
              <input {...regProfile("avatar_url")} placeholder="https://..." className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Language</label>
              <select {...regProfile("language")} className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors">
                <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-60">{saving ? "Saving..." : "Save Changes"}</button>
          </form>
        )}
        {tab === "security" && (
          <form onSubmit={handlePw(onPassword)} className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Current Password</label>
              <input {...regPw("current_password")} type="password" className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">New Password</label>
              <input {...regPw("new_password")} type="password" className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm New Password</label>
              <input {...regPw("confirm_password")} type="password" className="w-full px-4 py-2.5 rounded-lg border border-surface-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors" />
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all disabled:opacity-60">{saving ? "Changing..." : "Change Password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
