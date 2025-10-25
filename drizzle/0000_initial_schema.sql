-- DEVOCEAN Lodge Email Automation System
-- Initial database schema for automated booking emails

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_ref TEXT NOT NULL,
  booking_refs TEXT[] NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT,
  guest_language TEXT NOT NULL DEFAULT 'EN',
  check_in_date TIMESTAMP NOT NULL,
  check_out_date TIMESTAMP NOT NULL,
  last_night_date TIMESTAMP NOT NULL,
  rooms JSONB NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  booking_type TEXT,
  source TEXT DEFAULT 'iframe',
  post_booking_email_sent BOOLEAN DEFAULT FALSE,
  pre_arrival_email_sent BOOLEAN DEFAULT FALSE,
  arrival_email_sent BOOLEAN DEFAULT FALSE,
  post_departure_email_sent BOOLEAN DEFAULT FALSE,
  raw_email_data JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_group_ref ON bookings(group_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in ON bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at);

-- Scheduled emails table
CREATE TABLE IF NOT EXISTS scheduled_emails (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'EN',
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  template_data JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for scheduled emails
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_booking ON scheduled_emails(booking_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_status ON scheduled_emails(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_emails_scheduled ON scheduled_emails(scheduled_for);

-- Email logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  scheduled_email_id INTEGER REFERENCES scheduled_emails(id) ON DELETE SET NULL,
  "to" TEXT NOT NULL,
  subject TEXT NOT NULL,
  email_type TEXT NOT NULL,
  status TEXT NOT NULL,
  provider TEXT,
  message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at);

-- Email check logs table
CREATE TABLE IF NOT EXISTS email_check_logs (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  check_time TIMESTAMP DEFAULT NOW() NOT NULL,
  emails_found INTEGER DEFAULT 0,
  emails_processed INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,
  status TEXT NOT NULL,
  error_message TEXT,
  duration_ms INTEGER
);

-- Index for email check logs
CREATE INDEX IF NOT EXISTS idx_email_check_logs_time ON email_check_logs(check_time);
