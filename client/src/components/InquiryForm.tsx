import { FormEvent, useState } from 'react';
import { sendInquiry } from '../api';

interface Props {
  listingId: number;
  sellerName: string;
}

export default function InquiryForm({ listingId, sellerName }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      await sendInquiry(listingId, { name, email, phone, message });
      setStatus('success');
      setName(''); setEmail(''); setPhone(''); setMessage('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="panel">
      <h2>Contact {sellerName}</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Interested in this car? Send a message — the seller will be notified.</p>
      {status === 'success' && (
        <div className="alert alert-success">Message sent! The seller will get back to you shortly.</div>
      )}
      {status === 'error' && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-2col">
          <div className="form-field">
            <label htmlFor="inq-name">Your name *</label>
            <input id="inq-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div className="form-field">
            <label htmlFor="inq-email">Email *</label>
            <input id="inq-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@email.com" />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="inq-phone">Phone</label>
          <input id="inq-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 000-0000" />
        </div>
        <div className="form-field">
          <label htmlFor="inq-message">Message</label>
          <textarea id="inq-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Is the car still available? Can I schedule a test drive?" />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  );
}
