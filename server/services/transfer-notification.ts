import nodemailer, { type Transporter } from 'nodemailer';
import { DatabaseService } from './database';
import type { Booking } from '../../shared/schema';

/**
 * Transfer Notification Service
 * Sends transfer booking requests to taxi company via email/WhatsApp
 */

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface TaxiCompanyConfig {
  email: string;
  whatsapp?: string;
  name: string;
}

export class TransferNotificationService {
  private transporter: Transporter;
  private db: DatabaseService;
  private taxiConfig: TaxiCompanyConfig;
  private fromEmail: string;
  private fromName: string;

  constructor(
    smtpConfig: SMTPConfig,
    db: DatabaseService,
    taxiConfig: TaxiCompanyConfig,
    fromEmail: string = 'booking@devoceanlodge.com',
    fromName: string = 'DEVOCEAN Lodge Bookings'
  ) {
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.db = db;
    this.taxiConfig = taxiConfig;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
  }

  /**
   * Send transfer notification to taxi company
   */
  async notifyTaxiCompany(booking: Booking): Promise<boolean> {
    try {
      // Check if transfer is required
      if (!booking.extras?.transfer?.required) {
        return false;
      }

      // Check if already notified
      if (booking.transferNotificationSent) {
        console.log(`Transfer notification already sent for booking ${booking.groupRef}`);
        return false;
      }

      const transfer = booking.extras.transfer;

      // Generate email content
      const emailContent = this.generateTransferEmail(booking);

      // Send email to taxi company
      const result = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: this.taxiConfig.email,
        subject: `New Transfer Request - Booking ${booking.groupRef}`,
        html: emailContent.html,
        text: emailContent.text,
      });

      // Mark as notified
      await this.db.markTransferNotificationSent(booking.id);

      // Log the notification
      await this.db.logEmail({
        to: this.taxiConfig.email,
        subject: `Transfer Request - ${booking.groupRef}`,
        emailType: 'transfer_notification',
        status: 'sent',
        provider: 'smtp',
        messageId: result.messageId,
      });

      console.log(`✅ Transfer notification sent to ${this.taxiConfig.name} for booking ${booking.groupRef}`);

      return true;
    } catch (error) {
      console.error('Error sending transfer notification:', error);
      
      // Log the failure
      await this.db.logEmail({
        to: this.taxiConfig.email,
        subject: `Transfer Request - ${booking.groupRef}`,
        emailType: 'transfer_notification',
        status: 'failed',
        provider: 'smtp',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      return false;
    }
  }

  /**
   * Generate transfer notification email using HTML template
   */
  private generateTransferEmail(booking: Booking): { html: string; text: string } {
    const transfer = booking.extras!.transfer!;
    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatTime = (time: string) => {
      return time; // Already formatted from booking
    };

    let transferDetails = '';
    let transferDetailsHtml = '';

    // Arrival transfer
    if (transfer.type === 'arrival' || transfer.type === 'both') {
      const arrival = transfer.arrivalDetails!;
      transferDetails += `\nARRIVAL TRANSFER\n`;
      transferDetails += `Pick-up: ${arrival.pickupLocation}\n`;
      transferDetails += `Time: ${formatTime(arrival.pickupTime)}\n`;
      transferDetails += `Passengers: ${arrival.passengers}\n`;
      if (arrival.flightNumber) {
        transferDetails += `Flight: ${arrival.flightNumber}\n`;
      }

      transferDetailsHtml += `
        <div style="margin: 20px 0; padding: 15px; background: #f0f9ff; border-left: 4px solid #0077BE;">
          <h3 style="margin: 0 0 10px 0; color: #0077BE;">Arrival Transfer</h3>
          <p style="margin: 5px 0;"><strong>Pick-up:</strong> ${arrival.pickupLocation}</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> ${formatTime(arrival.pickupTime)}</p>
          <p style="margin: 5px 0;"><strong>Passengers:</strong> ${arrival.passengers}</p>
          ${arrival.flightNumber ? `<p style="margin: 5px 0;"><strong>Flight:</strong> ${arrival.flightNumber}</p>` : ''}
        </div>
      `;
    }

    // Departure transfer
    if (transfer.type === 'departure' || transfer.type === 'both') {
      const departure = transfer.departureDetails!;
      transferDetails += `\nDEPARTURE TRANSFER\n`;
      transferDetails += `Drop-off: ${departure.dropoffLocation}\n`;
      transferDetails += `Pick-up from lodge: ${formatTime(departure.pickupTime)}\n`;
      transferDetails += `Passengers: ${departure.passengers}\n`;
      if (departure.flightNumber) {
        transferDetails += `Flight: ${departure.flightNumber}\n`;
      }

      transferDetailsHtml += `
        <div style="margin: 20px 0; padding: 15px; background: #f0f9ff; border-left: 4px solid #0077BE;">
          <h3 style="margin: 0 0 10px 0; color: #0077BE;">Departure Transfer</h3>
          <p style="margin: 5px 0;"><strong>Drop-off:</strong> ${departure.dropoffLocation}</p>
          <p style="margin: 5px 0;"><strong>Pick-up from lodge:</strong> ${formatTime(departure.pickupTime)}</p>
          <p style="margin: 5px 0;"><strong>Passengers:</strong> ${departure.passengers}</p>
          ${departure.flightNumber ? `<p style="margin: 5px 0;"><strong>Flight:</strong> ${departure.flightNumber}</p>` : ''}
        </div>
      `;
    }

    const text = `
New Transfer Request - DEVOCEAN Lodge

Booking Reference: ${booking.groupRef}
Guest Name: ${booking.guestName}
Guest Email: ${booking.guestEmail}
Guest Phone: ${booking.guestPhone || 'Not provided'}
Language: ${booking.guestLanguage}

Check-in: ${formatDate(checkInDate)}
Check-out: ${formatDate(checkOutDate)}
${transferDetails}

Destination: DEVOCEAN Lodge, Ponta do Ouro, Mozambique

Please confirm this transfer booking by replying to this email.

DEVOCEAN Lodge
Email: ${this.fromEmail}
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: #0077BE; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .booking-details { background: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #F4A460; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; margin-top: 30px; }
    .important { background: #FFF3CD; padding: 15px; margin: 15px 0; border-left: 4px solid #FFC107; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚗 New Transfer Request</h1>
    <p>DEVOCEAN Lodge</p>
  </div>
  
  <div class="content">
    <h2>Dear ${this.taxiConfig.name},</h2>
    
    <p>We have a new transfer request for one of our guests.</p>
    
    <div class="booking-details">
      <h3>Booking Information</h3>
      <p><strong>Reference:</strong> ${booking.groupRef}</p>
      <p><strong>Guest Name:</strong> ${booking.guestName}</p>
      <p><strong>Email:</strong> ${booking.guestEmail}</p>
      <p><strong>Phone:</strong> ${booking.guestPhone || 'Not provided'}</p>
      <p><strong>Language:</strong> ${booking.guestLanguage}</p>
      <p><strong>Check-in:</strong> ${formatDate(checkInDate)}</p>
      <p><strong>Check-out:</strong> ${formatDate(checkOutDate)}</p>
    </div>
    
    ${transferDetailsHtml}
    
    <div class="important">
      <p><strong>📍 Destination:</strong> DEVOCEAN Lodge, Ponta do Ouro, Mozambique</p>
    </div>
    
    <p><strong>Please confirm this transfer booking by replying to this email with:</strong></p>
    <ul>
      <li>Confirmation of availability</li>
      <li>Confirmation number</li>
      <li>Any special instructions for the guest</li>
    </ul>
    
    <p>Thank you!</p>
    
    <p>Best regards,<br>
    DEVOCEAN Lodge Team</p>
  </div>
  
  <div class="footer">
    <p>DEVOCEAN Lodge | Ponta do Ouro, Mozambique</p>
    <p>Email: ${this.fromEmail}</p>
  </div>
</body>
</html>
    `.trim();

    return { html, text };
  }
}
