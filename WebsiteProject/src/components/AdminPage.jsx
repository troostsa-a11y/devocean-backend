import { useState } from 'react';
import { Shield, UserPlus, UserX, Mail, Settings, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

const LANGUAGE_OPTIONS = [
  { code: 'EN', label: 'English (UK)' },
  { code: 'EN-US', label: 'English (US)' },
  { code: 'PT', label: 'Portuguese' },
  { code: 'DE', label: 'German' },
  { code: 'FR', label: 'French' },
  { code: 'ES', label: 'Spanish' },
  { code: 'IT', label: 'Italian' },
  { code: 'NL', label: 'Dutch' },
  { code: 'AF', label: 'Afrikaans' },
  { code: 'SV', label: 'Swedish' },
  { code: 'PL', label: 'Polish' },
  { code: 'RU', label: 'Russian' },
  { code: 'JA', label: 'Japanese' },
  { code: 'ZH', label: 'Chinese' },
  { code: 'ZU', label: 'Zulu' },
  { code: 'SW', label: 'Swahili' },
  { code: 'CS', label: 'Czech' },
  { code: 'PT-BR', label: 'Portuguese (Brazil)' },
];

const STORAGE_KEY_URL = 'devocean-admin-url';
const STORAGE_KEY_KEY = 'devocean-admin-key';

function getStored(key) {
  try {
    if (key === STORAGE_KEY_KEY) return sessionStorage.getItem(key) || '';
    return localStorage.getItem(key) || '';
  } catch { return ''; }
}
function setStored(key, val) {
  try {
    if (key === STORAGE_KEY_KEY) { sessionStorage.setItem(key, val); return; }
    localStorage.setItem(key, val);
  } catch {}
}
function clearStored(key) {
  try {
    if (key === STORAGE_KEY_KEY) { sessionStorage.removeItem(key); return; }
    localStorage.removeItem(key);
  } catch {}
}

export default function AdminPage() {
  const [, navigate] = useLocation();
  const [apiUrl, setApiUrl] = useState(() => getStored(STORAGE_KEY_URL));
  const [apiKey, setApiKey] = useState(() => getStored(STORAGE_KEY_KEY));
  const [showKey, setShowKey] = useState(false);
  const [configured, setConfigured] = useState(() => !!getStored(STORAGE_KEY_URL) && !!getStored(STORAGE_KEY_KEY));
  const [activeTab, setActiveTab] = useState('create');

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!apiUrl.trim() || !apiKey.trim()) return;
    const cleanUrl = apiUrl.trim().replace(/\/+$/, '');
    setApiUrl(cleanUrl);
    setStored(STORAGE_KEY_URL, cleanUrl);
    setStored(STORAGE_KEY_KEY, apiKey.trim());
    setConfigured(true);
  };

  const handleClearConfig = () => {
    clearStored(STORAGE_KEY_URL);
    clearStored(STORAGE_KEY_KEY);
    setApiUrl('');
    setApiKey('');
    setConfigured(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 relative z-50" style={{ paddingTop: 'var(--stack-h, 96px)' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#9e4b13] mb-6 transition-colors"
          data-testid="link-back-home"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to website
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#9e4b13] flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">DEVOCEAN Admin</h1>
            <p className="text-sm text-slate-500">Manage bookings & email automation</p>
          </div>
        </div>

        {!configured ? (
          <ConfigPanel
            apiUrl={apiUrl}
            apiKey={apiKey}
            showKey={showKey}
            onUrlChange={setApiUrl}
            onKeyChange={setApiKey}
            onToggleKey={() => setShowKey(!showKey)}
            onSave={handleSaveConfig}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-1">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'create'
                      ? 'bg-[#9e4b13] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  data-testid="tab-create-booking"
                >
                  <UserPlus className="w-4 h-4" />
                  New Booking
                </button>
                <button
                  onClick={() => setActiveTab('update-email')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'update-email'
                      ? 'bg-[#9e4b13] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  data-testid="tab-update-email"
                >
                  <Mail className="w-4 h-4" />
                  Update Email
                </button>
                <button
                  onClick={() => setActiveTab('cancel')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'cancel'
                      ? 'bg-[#9e4b13] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  data-testid="tab-cancel-booking"
                >
                  <UserX className="w-4 h-4" />
                  Cancel Booking
                </button>
              </div>
              <button
                onClick={handleClearConfig}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                data-testid="button-settings"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
            </div>

            {activeTab === 'create' ? (
              <CreateBookingForm apiUrl={apiUrl} apiKey={apiKey} />
            ) : activeTab === 'update-email' ? (
              <UpdateEmailForm apiUrl={apiUrl} apiKey={apiKey} />
            ) : (
              <CancelBookingForm apiUrl={apiUrl} apiKey={apiKey} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ConfigPanel({ apiUrl, apiKey, showKey, onUrlChange, onKeyChange, onToggleKey, onSave }) {
  return (
    <form onSubmit={onSave} className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Connection Setup</h2>
      <p className="text-sm text-slate-500 mb-5">Enter your automailer service details. The URL is remembered, but the API key is only kept for this browser session for security.</p>

      <label className="block mb-4">
        <span className="text-sm font-medium text-slate-700">Automailer URL</span>
        <input
          type="url"
          value={apiUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://devocean-automailer.onrender.com"
          className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
          required
          data-testid="input-api-url"
        />
      </label>

      <label className="block mb-5">
        <span className="text-sm font-medium text-slate-700">Admin API Key</span>
        <div className="relative mt-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder="Your secret admin key"
            className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
            required
            data-testid="input-api-key"
          />
          <button
            type="button"
            onClick={onToggleKey}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            data-testid="button-toggle-key"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </label>

      <button
        type="submit"
        className="w-full py-2.5 bg-[#9e4b13] text-white rounded-lg text-sm font-medium hover:bg-[#8a4211] transition-colors"
        data-testid="button-save-config"
      >
        Connect
      </button>
    </form>
  );
}

function CreateBookingForm({ apiUrl, apiKey }) {
  const [form, setForm] = useState({
    groupRef: '',
    firstName: '',
    lastName: '',
    guestEmail: '',
    guestGender: '',
    guestLanguage: 'EN',
    guestCountry: '',
    checkInDate: '',
    checkOutDate: '',
  });
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [result, setResult] = useState(null);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Creating booking...' });
    setResult(null);

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const guestName = lastName ? `${firstName} ${lastName}` : firstName;

    try {
      const body = {
        groupRef: form.groupRef.trim(),
        guestName,
        firstName,
        guestEmail: form.guestEmail.trim(),
        guestLanguage: form.guestLanguage,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
      };
      if (form.guestGender) body.guestGender = form.guestGender;
      if (form.guestCountry.trim()) body.guestCountry = form.guestCountry.trim().toUpperCase();

      const res = await fetch(`${apiUrl}/api/admin/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': apiKey,
        },
        body: JSON.stringify(body),
      });

      let data;
      try { data = await res.json(); } catch {
        throw new Error(`Server returned ${res.status} - check your automailer URL and try again`);
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      setResult(data);
      setStatus({ type: 'success', message: data.message });
      setForm({
        groupRef: '', firstName: '', lastName: '', guestEmail: '',
        guestGender: '', guestLanguage: 'EN', guestCountry: '',
        checkInDate: '', checkOutDate: '',
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Create Manual Booking</h2>
      <p className="text-sm text-slate-500 mb-5">Add a Beds24 reservation that didn't trigger an email notification. All 4 guest emails will be scheduled automatically.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Beds24 Group Reference *</span>
          <input
            type="text"
            value={form.groupRef}
            onChange={update('groupRef')}
            placeholder="e.g. 12345678"
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
            required
            data-testid="input-group-ref"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">First Name *</span>
            <input
              type="text"
              value={form.firstName}
              onChange={update('firstName')}
              placeholder="e.g. Dane"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
              required
              data-testid="input-first-name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Last Name *</span>
            <input
              type="text"
              value={form.lastName}
              onChange={update('lastName')}
              placeholder="e.g. Botton"
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
              required
              data-testid="input-last-name"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Guest Email *</span>
          <input
            type="email"
            value={form.guestEmail}
            onChange={update('guestEmail')}
            placeholder="guest@example.com"
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
            required
            data-testid="input-guest-email"
          />
        </label>

        <div className="grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Gender</span>
            <select
              value={form.guestGender}
              onChange={update('guestGender')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none bg-white"
              data-testid="select-gender"
            >
              <option value="">Unknown</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Language</span>
            <select
              value={form.guestLanguage}
              onChange={update('guestLanguage')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none bg-white"
              data-testid="select-language"
            >
              {LANGUAGE_OPTIONS.map(({ code, label }) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Country</span>
            <input
              type="text"
              value={form.guestCountry}
              onChange={update('guestCountry')}
              placeholder="e.g. CZ"
              maxLength={2}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none uppercase"
              data-testid="input-country"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Check-in Date *</span>
            <input
              type="date"
              value={form.checkInDate}
              onChange={update('checkInDate')}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
              required
              data-testid="input-checkin"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Check-out Date *</span>
            <input
              type="date"
              value={form.checkOutDate}
              onChange={update('checkOutDate')}
              min={form.checkInDate || undefined}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
              required
              data-testid="input-checkout"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={status.type === 'loading'}
        className="mt-6 w-full py-2.5 bg-[#9e4b13] text-white rounded-lg text-sm font-medium hover:bg-[#8a4211] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        data-testid="button-create-booking"
      >
        {status.type === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
        ) : (
          <><UserPlus className="w-4 h-4" /> Create Booking & Schedule Emails</>
        )}
      </button>

      <StatusMessage status={status} />

      {result && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h3 className="text-sm font-semibold text-emerald-800 mb-2">Scheduled Emails</h3>
          <ul className="space-y-1">
            {result.scheduledEmails?.map((email, i) => (
              <li key={i} className="text-xs text-emerald-700 flex justify-between">
                <span className="font-medium">{formatEmailType(email.type)}</span>
                <span>{new Date(email.scheduledFor).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

function UpdateEmailForm({ apiUrl, apiKey }) {
  const [groupRef, setGroupRef] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Updating email...' });
    setResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/admin/update-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': apiKey,
        },
        body: JSON.stringify({
          groupRef: groupRef.trim(),
          newEmail: newEmail.trim(),
        }),
      });

      let data;
      try { data = await res.json(); } catch {
        throw new Error(`Server returned ${res.status} - check your automailer URL and try again`);
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      setResult(data);
      setStatus({ type: 'success', message: data.message });
      setGroupRef('');
      setNewEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Update Guest Email</h2>
      <p className="text-sm text-slate-500 mb-5">Replace an OTA relay address with the guest's real email. All future pending emails will be sent to the new address.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Beds24 Group Reference *</span>
          <input
            type="text"
            value={groupRef}
            onChange={(e) => setGroupRef(e.target.value)}
            placeholder="e.g. 12345678"
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
            required
            data-testid="input-update-group-ref"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">New Email Address *</span>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="guest.real.email@example.com"
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
            required
            data-testid="input-new-email"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status.type === 'loading'}
        className="mt-6 w-full py-2.5 bg-[#9e4b13] text-white rounded-lg text-sm font-medium hover:bg-[#8a4211] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        data-testid="button-update-email"
      >
        {status.type === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
        ) : (
          <><Mail className="w-4 h-4" /> Update Email Address</>
        )}
      </button>

      <StatusMessage status={status} />

      {result && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h3 className="text-sm font-semibold text-emerald-800 mb-2">Email Updated</h3>
          <div className="space-y-1 text-xs text-emerald-700">
            <p><span className="font-medium">Guest:</span> {result.booking?.guestName}</p>
            <p><span className="font-medium">Old email:</span> {result.booking?.oldEmail}</p>
            <p><span className="font-medium">New email:</span> {result.booking?.newEmail}</p>
            <p><span className="font-medium">Pending emails redirected:</span> {result.pendingEmailsUpdated}</p>
          </div>
        </div>
      )}
    </form>
  );
}

function CancelBookingForm({ apiUrl, apiKey }) {
  const [groupRef, setGroupRef] = useState('');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!confirmOpen) {
      setConfirmOpen(true);
      return;
    }

    setStatus({ type: 'loading', message: 'Cancelling booking...' });
    setConfirmOpen(false);

    try {
      const body = { groupRef: groupRef.trim() };
      if (reason.trim()) body.reason = reason.trim();

      const res = await fetch(`${apiUrl}/api/admin/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': apiKey,
        },
        body: JSON.stringify(body),
      });

      let data;
      try { data = await res.json(); } catch {
        throw new Error(`Server returned ${res.status} - check your automailer URL and try again`);
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      setStatus({ type: 'success', message: data.message });
      setGroupRef('');
      setReason('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Cancel Booking</h2>
      <p className="text-sm text-slate-500 mb-5">Cancel a reservation by its Beds24 group reference. All pending emails will be stopped and a cancellation email will be sent to the guest.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Beds24 Group Reference *</span>
          <input
            type="text"
            value={groupRef}
            onChange={(e) => { setGroupRef(e.target.value); setConfirmOpen(false); }}
            placeholder="e.g. 12345678"
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
            required
            data-testid="input-cancel-group-ref"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Reason (optional)</span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Guest requested cancellation"
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
            data-testid="input-cancel-reason"
          />
        </label>
      </div>

      {confirmOpen && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 font-medium">Are you sure you want to cancel booking {groupRef}?</p>
          <p className="text-xs text-amber-600 mt-1">This will stop all pending emails and send a cancellation notice to the guest.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status.type === 'loading'}
        className={`mt-6 w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
          confirmOpen
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-slate-800 text-white hover:bg-slate-700'
        }`}
        data-testid="button-cancel-booking"
      >
        {status.type === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
        ) : confirmOpen ? (
          <><UserX className="w-4 h-4" /> Yes, Cancel This Booking</>
        ) : (
          <><UserX className="w-4 h-4" /> Cancel Booking</>
        )}
      </button>

      <StatusMessage status={status} />
    </form>
  );
}

function StatusMessage({ status }) {
  if (status.type === 'idle' || status.type === 'loading') return null;

  return (
    <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
      status.type === 'success'
        ? 'bg-emerald-50 border border-emerald-200'
        : 'bg-red-50 border border-red-200'
    }`}>
      {status.type === 'success' ? (
        <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
      )}
      <p className={`text-sm ${
        status.type === 'success' ? 'text-emerald-700' : 'text-red-700'
      }`}>
        {status.message}
      </p>
    </div>
  );
}

function formatEmailType(type) {
  const labels = {
    post_booking: 'Post-Booking Confirmation',
    pre_arrival: 'Pre-Arrival Info',
    arrival: 'Arrival Welcome',
    post_departure: 'Post-Departure Thank You',
  };
  return labels[type] || type;
}
