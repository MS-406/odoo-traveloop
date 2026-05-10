// frontend/src/pages/AdminPage.tsx
import { useEffect, useState } from "react";
import { Shield, Users, BarChart3, ToggleLeft, ToggleRight, Trash2, Loader2 } from "lucide-react";
import { adminApi, type AdminUser, type AdminStats } from "@/api/admin";
import toast from "react-hot-toast";

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([adminApi.listUsers(), adminApi.getStats()]);
      setUsers(usersRes.data); setStats(statsRes.data);
    } catch { toast.error("Failed to load admin data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggle = async (userId: string) => {
    try { await adminApi.toggleUser(userId); toast.success("User status toggled"); fetchData(); }
    catch { toast.error("Failed to toggle user"); }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Permanently delete this user and all their data?")) return;
    try { await adminApi.deleteUser(userId); toast.success("User deleted"); fetchData(); }
    catch (e: any) { toast.error(e?.response?.data?.detail || "Failed to delete user"); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-danger/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="glass-card p-6 flex flex-col items-center gap-4 shadow-ambient relative z-10">
          <Loader2 className="h-8 w-8 text-danger animate-spin" />
          <p className="text-sm font-medium text-text-secondary">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-danger/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8 relative z-10">
        <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight flex items-center gap-3"><Shield className="h-8 w-8 text-danger" /> Admin Panel</h1>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Users", value: stats.total_users, icon: Users },
              { label: "Active", value: stats.active_users, icon: ToggleRight },
              { label: "Trips", value: stats.total_trips, icon: BarChart3 },
              { label: "Cities", value: stats.total_cities, icon: BarChart3 },
              { label: "Activities", value: stats.total_activities, icon: BarChart3 },
            ].map((s) => (
              <div key={s.label} className="glass-card p-5 text-center transition-all hover:scale-[1.02] hover:shadow-ambient hover:-translate-y-1">
                <p className="text-3xl font-display font-bold text-text-primary">{s.value}</p>
                <p className="text-sm font-medium text-text-secondary mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        <div className="glass-card overflow-x-auto shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-surface/50 border-b border-surface-border"><tr>
              <th className="text-left px-5 py-4 font-bold text-text-secondary uppercase tracking-wider text-xs">User</th>
              <th className="text-left px-5 py-4 font-bold text-text-secondary uppercase tracking-wider text-xs">Email</th>
              <th className="text-center px-5 py-4 font-bold text-text-secondary uppercase tracking-wider text-xs">Admin</th>
              <th className="text-center px-5 py-4 font-bold text-text-secondary uppercase tracking-wider text-xs">Active</th>
              <th className="text-right px-5 py-4 font-bold text-text-secondary uppercase tracking-wider text-xs">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-5 py-4 font-bold text-text-primary">{u.full_name}</td>
                  <td className="px-5 py-4 font-medium text-text-secondary">{u.email}</td>
                  <td className="px-5 py-4 text-center">{u.is_admin ? <span className="text-xs px-2.5 py-1 rounded-md bg-danger/10 text-danger font-bold tracking-wide">ADMIN</span> : <span className="text-text-muted">—</span>}</td>
                  <td className="px-5 py-4 text-center">{u.is_active ? <span className="text-success text-lg">●</span> : <span className="text-text-muted text-lg">●</span>}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleToggle(u.id)} className="p-2 rounded-lg bg-surface hover:bg-white hover:shadow-sm text-text-secondary hover:text-primary transition-all active:scale-95" title="Toggle active">
                        {u.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 rounded-lg bg-danger/5 hover:bg-danger text-danger hover:text-white transition-all active:scale-95 shadow-sm" title="Delete user"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
