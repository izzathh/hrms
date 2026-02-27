import { useEffect, useState } from 'react';
import { getDashboard } from '../api';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, UserX, Clock, Building2,
  Plus, ArrowRight, TrendingUp,
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-wrapper">
      <div className="loading-center"><div className="spinner" /><span>Loading dashboard...</span></div>
    </div>
  );

  if (error) return (
    <div className="page-wrapper">
      <div className="alert alert-error"><span className="alert-icon">⚠</span>{error}</div>
    </div>
  );

  const maxCount = Math.max(...(data?.departments || []).map(d => d.count), 1);

  const stats = [
    { label: 'Total Employees', value: data?.total_employees ?? 0, Icon: Users, color: 'var(--accent)' },
    { label: 'Present Today', value: data?.present_today ?? 0, Icon: UserCheck, color: 'var(--success)' },
    { label: 'Absent Today', value: data?.absent_today ?? 0, Icon: UserX, color: 'var(--danger)' },
    { label: 'Not Marked', value: data?.not_marked ?? 0, Icon: Clock, color: 'var(--warning)' },
  ];

  const presentPct = data?.total_employees
    ? Math.round((data.present_today / data.total_employees) * 100)
    : 0;

  const circumference = 2 * Math.PI * 50;
  const offset = circumference * (1 - presentPct / 100);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Today's workforce snapshot</p>
        </div>
        <Link to="/attendance" className="btn btn-primary">
          <Plus size={16} strokeWidth={2.5} /> Mark Attendance
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, Icon, color }) => (
          <div className="stat-card" key={label} style={{ '--accent-color': color }}>
            <div className='start-lab-val'>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
            <div className="stat-icon-wrap" style={{ color }}>
              <Icon size={22} strokeWidth={1.8} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        <div className="card">
          <div className="card-title">
            <Building2 size={16} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
            Department Breakdown
          </div>
          {data?.departments?.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <Building2 size={32} strokeWidth={1.2} style={{ opacity: 0.2 }} />
              <div className="empty-desc">No departments yet</div>
            </div>
          ) : (
            <div className="dept-bar">
              {data?.departments?.map(d => (
                <div className="dept-row" key={d.department}>
                  <span className="dept-name">{d.department}</span>
                  <div className="dept-track">
                    <div className="dept-fill" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                  </div>
                  <span className="dept-count">{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title">
            <TrendingUp size={16} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
            Attendance Rate Today
          </div>
          {data?.total_employees === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <UserCheck size={32} strokeWidth={1.2} style={{ opacity: 0.2 }} />
              <div className="empty-desc">No employees registered</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 20px' }}>
                <div style={{ position: 'relative', width: 120, height: 120 }}>
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="var(--surface-3)" strokeWidth="12" />
                    <circle
                      cx="60" cy="60" r="50"
                      fill="none"
                      stroke="var(--success)"
                      strokeWidth="12"
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dashoffset 1s ease' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>
                      {presentPct}%
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Present</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)' }}>
                  <UserCheck size={13} color="var(--success)" /> Present: {data?.present_today}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-2)' }}>
                  <UserX size={13} color="var(--danger)" /> Absent: {data?.absent_today}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Quick Actions</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 3 }}>Common tasks for HR admins</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/employees" className="btn btn-ghost btn-sm">
            <Plus size={14} /> Add Employee
          </Link>
          <Link to="/attendance" className="btn btn-primary btn-sm">
            Mark Attendance <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}