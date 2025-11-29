import * as cron from 'node-cron';
import { DatabaseService } from './database';
import { EmailParser } from './email-parser';
import { EmailSchedulerService } from './email-scheduler';
import { EmailSenderService } from './email-sender';
import { CancellationHandler } from './cancellation-handler';
import { ModificationHandler } from './modification-handler';
import { AdminReportingService } from './admin-reporting';
import { insertBookingSchema } from '../../shared/schema';

/**
 * Email Automation Service
 * Orchestrates the entire email automation workflow:
 * 1. Check IMAP inbox for new Beds24 booking notifications
 * 2. Parse and store booking data
 * 3. Schedule automated emails
 * 4. Send scheduled emails
 */

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
}

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}
