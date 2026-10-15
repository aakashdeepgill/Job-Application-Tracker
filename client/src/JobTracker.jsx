import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CirclePlus,
  Clock3,
  ExternalLink,
  MapPin,
  Pencil,
  Search,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];
const FILTERS = ['All applications', ...STATUSES];

function newDraft() {
  return {
    companyName: '',
    role: '',
    status: 'Applied',
    dateApplied: new Date().toISOString().slice(0, 10),
    location: '',
    jobUrl: '',
    notes: '',
  };
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || 'The request could not be completed.');
  }
  return response.status === 204 ? null : response.json();
}

function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function initials(company) {
  return company.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

function statusClass(status) {
  return `status-${status.toLowerCase()}`;
}

export default function JobTracker() {
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('All applications');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState(newDraft);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function loadJobs() {
    setIsLoading(true);
    try {
      const data = await request('/jobs');
      setJobs(data);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === 'Escape') setIsModalOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isModalOpen]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesStatus = filter === 'All applications' || job.status === filter;
      const matchesSearch = !query || `${job.companyName} ${job.role} ${job.location}`.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [filter, jobs, search]);

  const interviewCount = jobs.filter((job) => job.status === 'Interviewing').length;
  const offerCount = jobs.filter((job) => job.status === 'Offer').length;
  const activeCount = jobs.filter((job) => ['Applied', 'Interviewing'].includes(job.status)).length;

  function openCreate() {
    setDraft(newDraft());
    setEditingId(null);
    setIsModalOpen(true);
    setError('');
  }

  function openEdit(job) {
    setDraft({
      companyName: job.companyName,
      role: job.role,
      status: job.status,
      dateApplied: job.dateApplied?.slice(0, 10) || '',
      location: job.location || '',
      jobUrl: job.jobUrl || '',
      notes: job.notes || '',
    });
    setEditingId(job._id);
    setIsModalOpen(true);
    setError('');
  }

  async function saveJob(event) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    const payload = { ...draft, companyName: draft.companyName.trim(), role: draft.role.trim() };
    if (!payload.dateApplied) delete payload.dateApplied;

    try {
      const saved = await request(editingId ? `/jobs/${editingId}` : '/jobs', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setJobs((current) => editingId
        ? current.map((job) => job._id === saved._id ? saved : job)
        : [saved, ...current]);
      setIsModalOpen(false);
      setDraft(newDraft());
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStatus(job, status) {
    try {
      const updated = await request(`/jobs/${job._id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...job, status }),
      });
      setJobs((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteJob(job) {
    if (!window.confirm(`Delete the ${job.role} application at ${job.companyName}?`)) return;
    try {
      await request(`/jobs/${job._id}`, { method: 'DELETE' });
      setJobs((current) => current.filter((item) => item._id !== job._id));
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="tracker-app">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Rolemark home">
          <span className="brand-symbol"><BriefcaseBusiness size={18} strokeWidth={2.2} /></span>
          <span>rolemark<span className="brand-dot">.</span></span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#applications"><span className="nav-icon"><BriefcaseBusiness size={16} /></span><span>Applications</span><span className="nav-count">{jobs.length}</span></a>
        </nav>

        <div className="sidebar-bottom">
          <div className="week-card">
            <span className="week-icon"><Sparkles size={15} /></span>
            <p>Small steps<br /><strong>move you forward.</strong></p>
            <span className="week-decoration" aria-hidden="true">✳</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="applications">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span>/</span><strong>Applications</strong></div>
          <div className="topbar-right"><span className="today-label"><CalendarDays size={14} /> {new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span><span className="topbar-divider" /><span className="sync-state"><span /> SYNCED</span></div>
        </header>

        <div className="page-content">
          <section className="page-heading">
            <div>
              <p className="page-eyebrow">YOUR SEARCH, IN ONE PLACE</p>
              <h1>Applications<span className="heading-period">.</span></h1>
              <p className="heading-copy">Keep every opportunity moving forward.</p>
            </div>
            <button className="add-button" onClick={openCreate} type="button"><CirclePlus size={17} /><span>New application</span></button>
          </section>

          <section className="stats-row" aria-label="Application summary">
            <div className="stat-item"><span className="stat-label">TOTAL TRACKED</span><div><strong>{jobs.length}</strong><span className="stat-context">applications</span></div><BriefcaseBusiness className="stat-mark mark-blue" size={18} /></div>
            <div className="stat-item"><span className="stat-label">IN MOTION</span><div><strong>{activeCount}</strong><span className="stat-context">awaiting next step</span></div><ArrowUpRight className="stat-mark mark-green" size={18} /></div>
            <div className="stat-item"><span className="stat-label">INTERVIEWS</span><div><strong>{interviewCount}</strong><span className="stat-context">in conversation</span></div><CalendarDays className="stat-mark mark-coral" size={18} /></div>
            <div className="stat-item"><span className="stat-label">OFFERS</span><div><strong>{offerCount}</strong><span className="stat-context">to celebrate</span></div><Sparkles className="stat-mark mark-lime" size={18} /></div>
          </section>

          <section className="pipeline-section" aria-label="Application pipeline">
            <div className="pipeline-heading"><div><span className="section-kicker">THE PIPELINE</span><h2>Where things stand</h2></div><span className="pipeline-total">{jobs.length} TOTAL</span></div>
            <div className="pipeline-bars">
              {STATUSES.map((status) => {
                const count = jobs.filter((job) => job.status === status).length;
                const ratio = jobs.length ? Math.max(count / jobs.length * 100, count ? 4 : 0) : 0;
                return <div className="pipeline-stage" key={status}><div className="stage-copy"><span className={`stage-dot ${statusClass(status)}`} />{status}<strong>{count}</strong></div><div className="stage-track"><span className={statusClass(status)} style={{ width: `${ratio}%` }} /></div></div>;
              })}
            </div>
          </section>

          <section className="applications-section" aria-label="Job applications">
            <div className="applications-heading"><div><span className="section-kicker">YOUR LIST</span><h2>All applications <span className="list-count">{filteredJobs.length}</span></h2></div>
              <label className="search-box"><Search size={15} /><input aria-label="Search applications" onChange={(event) => setSearch(event.target.value)} placeholder="Search company or role" value={search} />{search && <button aria-label="Clear search" onClick={() => setSearch('')} type="button"><X size={13} /></button>}</label>
            </div>
            <div className="filter-tabs" role="tablist" aria-label="Filter by application status">
              {FILTERS.map((status) => {
                const count = status === 'All applications' ? jobs.length : jobs.filter((job) => job.status === status).length;
                return <button aria-selected={filter === status} className={filter === status ? 'selected' : ''} key={status} onClick={() => setFilter(status)} role="tab" type="button">{status}<span>{count}</span></button>;
              })}
            </div>

            {error && !isModalOpen && <div className="error-banner" role="alert"><span>{error}</span><button onClick={loadJobs} type="button">Retry</button></div>}
            <div className="table-wrap">
              <table className="jobs-table">
                <thead><tr><th>COMPANY / ROLE</th><th>LOCATION</th><th>DATE APPLIED</th><th>STATUS</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {isLoading ? <tr><td className="table-empty" colSpan="5"><span className="table-loader" />Loading your applications…</td></tr> : filteredJobs.map((job, index) => (
                    <tr className="job-row" key={job._id} style={{ '--row-index': index }}>
                      <td><div className="company-cell"><span className={`company-mark mark-tone-${index % 5}`}>{initials(job.companyName)}</span><span className="company-info"><strong>{job.companyName}</strong><span>{job.role}</span></span></div></td>
                      <td className="location-cell">{job.location ? <><MapPin size={13} />{job.location}</> : <span className="muted-dash">—</span>}</td>
                      <td className="date-cell"><Clock3 size={13} />{formatDate(job.dateApplied)}</td>
                      <td><label className={`status-select-wrap ${statusClass(job.status)}`}><span>{job.status}</span><ChevronDown size={12} /><select aria-label={`Change ${job.companyName} status`} onChange={(event) => updateStatus(job, event.target.value)} value={job.status}>{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></label></td>
                      <td><div className="row-actions"><button aria-label={`Edit ${job.companyName} application`} onClick={() => openEdit(job)} title="Edit application" type="button"><Pencil size={14} /></button>{job.jobUrl && <a aria-label={`Open ${job.companyName} job listing`} href={job.jobUrl} rel="noreferrer" target="_blank" title="Open job listing"><ExternalLink size={14} /></a>}<button aria-label={`Delete ${job.companyName} application`} onClick={() => deleteJob(job)} title="Delete application" type="button"><Trash2 size={14} /></button></div></td>
                    </tr>
                  ))}
                  {!isLoading && filteredJobs.length === 0 && <tr><td className="table-empty" colSpan="5"><strong>{jobs.length ? 'No matches for this view' : 'Your next chapter starts here'}</strong><span>{jobs.length ? 'Try a different status or search.' : 'Your applications will appear here.'}</span></td></tr>}
                </tbody>
              </table>
            </div>
            <div className="list-footer"><span>Showing {filteredJobs.length} of {jobs.length} applications</span><span><ArrowDownRight size={13} /> Updated as you go</span></div>
          </section>
          <footer className="main-footer"><span>ROLEMARK / JOB SEARCH, ORGANIZED</span><span>A little progress, every day.</span></footer>
        </div>
      </main>

      {isModalOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsModalOpen(false); }}>
        <section aria-labelledby="form-title" aria-modal="true" className="job-modal" role="dialog">
          <div className="modal-heading"><div><span className="modal-kicker">APPLICATION DETAILS</span><h2 id="form-title">{editingId ? 'Edit application' : 'Add an opportunity'}</h2></div><button aria-label="Close form" className="modal-close" onClick={() => setIsModalOpen(false)} type="button"><X size={18} /></button></div>
          <form className="job-form" onSubmit={saveJob}>
            <div className="form-grid">
              <label className="form-field"><span>Company <b>*</b></span><input autoFocus maxLength={120} onChange={(event) => setDraft({ ...draft, companyName: event.target.value })} placeholder="e.g. Northstar Studio" required value={draft.companyName} /></label>
              <label className="form-field"><span>Role <b>*</b></span><input maxLength={120} onChange={(event) => setDraft({ ...draft, role: event.target.value })} placeholder="e.g. Product Designer" required value={draft.role} /></label>
              <label className="form-field"><span>Status</span><select onChange={(event) => setDraft({ ...draft, status: event.target.value })} value={draft.status}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label className="form-field"><span>Date applied</span><input onChange={(event) => setDraft({ ...draft, dateApplied: event.target.value })} type="date" value={draft.dateApplied} /></label>
              <label className="form-field"><span>Location</span><input maxLength={120} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="City, region, or remote" value={draft.location} /></label>
              <label className="form-field"><span>Job listing</span><input maxLength={500} onChange={(event) => setDraft({ ...draft, jobUrl: event.target.value })} placeholder="https://..." type="url" value={draft.jobUrl} /></label>
              <label className="form-field full-field"><span>Notes</span><textarea maxLength={2000} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Recruiter, next steps, or details to remember" rows={3} value={draft.notes} /></label>
            </div>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="modal-footer"><span><Check size={13} /> Saved to your tracker</span><div><button className="cancel-button" onClick={() => setIsModalOpen(false)} type="button">Cancel</button><button className="save-button" disabled={isSaving} type="submit">{isSaving ? 'Saving…' : editingId ? 'Save changes' : 'Add application'}</button></div></div>
          </form>
        </section>
      </div>}
    </div>
  );
}