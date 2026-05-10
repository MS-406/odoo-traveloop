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
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <h1 className="text-3xl font-display font-bold text-text-primary flex items-center gap-3 tracking-tight">
          <Settings className="h-8 w-8 text-primary" /> Settings
        </h1>
        
        <div className="flex gap-1 bg-surface-border/50 rounded-xl p-1.5 backdrop-blur-md w-full sm:w-auto overflow-x-auto">
          <button 
            onClick={() => setTab("profile")} 
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === "profile" ? "bg-white shadow-sm text-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            <User className="h-4 w-4" /> Profile
          </button>
          <button 
            onClick={() => setTab("security")} 
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === "security" ? "bg-white shadow-sm text-primary" : "text-text-secondary hover:text-text-primary"}`}
          >
            <Lock className="h-4 w-4" /> Security
          </button>
        </div>

        {tab === "profile" && (
          <form onSubmit={handleProfile(onProfile)} className="glass-card p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
              <input {...regProfile("full_name")} className="w-full px-4 py-3 rounded-lg border border-surface-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm hover:border-text-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Avatar URL</label>
              <input {...regProfile("avatar_url")} placeholder="https://..." className="w-full px-4 py-3 rounded-lg border border-surface-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm hover:border-text-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Language</label>
              <select {...regProfile("language")} className="w-full px-4 py-3 rounded-lg border border-surface-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm hover:border-text-muted">
                <option value="en">English</option><option value="es">Español</option><option value="fr">Français</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-primary text-white text-base font-bold shadow-sm hover:bg-primary-dark hover:shadow-ambient transition-all disabled:opacity-60 active:scale-[0.98]">{saving ? "Saving..." : "Save Changes"}</button>
          </form>
        )}
        {tab === "security" && (
          <form onSubmit={handlePw(onPassword)} className="glass-card p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Current Password</label>
              <input {...regPw("current_password")} type="password" className="w-full px-4 py-3 rounded-lg border border-surface-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm hover:border-text-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">New Password</label>
              <input {...regPw("new_password")} type="password" className="w-full px-4 py-3 rounded-lg border border-surface-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm hover:border-text-muted" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Confirm New Password</label>
              <input {...regPw("confirm_password")} type="password" className="w-full px-4 py-3 rounded-lg border border-surface-border bg-surface-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all shadow-sm hover:border-text-muted" />
            </div>
            <button type="submit" disabled={saving} className="w-full py-3 rounded-xl bg-primary text-white text-base font-bold shadow-sm hover:bg-primary-dark hover:shadow-ambient transition-all disabled:opacity-60 active:scale-[0.98]">{saving ? "Changing..." : "Change Password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
