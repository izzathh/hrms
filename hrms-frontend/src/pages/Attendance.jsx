import { useEffect, useState } from 'react';
import { getEmployees, getAttendance, markAttendance } from '../api';
import {
  CalendarCheck, X, CheckCircle2, XCircle, AlertTriangle,
  Search, RotateCcw, CalendarDays,
  CheckCheck, Ban, Inbox, Info,
} from 'lucide-react';

function MarkAttendanceModal({ employees, onClose, onSuccess }) {
  const [form, setForm] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.employee_id) e.employee_id = 'Select an employee';
    if (!form.date) e.date = 'Date is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    setLoading(true); setError('');
    try {
      const res = await markAttendance(form);
      onSuccess(res.data, form.employee_id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark attendance');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h2 className="modal-title">Mark Attendance</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {error && (
          <div className="alert alert-error"><AlertTriangle size={15} /> {error}</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Employee</label>
            <select
              className={`form-input ${formErrors.employee_id ? 'error' : ''}`}
              value={form.employee_id}
              onChange={e => { setForm(p => ({ ...p, employee_id: e.target.value })); setFormErrors(p => ({ ...p, employee_id: '' })); }}
            >
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp.employee_id} value={emp.employee_id}>
                  {emp.employee_id} — {emp.full_name}
                </option>
              ))}
            </select>
            {formErrors.employee_id && (
              <span className="form-error"><AlertTriangle size={11} /> {formErrors.employee_id}</span>
            )}
          </div>

          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className={`form-input ${formErrors.date ? 'error' : ''}`}
                value={form.date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => { setForm(p => ({ ...p, date: e.target.value })); setFormErrors(p => ({ ...p, date: '' })); }}
              />
              {formErrors.date && <span className="form-error"><AlertTriangle size={11} /> {formErrors.date}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                {['Present', 'Absent'].map(s => (
                  <button
                    key={s} type="button"
                    onClick={() => setForm(p => ({ ...p, status: s }))}
                    className={`status-toggle ${form.status === s ? (s === 'Present' ? 'active-present' : 'active-absent') : ''}`}
                  >
                    {s === 'Present'
                      ? <CheckCircle2 size={14} />
                      : <XCircle size={14} />}
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving...</>
              : <><CalendarCheck size={15} /> Save Attendance</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeAttendanceDetail({ employees, selectedEmpId, onSelect, refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (!selectedEmpId) { setData(null); return; }
    setLoading(true);
    getAttendance(selectedEmpId)
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedEmpId, refreshKey]);

  const filtered = data?.records?.filter(r => !dateFilter || r.date === dateFilter) || [];

  return (
    <div className="card" style={{ flex: 1 }}>
      <div className="card-title">
        <CalendarDays size={16} strokeWidth={1.8} style={{ color: 'var(--accent)' }} />
        Attendance Records
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: 180 }}>
          <label className="form-label">Employee</label>
          <select
            className="form-input"
            value={selectedEmpId}
            onChange={e => onSelect(e.target.value)}
          >
            <option value="">Select employee</option>
            {employees.map(emp => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_id} — {emp.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ minWidth: 160 }}>
          <label className="form-label">Filter by Date</label>
          <input
            type="date"
            className="form-input"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
        </div>

        {dateFilter && (
          <div className="form-group" style={{ justifyContent: 'flex-end' }}>
            <label className="form-label" style={{ visibility: 'hidden' }}>_</label>
            <button className="btn btn-ghost btn-sm" onClick={() => setDateFilter('')}>
              <RotateCcw size={13} /> Clear
            </button>
          </div>
        )}
      </div>

      {!selectedEmpId ? (
        <div className="empty-state">
          <Search size={38} strokeWidth={1.2} style={{ opacity: 0.2 }} />
          <div className="empty-title">Select an employee</div>
          <div className="empty-desc">Choose an employee above to view their attendance records.</div>
        </div>
      ) : loading ? (
        <div className="loading-center"><div className="spinner" /><span>Loading records...</span></div>
      ) : (
        <>
          {data && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Total Records', val: data.total_records, color: 'var(--accent)', Icon: CalendarDays },
                { label: 'Total Present', val: data.total_present, color: 'var(--success)', Icon: CheckCheck },
                { label: 'Total Absent', val: data.total_records - data.total_present, color: 'var(--danger)', Icon: Ban },
              ].map(({ label, val, color, Icon }) => (
                <div key={label} style={{ flex: 1, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    <Icon size={11} /> {label}
                  </div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, fontWeight: 800, color }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <Inbox size={36} strokeWidth={1.2} style={{ opacity: 0.2 }} />
              <div className="empty-title">No records found</div>
              <div className="empty-desc">{dateFilter ? 'No attendance on this date.' : 'No attendance marked yet.'}</div>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                    <th>Marked At</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r._id}>
                      <td className="td-strong">{r.date}</td>
                      <td style={{ fontSize: 13 }}>
                        {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
                      </td>
                      <td>
                        <span className={`badge ${r.status === 'Present' ? 'badge-present' : 'badge-absent'}`}>
                          {r.status === 'Present'
                            ? <CheckCircle2 size={11} />
                            : <XCircle size={11} />}
                          {r.status}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {r.marked_at
                          ? new Date(r.marked_at).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getEmployees()
      .then(res => setEmployees(res.data))
      .catch(() => setError('Failed to load employees'));
  }, []);

  const handleAttendanceSuccess = (savedRecord, empId) => {
    setSelectedEmpId(empId);
    setRefreshKey(k => k + 1);
    setSuccessMsg(`Attendance marked as ${savedRecord.status} successfully!`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">Track and manage employee attendance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <CalendarCheck size={16} strokeWidth={2} /> Mark Attendance
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success"><CheckCircle2 size={15} /> {successMsg}</div>
      )}
      {error && (
        <div className="alert alert-error"><AlertTriangle size={15} /> {error}</div>
      )}
      {employees.length === 0 && !error && (
        <div className="alert" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
          <Info size={15} />
          No employees found.{' '}
          <a href="/employees" style={{ color: 'var(--accent)', marginLeft: 4 }}>Add employees first →</a>
        </div>
      )}

      <EmployeeAttendanceDetail
        employees={employees}
        selectedEmpId={selectedEmpId}
        onSelect={setSelectedEmpId}
        refreshKey={refreshKey}
      />

      {showModal && (
        <MarkAttendanceModal
          employees={employees}
          onClose={() => setShowModal(false)}
          onSuccess={handleAttendanceSuccess}
        />
      )}
    </div>
  );
}