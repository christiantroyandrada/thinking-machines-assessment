import { useEffect, useRef, useState } from 'react';
import { updateCheckIn } from '../api.js';

export default function EditCheckInModal({ checkIn, onSaved, onClose }) {
  const [hours, setHours] = useState(checkIn.hours);
  const [tag, setTag] = useState(checkIn.tag);
  const [activities, setActivities] = useState(checkIn.activities);
  const [date, setDate] = useState(String(checkIn.date).slice(0, 10));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const hoursRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    hoursRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateCheckIn(checkIn.id, { hours: Number(hours), tag, activities, date });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="card modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-checkin-title"
      >
        <h3 id="edit-checkin-title">Edit check-in</h3>
        <label htmlFor="edit-hours">Hours</label>
        <input ref={hoursRef} id="edit-hours" type="number" step="0.5" min="0.5" max="24" value={hours} onChange={(e) => setHours(e.target.value)} />
        <label htmlFor="edit-tag">Tag</label>
        <input id="edit-tag" value={tag} onChange={(e) => setTag(e.target.value)} />
        <label htmlFor="edit-activities">Activities</label>
        <input id="edit-activities" value={activities} onChange={(e) => setActivities(e.target.value)} />
        <label htmlFor="edit-date">Date</label>
        <input id="edit-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        {error && <p className="error-text">{error}</p>}
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
}
