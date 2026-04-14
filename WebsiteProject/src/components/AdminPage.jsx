import { useState, useEffect, useRef } from 'react';
import { Shield, UserPlus, UserX, Mail, Settings, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, ArrowLeft, CalendarDays, Users, Upload, Send, Download, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';
import * as XLSX from 'xlsx';

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
      <div className={`${activeTab === 'guests' ? 'max-w-5xl' : 'max-w-2xl'} mx-auto px-4 py-8 transition-all duration-200`}>
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
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex w-full gap-0.5 bg-white rounded-lg border border-slate-200 p-1">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex flex-1 items-center justify-center gap-1 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
                  className={`flex flex-1 items-center justify-center gap-1 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
                  onClick={() => setActiveTab('modify-dates')}
                  className={`flex flex-1 items-center justify-center gap-1 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'modify-dates'
                      ? 'bg-[#9e4b13] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  data-testid="tab-modify-dates"
                >
                  <CalendarDays className="w-4 h-4" />
                  Modify Dates
                </button>
                <button
                  onClick={() => setActiveTab('cancel')}
                  className={`flex flex-1 items-center justify-center gap-1 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'cancel'
                      ? 'bg-[#9e4b13] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  data-testid="tab-cancel-booking"
                >
                  <UserX className="w-4 h-4" />
                  Cancel Booking
                </button>
                <button
                  onClick={() => setActiveTab('guests')}
                  className={`flex flex-1 items-center justify-center gap-1 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === 'guests'
                      ? 'bg-[#9e4b13] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  data-testid="tab-guests"
                >
                  <Users className="w-4 h-4" />
                  Guests
                </button>
              </div>
              <button
                onClick={handleClearConfig}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors self-start"
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
            ) : activeTab === 'modify-dates' ? (
              <ModifyDatesForm apiUrl={apiUrl} apiKey={apiKey} />
            ) : activeTab === 'guests' ? (
              <GuestsTab apiUrl={apiUrl} apiKey={apiKey} />
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

function ModifyDatesForm({ apiUrl, apiKey }) {
  const [groupRef, setGroupRef] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Updating dates...' });
    setResult(null);

    try {
      const res = await fetch(`${apiUrl}/api/admin/modify-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': apiKey,
        },
        body: JSON.stringify({
          groupRef: groupRef.trim(),
          checkInDate,
          checkOutDate,
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
      setCheckInDate('');
      setCheckOutDate('');
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Modify Booking Dates</h2>
      <p className="text-sm text-slate-500 mb-5">Update the check-in and check-out dates for an existing booking. All pending emails will be cancelled and rescheduled with the new dates, and a fresh post-booking confirmation will be sent to the guest.</p>

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
            data-testid="input-modify-group-ref"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">New Check-in Date *</span>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
              required
              data-testid="input-modify-checkin"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">New Check-out Date *</span>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              min={checkInDate || undefined}
              className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
              required
              data-testid="input-modify-checkout"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={status.type === 'loading'}
        className="mt-6 w-full py-2.5 bg-[#9e4b13] text-white rounded-lg text-sm font-medium hover:bg-[#8a4211] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        data-testid="button-modify-dates"
      >
        {status.type === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
        ) : (
          <><CalendarDays className="w-4 h-4" /> Update Dates & Resend Confirmation</>
        )}
      </button>

      <StatusMessage status={status} />

      {result && (
        <div className="mt-4 space-y-3">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h3 className="text-sm font-semibold text-emerald-800 mb-2">Dates Updated</h3>
            <div className="space-y-1 text-xs text-emerald-700">
              <p><span className="font-medium">Guest:</span> {result.booking?.guestName}</p>
              <p><span className="font-medium">New check-in:</span> {result.booking?.checkInDate ? new Date(result.booking.checkInDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
              <p><span className="font-medium">New check-out:</span> {result.booking?.checkOutDate ? new Date(result.booking.checkOutDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
              <p><span className="font-medium">Old emails cancelled:</span> {result.cancelledEmails}</p>
            </div>
          </div>
          {result.scheduledEmails?.length > 0 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Rescheduled Emails</h3>
              <ul className="space-y-1">
                {result.scheduledEmails.map((email, i) => (
                  <li key={i} className="text-xs text-blue-700 flex justify-between">
                    <span className="font-medium">{formatEmailType(email.type)}</span>
                    <span>{new Date(email.scheduledFor).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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

// ─── Guest CRM ────────────────────────────────────────────────────────────────

function GuestsTab({ apiUrl, apiKey }) {
  const [subTab, setSubTab] = useState('contacts');
  const subTabBtn = (id, label, Icon) => (
    <button
      onClick={() => setSubTab(id)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        subTab === id ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
      data-testid={`subtab-guests-${id}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
  return (
    <div>
      <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-1 mb-5 inline-flex">
        {subTabBtn('contacts', 'Contacts', Users)}
        {subTabBtn('import', 'Import', Upload)}
        {subTabBtn('broadcast', 'Broadcast', Send)}
      </div>
      {subTab === 'contacts' && <ContactsPanel apiUrl={apiUrl} apiKey={apiKey} />}
      {subTab === 'import' && <ImportPanel apiUrl={apiUrl} apiKey={apiKey} />}
      {subTab === 'broadcast' && <BroadcastPanel apiUrl={apiUrl} apiKey={apiKey} />}
    </div>
  );
}

// ── Parse helpers ─────────────────────────────────────────────────────────────

function sheetToRecords(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array', raw: false });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        resolve(parseBeds24(rows));
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsArrayBuffer(file);
  });
}

function isValidEmail(e) {
  return e && e.includes('@') && !e.includes('guest.booking.com') && !e.includes('reply.airbnb');
}

function parseBeds24(rows) {
  const out = [];
  const seen = new Set();
  for (const r of rows) {
    const rawEmail = String(r['Email'] || r['Guest Email'] || r['email'] || '');
    const emails = rawEmail.split(/[\n\r,;]+/).map(e => e.trim().toLowerCase()).filter(isValidEmail);
    for (const email of emails) {
      if (seen.has(email)) continue;
      seen.add(email);
      const fn = String(r['First Name'] || r['Firstname'] || r['First name'] || '').split(/[\n\r]/)[0].trim();
      const ln = String(r['Last Name'] || r['Lastname'] || r['Last name'] || r['Surname'] || '').split(/[\n\r]/)[0].trim();
      const ph = String(r['Phone'] || r['Telephone'] || r['Mobile'] || '').split(/[\n\r]/)[0].trim();
      const cc = String(r['Country Code'] || r['Country'] || '').split(/[\n\r]/)[0].trim().slice(0, 2).toUpperCase();
      out.push({
        email,
        firstName: fn || null,
        lastName: ln || null,
        phone: ph || null,
        countryCode: cc || null,
        subscribed: true,
        source: 'beds24',
      });
    }
  }
  return out;
}

// ── Import Panel ──────────────────────────────────────────────────────────────

function ImportPanel({ apiUrl, apiKey }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const fileRef = useRef();

  const handleFile = async (f) => {
    setFile(f);
    setPreview(null);
    setStatus({ type: 'idle', message: '' });
    try {
      const records = await sheetToRecords(f);
      setPreview(records);
    } catch (err) {
      setStatus({ type: 'error', message: `Could not parse file: ${err.message}` });
    }
  };

  const handleImport = async () => {
    if (!preview || !preview.length) return;
    setStatus({ type: 'loading', message: `Importing ${preview.length} contacts...` });
    try {
      const res = await fetch(`${apiUrl}/api/admin/guests/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': apiKey },
        body: JSON.stringify({ records: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setStatus({ type: 'success', message: `Done. ${data.imported} new, ${data.updated} updated.` });
      setPreview(null);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Import from Beds24</h2>
      <p className="text-sm text-slate-500 mb-5">Upload a Beds24 guest list export (XLSX or CSV). Existing contacts are safely merged — unsubscribe status is never overwritten.</p>

      <label className="block mb-4">
        <span className="text-sm font-medium text-slate-700">Beds24 export file</span>
        <p className="text-xs text-slate-400 mt-0.5 mb-1">Export from Beds24 › Guests › Export as XLSX</p>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
          data-testid="input-import-file"
        />
      </label>

      {preview && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">{preview.length} contacts parsed</span>
            <span className="text-xs text-slate-400">{preview.filter(r => r.countryCode).length} with country</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 max-h-48">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  {['Email', 'First Name', 'Last Name', 'Country', 'Source'].map(h => (
                    <th key={h} className="px-3 py-2 text-left font-medium text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 8).map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 text-slate-700">{r.email}</td>
                    <td className="px-3 py-1.5 text-slate-600">{r.firstName || '—'}</td>
                    <td className="px-3 py-1.5 text-slate-600">{r.lastName || '—'}</td>
                    <td className="px-3 py-1.5 text-slate-500">{r.countryCode || '—'}</td>
                    <td className="px-3 py-1.5 text-slate-400">{r.source}</td>
                  </tr>
                ))}
                {preview.length > 8 && (
                  <tr className="border-t border-slate-100">
                    <td colSpan={5} className="px-3 py-1.5 text-slate-400 text-center">
                      …and {preview.length - 8} more
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleImport}
            disabled={status.type === 'loading'}
            className="mt-3 w-full py-2.5 bg-[#9e4b13] text-white rounded-lg text-sm font-medium hover:bg-[#8a4211] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="button-import-confirm"
          >
            {status.type === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</>
            ) : (
              <><Upload className="w-4 h-4" /> Import {preview.length} contacts into database</>
            )}
          </button>
        </div>
      )}

      <StatusMessage status={status} />
    </div>
  );
}

// ── Contacts Panel ────────────────────────────────────────────────────────────

function ContactsPanel({ apiUrl, apiKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterSub, setFilterSub] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = async (p = page, s = search, sub = filterSub, src = filterSource) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 50 });
      if (s) params.set('search', s);
      if (sub) params.set('subscribed', sub);
      if (src) params.set('source', src);
      const res = await fetch(`${apiUrl}/api/admin/guests?${params}`, {
        headers: { 'X-Admin-Key': apiKey },
      });
      if (!res.ok) throw new Error('Failed to load');
      setData(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, search, filterSub, filterSource); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const s = searchInput.trim();
    setSearch(s);
    setPage(1);
    load(1, s, filterSub, filterSource);
  };

  const handleFilter = (sub, src) => {
    setFilterSub(sub);
    setFilterSource(src);
    setPage(1);
    load(1, search, sub, src);
  };

  const handlePage = (p) => {
    setPage(p);
    load(p, search, filterSub, filterSource);
  };

  const handleExport = () => {
    window.open(`${apiUrl}/api/admin/guests/export/google?key=${encodeURIComponent(apiKey)}`, '_blank');
  };

  const totalPages = data ? Math.ceil(data.total / 50) : 1;

  return (
    <div className="space-y-4">
      {data?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total contacts', value: data.stats.total },
            { label: 'Subscribed', value: data.stats.subscribed },
            { label: 'Unsubscribed', value: data.stats.total - data.stats.subscribed },
            { label: 'Sources', value: Object.keys(data.stats.sources || {}).join(', ') || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="text-xs text-slate-500">{label}</div>
              <div className="text-lg font-semibold text-slate-900 mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <form onSubmit={handleSearch} className="flex gap-1 flex-1 min-w-[200px]">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email…"
              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
              data-testid="input-guest-search"
            />
            <button type="submit" className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50" data-testid="button-guest-search">
              <Search className="w-4 h-4 text-slate-500" />
            </button>
          </form>
          <select
            value={filterSub}
            onChange={(e) => handleFilter(e.target.value, filterSource)}
            className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
            data-testid="select-filter-sub"
          >
            <option value="">All</option>
            <option value="true">Subscribed</option>
            <option value="false">Unsubscribed</option>
          </select>
          <select
            value={filterSource}
            onChange={(e) => handleFilter(filterSub, e.target.value)}
            className="px-2 py-1.5 border border-slate-300 rounded-lg text-sm outline-none"
            data-testid="select-filter-source"
          >
            <option value="">All sources</option>
            <option value="beds24">Beds24</option>
          </select>
          <button
            onClick={() => load(page, search, filterSub, filterSource)}
            className="p-1.5 border border-slate-300 rounded-lg hover:bg-slate-50"
            data-testid="button-refresh-guests"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 text-slate-600"
            data-testid="button-export-google"
          >
            <Download className="w-4 h-4" />
            Google CSV
          </button>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
          </div>
        ) : !data?.rows?.length ? (
          <div className="text-center py-10 text-slate-400 text-sm">No contacts found.</div>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200">
                  {['Email', 'Name', 'Country', 'Source', 'Status', 'Added'].map(h => (
                    <th key={h} className="pb-2 text-left text-xs font-medium text-slate-500 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((g) => (
                  <tr key={g.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid={`row-guest-${g.id}`}>
                    <td className="py-2 pr-4 text-slate-800 font-medium">{g.email}</td>
                    <td className="py-2 pr-4 text-slate-600">{[g.firstName, g.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td className="py-2 pr-4 text-slate-500">{g.countryCode || '—'}</td>
                    <td className="py-2 pr-4 text-slate-500 capitalize">{g.source}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        g.subscribed ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {g.subscribed ? 'Subscribed' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="py-2 text-slate-400 text-xs">{new Date(g.createdAt).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
            <span>Page {page} of {totalPages} ({data?.total} total)</span>
            <div className="flex gap-1">
              <button
                onClick={() => handlePage(page - 1)}
                disabled={page <= 1}
                className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePage(page + 1)}
                disabled={page >= totalPages}
                className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                data-testid="button-next-page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Broadcast Panel ───────────────────────────────────────────────────────────

function BroadcastPanel({ apiUrl, apiKey }) {
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sendTest = async () => {
    if (!subject || !html || !testEmail) return;
    setStatus({ type: 'loading', message: 'Sending test email…' });
    try {
      const res = await fetch(`${apiUrl}/api/admin/guests/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': apiKey },
        body: JSON.stringify({ subject, html, testEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Send failed');
      setStatus({ type: 'success', message: `Test sent to ${testEmail}` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  const sendBroadcast = async () => {
    if (!confirmOpen) { setConfirmOpen(true); return; }
    setStatus({ type: 'loading', message: 'Starting broadcast…' });
    setConfirmOpen(false);
    try {
      const res = await fetch(`${apiUrl}/api/admin/guests/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Key': apiKey },
        body: JSON.stringify({ subject, html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Broadcast failed');
      setStatus({ type: 'success', message: `Broadcast started — ${data.queued} emails queued. Progress visible in Render logs.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-1">Email Broadcast</h2>
      <p className="text-sm text-slate-500 mb-5">Send a marketing email to all subscribed guests. Every email includes a personalised unsubscribe link. Always test first.</p>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Subject line *</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setConfirmOpen(false); }}
            placeholder="e.g. We miss you — come back to DEVOCEAN"
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
            data-testid="input-broadcast-subject"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email body (HTML) *</span>
          <p className="text-xs text-slate-400 mb-1">An unsubscribe footer is added automatically to every email.</p>
          <textarea
            value={html}
            onChange={(e) => { setHtml(e.target.value); setConfirmOpen(false); }}
            rows={12}
            placeholder={'<h2>Hello from DEVOCEAN Lodge!</h2>\n<p>We hope you enjoyed your stay...</p>'}
            className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none resize-y"
            data-testid="textarea-broadcast-html"
          />
        </label>

        {html && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 border-b border-slate-200">Preview</div>
            <div
              className="p-4 text-sm"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}

        <div className="border-t border-slate-200 pt-4">
          <label className="block mb-3">
            <span className="text-sm font-medium text-slate-700">Test recipient email</span>
            <div className="flex gap-2 mt-1">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#9e4b13]/30 focus:border-[#9e4b13] outline-none"
                data-testid="input-broadcast-test-email"
              />
              <button
                type="button"
                onClick={sendTest}
                disabled={!subject || !html || !testEmail || status.type === 'loading'}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 text-slate-700"
                data-testid="button-send-test"
              >
                <Mail className="w-4 h-4" />
                Send test
              </button>
            </div>
          </label>
        </div>
      </div>

      {confirmOpen && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800 font-medium">Send to all subscribed guests?</p>
          <p className="text-xs text-amber-600 mt-1">This will send "{subject}" to every subscribed contact in your database. This cannot be undone.</p>
        </div>
      )}

      <button
        type="button"
        onClick={sendBroadcast}
        disabled={!subject || !html || status.type === 'loading'}
        className={`mt-4 w-full py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
          confirmOpen
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-[#9e4b13] text-white hover:bg-[#8a4211]'
        }`}
        data-testid="button-send-broadcast"
      >
        {status.type === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
        ) : confirmOpen ? (
          <><Send className="w-4 h-4" /> Yes — send to all subscribers</>
        ) : (
          <><Send className="w-4 h-4" /> Send broadcast to all subscribers</>
        )}
      </button>

      <StatusMessage status={status} />
    </div>
  );
}
