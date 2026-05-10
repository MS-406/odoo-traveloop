// frontend/src/pages/AdminPage.tsx
import { useEffect, useState } from "react";
import { Shield, Users, BarChart3, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
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

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2"><Shield className="h-6 w-6 text-danger" /> Admin Panel</h1>
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Users", value: stats.total_users, icon: Users },
              { label: "Active", value: stats.active_users, icon: ToggleRight },
              { label: "Trips", value: stats.total_trips, icon: BarChart3 },
              { label: "Cities", value: stats.total_cities, icon: BarChart3 },
              { label: "Activities", value: stats.total_activities, icon: BarChart3 },
            ].map((s) => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className="text-xl font-bold text-text-primary">{s.value}</p>
                <p className="text-xs text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface"><tr>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">User</th>
              <th className="text-left px-4 py-3 font-medium text-text-secondary">Email</th>
              <th className="text-center px-4 py-3 font-medium text-text-secondary">Admin</th>
              <th className="text-center px-4 py-3 font-medium text-text-secondary">Active</th>
              <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-border">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-text-primary">{u.full_name}</td>
                  <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                  <td className="px-4 py-3 text-center">{u.is_admin ? <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger font-medium">Admin</span> : "—"}</td>
                  <td className="px-4 py-3 text-center">{u.is_active ? <span className="text-success">●</span> : <span className="text-text-muted">●</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggle(u.id)} className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-primary transition-colors" title="Toggle active">
                        {u.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded hover:bg-danger/5 text-text-muted hover:text-danger transition-colors" title="Delete user"><Trash2 className="h-4 w-4" /></button>
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
