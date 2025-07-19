import nodemailer from 'nodemailer'

const sendMail = async (email, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter.sendMail({
    from: `"Verify Email" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html,
  });
};

// For API usage
const sendEmail = async (req, res) => {
  try {
    const { email, subject, html } = req.body;
    const sendMailStatus = await sendMail(email, subject, html);
    if (sendMailStatus) {
      res.status(200).json({ message: "Email Sent Successfully" })
    } else {
      res.status(400).json({ message: "Email Sending failed" })
    }
  } catch (e) {
    res.status(500).json({ message: "Email Sending failed", error: e.message })
  }
};

const EmailController = { sendEmail, sendMail };
export default EmailController; 