import { useEffect, useState } from 'react';
import { getEmployees, createEmployee, deleteEmployee } from '../api';
import {
  Plus, Trash2, Search, X, UserPlus,
  Users, AlertTriangle, CheckCircle2
} from 'lucide-react';

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Legal', 'Support'];

function AddEmployeeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ employee_id: '', full_name: '', email: '', department: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.employee_id.trim()) e.employee_id = 'Employee ID is required';
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(form.email)) e.email = 'Invalid email format';
    if (!form.department) e.department = 'Department is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true); setApiError('');
    try {
      await createEmployee(form);
      onSuccess();
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.detail || 'Failed to add employee');
    } finally { setLoading(false); }
  };

  const field = (key, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        className={`form-input ${errors[key] ? 'error' : ''}`}
        type={type} placeholder={placeholder} value={form[key]}
        onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })); }}
      />
      {errors[key] && <span className="form-error"><AlertTriangle size={11} /> {errors[key]}</span>}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add New Employee</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        {apiError && (
          <div className="alert alert-error">
            <AlertTriangle size={15} /> {apiError}
          </div>
        )}
        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {field('employee_id', 'Employee ID', 'text', 'e.g. EMP001')}
          {field('full_name', 'Full Name', 'text', 'e.g. Jane Smith')}
          {field('email', 'Email Address', 'email', 'jane@company.com')}
          <div className="form-group">
            <label className="form-label">Department</label>
            <div style={{ position: 'relative' }}>
              <select
                className={`form-input ${errors.department ? 'error' : ''}`}
                value={form.department}
                onChange={e => { setForm(p => ({ ...p, department: e.target.value })); setErrors(p => ({ ...p, department: '' })); }}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {errors.department && <span className="form-error"><AlertTriangle size={11} /> {errors.department}</span>}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading
              ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Adding...</>
              : <><UserPlus size={15} /> Add Employee</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ employee, onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h2 className="modal-title">Delete Employee</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div style={{ padding: '4px 0 8px', color: 'var(--text-2)', fontSize: 14, lineHeight: 1.7 }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text)' }}>{employee?.full_name}</strong>{' '}
          ({employee?.employee_id})?
          <br />
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, color: 'var(--danger)', fontSize: 13 }}>
            <AlertTriangle size={13} />
            This will also delete all attendance records. This cannot be undone.
          </span>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading} style={{ padding: '10px 20px' }}>
            {loading
              ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Deleting...</>
              : <><Trash2 size={14} /> Delete Employee</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = () => {
    setLoading(true);
    getEmployees()
      .then(res => setEmployees(res.data))
      .catch(() => setError('Failed to load employees'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.employee_id);
      const name = deleteTarget.full_name;
      setDeleteTarget(null);
      flash(`${name} deleted successfully`);
      load();
    } catch {
      setError('Failed to delete employee');
    } finally { setDeleting(false); }
  };

  const flash = msg => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const departments = [...new Set(employees.map(e => e.department))].sort();
  const filtered = employees.filter(e => {
    const s = search.toLowerCase();
    return (
      (!s || e.full_name.toLowerCase().includes(s) || e.employee_id.toLowerCase().includes(s) || e.email.toLowerCase().includes(s)) &&
      (!deptFilter || e.department === deptFilter)
    );
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="page-subtitle">{employees.length} total employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} strokeWidth={2.5} /> Add Employee
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={15} /> {successMsg}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={15} className="search-icon" />
          <input
            className="form-input search-input"
            placeholder="Search by name, ID, or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>
              <X size={13} />
            </button>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <select
            className="form-input"
            style={{ width: 185, paddingRight: 36 }}
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-center"><div className="spinner" /><span>Loading employees...</span></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Users size={40} strokeWidth={1.2} style={{ opacity: 0.2 }} />
            <div className="empty-title">{employees.length === 0 ? 'No employees yet' : 'No results found'}</div>
            <div className="empty-desc">
              {employees.length === 0 ? 'Add your first employee to get started.' : 'Try adjusting your search or filter.'}
            </div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp._id} className="slide-in">
                  <td>
                    <span className="id-pill">{emp.employee_id}</span>
                  </td>
                  <td className="td-strong">{emp.full_name}</td>
                  <td>{emp.email}</td>
                  <td><span className="badge badge-dept">{emp.department}</span></td>
                  <td style={{ fontSize: 13 }}>
                    {emp.created_at
                      ? new Date(emp.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(emp)}>
                      <Trash2 size={13} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => { load(); flash('Employee added successfully!'); }}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          employee={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}