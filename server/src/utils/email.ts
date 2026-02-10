import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string; // This will now act as the full HTML body
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 10,
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 30000,  
    greetingTimeout: 30000,
    socketTimeout: 30000,     
  });

  const mailOptions = {
    from: `"HealSync Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(` Email sent to ${options.email}`);
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};