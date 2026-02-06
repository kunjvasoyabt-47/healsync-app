// backend/src/utils/email.ts
import nodemailer from "nodemailer";

export const sendEmail = async (options: { 
  email: string; 
  subject: string; 
  message: string 
}): Promise<void> => {
  
  // Mailtrap Configuration
  const transporter = nodemailer.createTransport({
    service: "gmail", // Using Gmail's SMTP for real email sending
    auth: {
      user: process.env.EMAIL_USER, //  Username
      pass: process.env.EMAIL_PASS, //  Password
    },
    // Adding timeouts helps prevent the "Connection Timeout" error
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: '"HealSync Support" <support@healsync.com>',
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #4CAF50;">Password Reset Request</h2>
        <p>You requested to reset your password for HealSync. Please click the button below:</p>
        <a href="${options.message}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        ">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">
          This link will expire in 10 minutes. If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to Mailtrap successfully");
  } catch (error) {
    console.error("❌ Mailtrap Error:", error);
    throw error;
  }
};