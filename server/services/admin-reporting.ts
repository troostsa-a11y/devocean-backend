import nodemailer from 'nodemailer';
import { DatabaseService } from './database';

/**
 * Admin Reporting Service
 * Generates and sends daily/weekly reports to admin
 */

interface ReportData {
  period: string;
  startDate: Date;
  endDate: Date;
  
  // Booking stats
  totalBookings: number;
  totalCancellations: number;
  activeBookings: number;
  
  // Email stats
  emailsSent: number;
  emailsFailed: number;
  emailsPending: number;
  
  // Email breakdown by type
  emailsByType: {
    post_booking: number;
    pre_arrival: number;
    arrival: number;
    post_departure: number;
    cancellation: number;
    transfer_notification: number;
  };
  
  // Transfer notifications
  transferNotificationsSent: number;
  
  // Email checks
  emailChecksPerformed: number;
  emailChecksSuccessful: number;
  emailChecksFailed: number;
  
  // Recent bookings
  recentBookings: Array<{
    groupRef: string;
    guestName: string;
    checkInDate: string;
    status: string;
  }>;
  
  // Recent errors
  recentErrors: string[];
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

export class AdminReportingService {
  private transporter: nodemailer.Transporter;
  private db: DatabaseService;
  private adminEmail: string;
  private fromEmail: string;
  private fromName: string;

  constructor(
    smtpConfig: SMTPConfig,
    db: DatabaseService,
    adminEmail: string = 'admin@devoceanlodge.com',
    fromEmail: string = 'booking@devoceanlodge.com',
    fromName: string = 'DEVOCEAN Lodge Bookings'
  ) {
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.db = db;
    this.adminEmail = adminEmail;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  /**
   * Generate and send daily report (for previous day)
   */
  async sendDailyReport(): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const reportData = await this.gatherReportData(yesterday, today, 'Daily');
      const html = this.generateDailyReportHtml(reportData);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: this.adminEmail,
        subject: `📊 Daily Report - ${this.formatDate(yesterday)}`,
        html,
      });

      console.log(`✅ Daily report sent to ${this.adminEmail}`);
    } catch (error) {
      console.error('Error sending daily report:', error);
    }
  }

  /**
   * Generate and send weekly report (for previous week)
   */
  async sendWeeklyReport(): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get last Monday
      const lastMonday = new Date(today);
      const daysSinceMonday = (today.getDay() + 6) % 7; // Days since last Monday
      lastMonday.setDate(today.getDate() - daysSinceMonday - 7);
      
      // Get last Sunday
      const lastSunday = new Date(lastMonday);
      lastSunday.setDate(lastMonday.getDate() + 6);

      const reportData = await this.gatherReportData(lastMonday, lastSunday, 'Weekly');
      const html = this.generateWeeklyReportHtml(reportData);

      await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: this.adminEmail,
        subject: `📊 Weekly Report - Week of ${this.formatDate(lastMonday)}`,
        html,
      });

      console.log(`✅ Weekly report sent to ${this.adminEmail}`);
    } catch (error) {
      console.error('Error sending weekly report:', error);
    }
  }

  /**
   * Gather report data from database
   */
  private async gatherReportData(
    startDate: Date,
    endDate: Date,
    period: string
  ): Promise<ReportData> {
    // Get all stats from database
    const stats = await this.db.getReportStats(startDate, endDate);

    return {
      period,
      startDate,
      endDate,
      totalBookings: stats.totalBookings || 0,
      totalCancellations: stats.totalCancellations || 0,
      activeBookings: stats.activeBookings || 0,
      emailsSent: stats.emailsSent || 0,
      emailsFailed: stats.emailsFailed || 0,
      emailsPending: stats.emailsPending || 0,
      emailsByType: stats.emailsByType || {
        post_booking: 0,
        pre_arrival: 0,
        arrival: 0,
        post_departure: 0,
        cancellation: 0,
        transfer_notification: 0,
      },
      transferNotificationsSent: stats.transferNotificationsSent || 0,
      emailChecksPerformed: stats.emailChecksPerformed || 0,
      emailChecksSuccessful: stats.emailChecksSuccessful || 0,
      emailChecksFailed: stats.emailChecksFailed || 0,
      recentBookings: stats.recentBookings || [],
      recentErrors: stats.recentErrors || [],
    };
  }

  /**
   * Generate daily report HTML
   */
  private generateDailyReportHtml(data: ReportData): string {
    const successRate = data.emailsSent + data.emailsFailed > 0
      ? ((data.emailsSent / (data.emailsSent + data.emailsFailed)) * 100).toFixed(1)
      : '0';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Report - DEVOCEAN Lodge</title>
  <style>
    body { font-family: 'Raleway', Arial, sans-serif; line-height: 1.6; color: #5C5048; max-width: 800px; margin: 0 auto; padding: 0; background: #fffaf6; }
    .email-container { background: white; margin: 20px auto; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #b65a1a 0%, #9e4b13 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 28px; font-weight: 800; }
    .header p { margin: 0; font-size: 16px; opacity: 0.95; }
    .content { padding: 30px 20px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat-card { background: #fffaf6; padding: 20px; border-radius: 8px; border-left: 4px solid #9e4b13; }
    .stat-card h3 { margin: 0 0 10px 0; font-size: 14px; color: #8a827b; text-transform: uppercase; }
    .stat-card .value { font-size: 32px; font-weight: 800; color: #9e4b13; }
    .section { margin: 30px 0; }
    .section h2 { color: #9e4b13; font-size: 20px; font-weight: 700; border-bottom: 2px solid #9e4b13; padding-bottom: 8px; }
    .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .table th { background: #fffaf6; padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #9e4b13; }
    .table td { padding: 12px; border-bottom: 1px solid #eee; }
    .success { color: #059669; font-weight: 600; }
    .warning { color: #F59E0B; font-weight: 600; }
    .error { color: #DC2626; font-weight: 600; }
    .footer { background: #fffaf6; padding: 20px; text-align: center; font-size: 13px; color: #8a827b; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📊 Daily Report</h1>
      <p>${this.formatDate(data.startDate)}</p>
    </div>
    
    <div class="content">
      <div class="stat-grid">
        <div class="stat-card">
          <h3>New Bookings</h3>
          <div class="value">${data.totalBookings}</div>
        </div>
        <div class="stat-card">
          <h3>Cancellations</h3>
          <div class="value">${data.totalCancellations}</div>
        </div>
        <div class="stat-card">
          <h3>Emails Sent</h3>
          <div class="value">${data.emailsSent}</div>
        </div>
        <div class="stat-card">
          <h3>Success Rate</h3>
          <div class="value">${successRate}%</div>
        </div>
      </div>

      <div class="section">
        <h2>Email Breakdown</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Email Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Post-Booking Confirmations</td><td>${data.emailsByType.post_booking}</td></tr>
            <tr><td>Pre-Arrival Reminders</td><td>${data.emailsByType.pre_arrival}</td></tr>
            <tr><td>Arrival Reminders</td><td>${data.emailsByType.arrival}</td></tr>
            <tr><td>Post-Departure Thank You</td><td>${data.emailsByType.post_departure}</td></tr>
            <tr><td>Cancellation Confirmations</td><td>${data.emailsByType.cancellation}</td></tr>
            <tr><td>Transfer Notifications</td><td>${data.emailsByType.transfer_notification}</td></tr>
          </tbody>
        </table>
      </div>

      ${data.recentBookings.length > 0 ? `
      <div class="section">
        <h2>Recent Bookings</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Guest Name</th>
              <th>Check-in</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.recentBookings.map(b => `
              <tr>
                <td>${b.groupRef}</td>
                <td>${b.guestName}</td>
                <td>${b.checkInDate}</td>
                <td class="${b.status === 'active' ? 'success' : b.status === 'cancelled' ? 'error' : ''}">${b.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div class="section">
        <h2>System Health</h2>
        <table class="table">
          <tbody>
            <tr><td>Email Checks Performed</td><td>${data.emailChecksPerformed}</td></tr>
            <tr><td>Successful Checks</td><td class="success">${data.emailChecksSuccessful}</td></tr>
            <tr><td>Failed Checks</td><td class="${data.emailChecksFailed > 0 ? 'error' : ''}">${data.emailChecksFailed}</td></tr>
            <tr><td>Emails Pending</td><td class="${data.emailsPending > 10 ? 'warning' : ''}">${data.emailsPending}</td></tr>
            <tr><td>Emails Failed</td><td class="${data.emailsFailed > 0 ? 'error' : ''}">${data.emailsFailed}</td></tr>
          </tbody>
        </table>
      </div>

      ${data.recentErrors.length > 0 ? `
      <div class="section">
        <h2>⚠️ Recent Errors</h2>
        <ul>
          ${data.recentErrors.map(error => `<li class="error">${error}</li>`).join('')}
        </ul>
      </div>
      ` : ''}
    </div>
    
    <div class="footer">
      <p><strong>DEVOCEAN Lodge</strong> Email Automation System</p>
      <p>Generated on ${new Date().toLocaleString('en-GB')}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate weekly report HTML
   */
  private generateWeeklyReportHtml(data: ReportData): string {
    const successRate = data.emailsSent + data.emailsFailed > 0
      ? ((data.emailsSent / (data.emailsSent + data.emailsFailed)) * 100).toFixed(1)
      : '0';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Report - DEVOCEAN Lodge</title>
  <style>
    body { font-family: 'Raleway', Arial, sans-serif; line-height: 1.6; color: #5C5048; max-width: 800px; margin: 0 auto; padding: 0; background: #fffaf6; }
    .email-container { background: white; margin: 20px auto; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #b65a1a 0%, #9e4b13 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0 0 10px 0; font-size: 32px; font-weight: 800; }
    .header p { margin: 0; font-size: 18px; opacity: 0.95; }
    .content { padding: 30px 20px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin: 20px 0; }
    .stat-card { background: #fffaf6; padding: 20px; border-radius: 8px; border-left: 4px solid #9e4b13; text-align: center; }
    .stat-card h3 { margin: 0 0 10px 0; font-size: 13px; color: #8a827b; text-transform: uppercase; }
    .stat-card .value { font-size: 36px; font-weight: 800; color: #9e4b13; }
    .stat-card .label { font-size: 12px; color: #8a827b; margin-top: 5px; }
    .section { margin: 30px 0; }
    .section h2 { color: #9e4b13; font-size: 22px; font-weight: 700; border-bottom: 2px solid #9e4b13; padding-bottom: 8px; }
    .highlight-box { background: #fffaf6; padding: 20px; border-radius: 8px; border: 2px solid #9e4b13; margin: 20px 0; }
    .table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .table th { background: #fffaf6; padding: 12px; text-align: left; font-weight: 700; border-bottom: 2px solid #9e4b13; }
    .table td { padding: 12px; border-bottom: 1px solid #eee; }
    .success { color: #059669; font-weight: 600; }
    .warning { color: #F59E0B; font-weight: 600; }
    .error { color: #DC2626; font-weight: 600; }
    .footer { background: #fffaf6; padding: 20px; text-align: center; font-size: 13px; color: #8a827b; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📊 Weekly Report</h1>
      <p>Week of ${this.formatDate(data.startDate)} - ${this.formatDate(data.endDate)}</p>
    </div>
    
    <div class="content">
      <div class="highlight-box">
        <h2 style="margin-top: 0; border: none;">Weekly Summary</h2>
        <p><strong>${data.totalBookings}</strong> new bookings received</p>
        <p><strong>${data.emailsSent}</strong> emails successfully sent</p>
        <p><strong>${data.totalCancellations}</strong> booking cancellations processed</p>
        <p><strong>${successRate}%</strong> email delivery success rate</p>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <h3>Bookings</h3>
          <div class="value">${data.totalBookings}</div>
          <div class="label">New this week</div>
        </div>
        <div class="stat-card">
          <h3>Active</h3>
          <div class="value">${data.activeBookings}</div>
          <div class="label">Current bookings</div>
        </div>
        <div class="stat-card">
          <h3>Cancelled</h3>
          <div class="value">${data.totalCancellations}</div>
          <div class="label">This week</div>
        </div>
        <div class="stat-card">
          <h3>Transfers</h3>
          <div class="value">${data.transferNotificationsSent}</div>
          <div class="label">Taxi notifications</div>
        </div>
      </div>

      <div class="section">
        <h2>Email Performance</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Count</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Emails Sent Successfully</td>
              <td>${data.emailsSent}</td>
              <td class="success">✓ Good</td>
            </tr>
            <tr>
              <td>Emails Failed</td>
              <td>${data.emailsFailed}</td>
              <td class="${data.emailsFailed > 0 ? 'error' : 'success'}">${data.emailsFailed > 0 ? '⚠ Needs Attention' : '✓ Good'}</td>
            </tr>
            <tr>
              <td>Emails Pending</td>
              <td>${data.emailsPending}</td>
              <td class="${data.emailsPending > 20 ? 'warning' : 'success'}">${data.emailsPending > 20 ? '⚠ High Queue' : '✓ Normal'}</td>
            </tr>
            <tr>
              <td>Success Rate</td>
              <td>${successRate}%</td>
              <td class="${parseFloat(successRate) > 95 ? 'success' : 'warning'}">${parseFloat(successRate) > 95 ? '✓ Excellent' : '⚠ Monitor'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Email Distribution</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Email Type</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Post-Booking Confirmations</td><td>${data.emailsByType.post_booking}</td></tr>
            <tr><td>Pre-Arrival Reminders</td><td>${data.emailsByType.pre_arrival}</td></tr>
            <tr><td>Arrival Reminders</td><td>${data.emailsByType.arrival}</td></tr>
            <tr><td>Post-Departure Thank You</td><td>${data.emailsByType.post_departure}</td></tr>
            <tr><td>Cancellation Confirmations</td><td>${data.emailsByType.cancellation}</td></tr>
            <tr><td>Transfer Notifications (Taxi)</td><td>${data.emailsByType.transfer_notification}</td></tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>System Health</h2>
        <table class="table">
          <tbody>
            <tr><td>Email Checks Performed</td><td>${data.emailChecksPerformed}</td></tr>
            <tr><td>Successful Checks</td><td class="success">${data.emailChecksSuccessful}</td></tr>
            <tr><td>Failed Checks</td><td class="${data.emailChecksFailed > 0 ? 'error' : ''}">${data.emailChecksFailed}</td></tr>
          </tbody>
        </table>
      </div>

      ${data.recentErrors.length > 0 ? `
      <div class="section">
        <h2>⚠️ Issues This Week</h2>
        <ul>
          ${data.recentErrors.map(error => `<li class="error">${error}</li>`).join('')}
        </ul>
      </div>
      ` : `
      <div class="section">
        <p class="success" style="text-align: center; font-size: 18px;">✓ No errors this week - System running smoothly!</p>
      </div>
      `}
    </div>
    
    <div class="footer">
      <p><strong>DEVOCEAN Lodge</strong> Email Automation System</p>
      <p>Generated on ${new Date().toLocaleString('en-GB')}</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
