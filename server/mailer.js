import nodemailer from "nodemailer";

export const sendProfileUpdateEmail = async (userEmail, userName, changeType) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Jiexian0902@gmail.com",  
        pass: "wpyhctrfiwlroqea"       
      },
    });

    const mailOptions = {
      from: `"E-Cinema Support" <yourEmail@gmail.com>`,
      to: userEmail,
      subject: `Your profile has been updated`,
      html: `
        <h2>Hello ${userName || "User"},</h2>
        <p>Your <strong>${changeType}</strong> was successfully updated in your E-Cinema account.</p>
        <p>If you did not make this change, please reset your password immediately.</p>
        <br/>
        <p>Thank you,<br/>E-Cinema Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(` Email sent for ${changeType} update to ${userEmail}`);
  } catch (err) {
    console.error(` Failed to send ${changeType} update email:`, err);
  }
};
