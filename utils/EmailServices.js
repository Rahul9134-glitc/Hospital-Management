import nodemailer from "nodemailer";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Hospital Management" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  let attempt = 1;
  const maxAttempts = 2; // try twice if it fails

  while (attempt <= maxAttempts) {
    try {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${options.email}`);
      await delay(2000); // ⏱️ 2-second delay before next mail
      break; // exit loop if success
    } catch (error) {
      console.error(
        `❌ Attempt ${attempt} failed to send email to ${options.email}:`,
        error.message
      );

      if (
        error.message.includes("Too many emails per second") &&
        attempt < maxAttempts
      ) {
        console.log("⏳ Waiting 3 seconds before retry...");
        await delay(3000); // wait 3 seconds then retry
        attempt++;
      } else {
        console.error("❌ Giving up after multiple attempts.");
        break;
      }
    }
  }
};

export default sendEmail;
