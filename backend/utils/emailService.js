import nodemailer from 'nodemailer';

// Helper to construct SMTP or service-based email transporter from env parameters
const getTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return null;
};

// Unified email dispatch handler with real transmission and developer sandbox logging fallback
const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"ParkSmart Notification Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`[EMAIL] Real dispatch complete to: <${to}>. Message ID: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error(`[EMAIL ERROR] Real dispatch failed to: <${to}>. Details: ${err.message}`);
    }
  }

  // Fallback simulator logs
  console.log('\n==================================================');
  console.log(`[SIMULATED EMAIL SENT]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body Snippet: ${html.substring(0, 150)}...`);
  console.log('==================================================\n');
  return { messageId: 'simulated-id-12345' };
};

export const sendBookingConfirmationEmail = async (userEmail, bookingDetails) => {
  const html = `
    <h1>Booking Confirmed!</h1>
    <p>Dear Customer, your parking booking is confirmed.</p>
    <p><b>Booking ID:</b> ${bookingDetails.bookingId}</p>
    <p><b>Parking Slot:</b> ${bookingDetails.slotId}</p>
    <p><b>Estimated Fee:</b> ₹${bookingDetails.estimatedAmount}</p>
    <p>Please present your QR code to the Parking Guide at the entrance.</p>
  `;
  return await sendEmail({ to: userEmail, subject: 'Smart Parking - Booking Confirmed', html });
};

export const sendExpiryAlertEmail = async (userEmail, bookingDetails) => {
  const html = `
    <h1>Booking Expired!</h1>
    <p>Dear Customer, your booking ${bookingDetails.bookingId} has expired as you did not check in on time.</p>
    <p>The slot has been released back to the pool.</p>
  `;
  return await sendEmail({ to: userEmail, subject: 'Smart Parking - Booking Expired Alert', html });
};

export const sendPaymentSuccessEmail = async (userEmail, paymentDetails) => {
  const html = `
    <h1>Payment Successful!</h1>
    <p>Dear Customer, payment of ₹${paymentDetails.amount} is received for Booking ${paymentDetails.bookingId}.</p>
    <p><b>Transaction ID:</b> ${paymentDetails.transactionId}</p>
  `;
  return await sendEmail({ to: userEmail, subject: 'Smart Parking - Payment Invoice', html });
};

export const sendResetPasswordEmail = async (userEmail, resetUrl) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1e293b; margin-bottom: 16px;">Password Reset Request</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">Dear Customer,</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">Please click on the button below to reset your password. This link is valid for 10 minutes:</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" target="_blank" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p style="color: #64748b; font-size: 14px; line-height: 1.5;">Or copy and paste this URL into your browser:</p>
      <p style="color: #3b82f6; font-size: 14px; word-break: break-all;"><a href="${resetUrl}" target="_blank">${resetUrl}</a></p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 12px; line-height: 1.5;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;
  return await sendEmail({ to: userEmail, subject: 'Smart Parking - Password Reset Request', html });
};

