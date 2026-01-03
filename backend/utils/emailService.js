const nodemailer = require("nodemailer");

// Create transporter - configure with your email service
// For Gmail, you'll need to use an App Password
const createTransporter = () => {
  // Validate environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error("EMAIL_USER and EMAIL_PASSWORD must be set in environment variables");
  }

  // Trim values to remove any accidental spaces
  const emailUser = process.env.EMAIL_USER.trim();
  const emailPassword = process.env.EMAIL_PASSWORD.trim();
  
  // Debug logging (without exposing full password)
  console.log("Email Config Check:");
  console.log("  EMAIL_USER:", emailUser);
  console.log("  EMAIL_PASSWORD length:", emailPassword.length, "characters");
  console.log("  EMAIL_SERVICE:", process.env.EMAIL_SERVICE || "gmail");
  
  // Validate App Password format (should be 16 characters, no spaces)
  if (emailPassword.includes(" ")) {
    console.error("WARNING: EMAIL_PASSWORD contains spaces! App Passwords should have no spaces.");
    console.error("Current password has", emailPassword.length, "characters including spaces");
  }
  
  if (emailPassword.length !== 16) {
    console.warn("WARNING: App Password should be exactly 16 characters. Current length:", emailPassword.length);
  }

  const config = {
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  };

  // For Gmail, we can also use OAuth2 or App Password
  // If using a custom SMTP server, use host and port instead
  if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
    config.host = process.env.EMAIL_HOST;
    config.port = parseInt(process.env.EMAIL_PORT);
    config.secure = process.env.EMAIL_SECURE === "true"; // true for 465, false for other ports
  }

  return nodemailer.createTransport(config);
};

/**
 * Send OTP email
 */
const sendOTPEmail = async (email, otp, purpose) => {
  try {
    // Validate email configuration before creating transporter
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("Email configuration missing: EMAIL_USER and EMAIL_PASSWORD must be set");
      throw new Error("Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD in .env file");
    }

    const transporter = createTransporter();

    // Verify transporter configuration
    await transporter.verify();

    const subject =
      purpose === "signup"
        ? "Verify Your Email - OTP Code"
        : "Reset Your Password - OTP Code";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">${subject}</h2>
        <p style="color: #666; font-size: 16px;">
          Your OTP code is: <strong style="font-size: 24px; color: #007bff; letter-spacing: 3px;">${otp}</strong>
        </p>
        <p style="color: #666; font-size: 14px;">
          This code will expire in 10 minutes.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this code, please ignore this email.
        </p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    
    // Provide more detailed error messages
    let errorMessage = "Failed to send email";
    
    if (error.code === "EAUTH" || error.responseCode === 535) {
      errorMessage = "Gmail authentication failed! You MUST use an App Password, not your regular Gmail password. Steps: 1) Enable 2-Step Verification in Google Account, 2) Generate App Password at https://myaccount.google.com/apppasswords, 3) Use that 16-character password as EMAIL_PASSWORD in .env file";
    } else if (error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
      errorMessage = "Failed to connect to email server. Please check your internet connection and email service settings";
    } else if (error.message && error.message.includes("not configured")) {
      errorMessage = error.message;
    } else {
      errorMessage = error.message || "Unknown error occurred while sending email";
    }
    
    return { success: false, error: errorMessage };
  }
};

module.exports = { sendOTPEmail };

