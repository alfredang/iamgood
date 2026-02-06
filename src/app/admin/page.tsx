"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: number;
  name: string;
  email: string;
}

interface AdminLogin {
  id: number;
  name: string;
  email: string;
  ip_address: string;
  user_agent: string;
  logged_in_at: string;
}

interface CheckInLog {
  id: number;
  user_id: number;
  user_name: string;
  health_tag: string;
  note: string | null;
  checked_in_at: string;
}

interface AlertLog {
  id: number;
  alert_type: string;
  status: string;
  message: string;
  sent_at: string;
  user_name: string;
  contact_name: string;
  contact_email: string;
}

interface UserSchedule {
  user_id: number;
  user_name: string;
  user_email: string;
  check_in_interval_hours: number;
  grace_period_minutes: number;
  alert_enabled: boolean;
  last_checkin: string | null;
  last_health_tag: string | null;
}

type Tab = "checkins" | "admin_logins" | "alerts" | "contacts" | "users" | "schedules";

const HEALTH_TAG_STYLES: Record<string, string> = {
  okay: "bg-green-100 text-green-800",
  unwell: "bg-amber-100 text-amber-800",
  "need-talk": "bg-blue-100 text-blue-800",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("checkins");

  const [adminLogins, setAdminLogins] = useState<AdminLogin[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInLog[]>([]);
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [contacts, setContacts] = useState<Record<string, unknown>[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [schedules, setSchedules] = useState<UserSchedule[]>([]);
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ hours: 24, grace: 60, enabled: true });

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/logs?type=all&limit=100");
      if (res.ok) {
        const data = await res.json();
        setAdminLogins(data.adminLogins || []);
        setCheckIns(data.checkIns || []);
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        setAdmin(data.admin);
        setLoading(false);
      } catch {
        router.replace("/admin/login");
      }
    }
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!admin) return;
    fetchLogs();

    // Also fetch contacts and users
    fetch("/api/contacts").then(r => r.json()).then(d => setContacts(d.contacts || [])).catch(() => {});
    fetch("/api/users").then(r => r.json()).then(d => setUsers(d.users || [])).catch(() => {});
    fetch("/api/admin/schedules").then(r => r.json()).then(d => setSchedules(d.schedules || [])).catch(() => {});
  }, [admin, fetchLogs]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-stone-400 text-lg">Loading...</p>
      </div>
    );
  }

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: "checkins", label: "Check-ins", count: checkIns.length },
    { key: "admin_logins", label: "Admin Logins", count: adminLogins.length },
    { key: "alerts", label: "Alerts Sent", count: alerts.length },
    { key: "contacts", label: "Contacts", count: contacts.length },
    { key: "users", label: "Users", count: users.length },
    { key: "schedules", label: "Schedules", count: schedules.length },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <header className="bg-stone-800 text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">SafeCheck Admin</h1>
            <p className="text-stone-400 text-sm">Logged in as {admin?.name}</p>
          </div>
          <div className="flex gap-3">
            <a href="/dashboard" className="px-4 py-2 bg-stone-700 hover:bg-stone-600 rounded-lg text-sm font-medium transition-colors">
              View App
            </a>
            <button onClick={handleLogout} className="px-4 py-2 bg-stone-700 hover:bg-red-600 rounded-lg text-sm font-medium transition-colors cursor-pointer">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
            <p className="text-sm text-stone-400">Total Users</p>
            <p className="text-2xl font-bold text-stone-800">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
            <p className="text-sm text-stone-400">Total Check-ins</p>
            <p className="text-2xl font-bold text-stone-800">{checkIns.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
            <p className="text-sm text-stone-400">Alerts Sent</p>
            <p className="text-2xl font-bold text-stone-800">{alerts.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
            <p className="text-sm text-stone-400">Emergency Contacts</p>
            <p className="text-2xl font-bold text-stone-800">{contacts.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                tab === t.key ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {t.label} <span className="text-stone-400 ml-1">({t.count})</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
          {tab === "checkins" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">User</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Note</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {checkIns.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-400">No check-ins recorded yet</td></tr>
                  ) : checkIns.map((ci) => (
                    <tr key={ci.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                      <td className="px-4 py-3 font-medium text-stone-700">{ci.user_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${HEALTH_TAG_STYLES[ci.health_tag] || "bg-stone-100 text-stone-600"}`}>
                          {ci.health_tag}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-500">{ci.note || "—"}</td>
                      <td className="px-4 py-3 text-stone-500">{new Date(ci.checked_in_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "admin_logins" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Admin</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">IP Address</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Browser</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {adminLogins.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-stone-400">No admin logins recorded yet</td></tr>
                  ) : adminLogins.map((login) => (
                    <tr key={login.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-stone-700">{login.name}</p>
                        <p className="text-stone-400 text-xs">{login.email}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-500 font-mono text-xs">{login.ip_address}</td>
                      <td className="px-4 py-3 text-stone-500 text-xs max-w-[200px] truncate">{login.user_agent}</td>
                      <td className="px-4 py-3 text-stone-500">{new Date(login.logged_in_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "alerts" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">User</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Contact</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">No alerts sent yet</td></tr>
                  ) : alerts.map((al) => (
                    <tr key={al.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                      <td className="px-4 py-3 font-medium text-stone-700">{al.user_name || "—"}</td>
                      <td className="px-4 py-3">
                        <p className="text-stone-700">{al.contact_name || "—"}</p>
                        <p className="text-stone-400 text-xs">{al.contact_email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${al.alert_type === "sms" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                          {al.alert_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${al.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {al.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-500">{new Date(al.sent_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "contacts" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Phone</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Relationship</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">For User</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">No emergency contacts yet</td></tr>
                  ) : contacts.map((c, i) => (
                    <tr key={i} className="border-b border-stone-50 hover:bg-stone-50/50">
                      <td className="px-4 py-3 font-medium text-stone-700">{String(c.name)}</td>
                      <td className="px-4 py-3 text-stone-500">{String(c.email)}</td>
                      <td className="px-4 py-3 text-stone-500">{String(c.phone || "—")}</td>
                      <td className="px-4 py-3 text-stone-500">{String(c.relationship || "—")}</td>
                      <td className="px-4 py-3 text-stone-500">{String(c.user_name || "—")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">ID</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Email</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">No users yet</td></tr>
                  ) : users.map((u, i) => (
                    <tr key={i} className="border-b border-stone-50 hover:bg-stone-50/50">
                      <td className="px-4 py-3 text-stone-500 font-mono text-xs">{String(u.id)}</td>
                      <td className="px-4 py-3 font-medium text-stone-700">{String(u.name)}</td>
                      <td className="px-4 py-3 text-stone-500">{String(u.email || "—")}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-600"}`}>
                          {String(u.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-stone-500">{new Date(String(u.created_at)).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "schedules" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-100">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">User</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Check-in Every</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Grace Period</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Alerts</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Last Check-in</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-stone-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-stone-400">No users with schedules</td></tr>
                  ) : schedules.map((s) => {
                    const isEditing = editingSchedule === s.user_id;
                    const isOverdue = s.last_checkin
                      ? (Date.now() - new Date(s.last_checkin).getTime()) > (s.check_in_interval_hours * 3600000 + s.grace_period_minutes * 60000)
                      : false;

                    function formatInterval(hours: number) {
                      if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""}`;
                      const days = hours / 24;
                      if (days === Math.floor(days)) return `${days} day${days > 1 ? "s" : ""}`;
                      return `${hours} hours`;
                    }

                    return (
                      <tr key={s.user_id} className="border-b border-stone-50 hover:bg-stone-50/50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-stone-700">{s.user_name}</p>
                          <p className="text-stone-400 text-xs">{s.user_email || ""}</p>
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                max={720}
                                value={scheduleForm.hours}
                                onChange={(e) => setScheduleForm(f => ({ ...f, hours: Number(e.target.value) }))}
                                className="w-20 px-2 py-1 border rounded text-sm"
                              />
                              <span className="text-xs text-stone-400">hrs</span>
                            </div>
                          ) : (
                            <span className="text-stone-700">{formatInterval(s.check_in_interval_hours)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={scheduleForm.grace}
                                onChange={(e) => setScheduleForm(f => ({ ...f, grace: Number(e.target.value) }))}
                                className="px-2 py-1 border rounded text-sm"
                              >
                                <option value={15}>15 min</option>
                                <option value={30}>30 min</option>
                                <option value={60}>1 hour</option>
                                <option value={120}>2 hours</option>
                                <option value={240}>4 hours</option>
                              </select>
                            </div>
                          ) : (
                            <span className="text-stone-500">{s.grace_period_minutes} min</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={scheduleForm.enabled}
                                onChange={(e) => setScheduleForm(f => ({ ...f, enabled: e.target.checked }))}
                                className="w-4 h-4"
                              />
                              <span className="text-xs">Enabled</span>
                            </label>
                          ) : (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.alert_enabled ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-500"}`}>
                              {s.alert_enabled ? "ON" : "OFF"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-stone-500 text-xs">
                          {s.last_checkin ? new Date(s.last_checkin).toLocaleString() : "Never"}
                        </td>
                        <td className="px-4 py-3">
                          {s.last_checkin ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${isOverdue ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                              {isOverdue ? "OVERDUE" : "OK"}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-500">No data</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <button
                                onClick={async () => {
                                  await fetch("/api/admin/schedules", {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      userId: s.user_id,
                                      checkInIntervalHours: scheduleForm.hours,
                                      gracePeriodMinutes: scheduleForm.grace,
                                      alertEnabled: scheduleForm.enabled,
                                    }),
                                  });
                                  setEditingSchedule(null);
                                  fetch("/api/admin/schedules").then(r => r.json()).then(d => setSchedules(d.schedules || []));
                                }}
                                className="px-3 py-1.5 bg-[#5B8A72] text-white text-xs rounded-lg font-medium cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingSchedule(null)}
                                className="px-3 py-1.5 bg-stone-100 text-stone-600 text-xs rounded-lg font-medium cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingSchedule(s.user_id);
                                setScheduleForm({
                                  hours: s.check_in_interval_hours,
                                  grace: s.grace_period_minutes,
                                  enabled: s.alert_enabled,
                                });
                              }}
                              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs rounded-lg font-medium cursor-pointer"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh */}
        <div className="mt-4 text-center">
          <button
            onClick={fetchLogs}
            className="text-stone-400 hover:text-stone-600 text-sm transition-colors cursor-pointer"
          >
            Refresh data
          </button>
        </div>
      </div>
    </div>
  );
}
