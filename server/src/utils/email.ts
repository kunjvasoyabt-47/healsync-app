import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string; // This will now act as the full HTML body
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = nodemailer.createTransport({
   service:"gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

 const mailOptions = {
    from: `"HealSync Support" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Mailtrap Connection Verified");
    console.log(`✅ Email delivered to ${options.email}`);
  } catch (error) {
    console.error("Mailtrap Error:", error);
    throw error;
  }
};