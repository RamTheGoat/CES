import nodemailer from "nodemailer";

export async function sendProfileUpdateEmail(email, name, updatedField) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Jiexian0902@gmail.com", 
        pass: "wpyhctrfiwlroqea",   
      },
    });

    const mailOptions = {
      from: '"E-Cinema Support" <yourgmail@gmail.com>',
      to: email,
      subject: "Your account was updated",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your ${updatedField} was successfully updated on your E-Cinema account.</p>
        <p>If you didn’t make this change, please reset your password immediately.</p>
        <br>
        <p>Thank you,<br>The E-Cinema Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email} about ${updatedField} update`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
}

export async function sendPromotionalEmail(email, name, promotion) {
  try {
    const { code, discount, expiration, message } = promotion;
    const date = new Date(expiration).toLocaleString("en-US", { dateStyle: "long" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Jiexian0902@gmail.com", 
        pass: "wpyhctrfiwlroqea",   
      },
    });

    const mailOptions = {
      from: '"E-Cinema System" <yourgmail@gmail.com>',
      to: email,
      subject: `PROMOTION: Use code ${code.toUpperCase()} for ${discount}% off!`,
      html: `
        <h2>${name}, use code ${code.toUpperCase()} for ${discount}% off today!</h2>
        <p>Code expires on ${date}, use this code soon in order to claim the discount!</p>
        <p>${message}</p>
        <p>Book your tickets today!</p>
        <p>Thank you,<br>The E-Cinema Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email} about promotion`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
}