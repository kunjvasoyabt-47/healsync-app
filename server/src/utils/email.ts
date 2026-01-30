// backend/src/utils/email.ts
import nodemailer from "nodemailer";

export const sendEmail = async (options: { 
  email: string; 
  subject: string; 
  message: string 
}): Promise<void> => {
  
  // For development: Use Mailtrap (emails appear in Mailtrap dashboard)
  // For production: Use Gmail or SendGrid
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  const transporter = nodemailer.createTransport({
    host: isProduction ? 'smtp.gmail.com' : (process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io"),
    port: isProduction ? 587 : 2525,
    secure: isProduction, // true for 587, false for 2525
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },

  connectionTimeout: 10000, 
  greetingTimeout: 10000,
  socketTimeout: 10000,
  });

  const mailOptions = {
    from: isProduction 
      ? process.env.EMAIL_USER // Use actual Gmail in production
      : '"HealSync Support" <support@healsync.com>', // Any email for Mailtrap
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${options.message}" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        ">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
 
};