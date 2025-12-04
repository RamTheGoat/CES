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

export async function sendBookingConfirmationEmail(email, name, bookingDetails) {
  try {
    const { 
      bookingId, 
      movieTitle, 
      showtime, 
      seats, 
      totalAmount, 
      cinemaName 
    } = bookingDetails;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "Jiexian0902@gmail.com",
        pass: "wpyhctrfiwlroqea",
      },
    });

    // Format the date and time
    const showtimeDate = new Date(showtime).toLocaleString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: '"E-Cinema Booking" <Jiexian0902@gmail.com>',
      to: email,
      subject: `Booking Confirmation - ${movieTitle}`,
      html: `
        <h2>Booking Confirmation</h2>
        <p>Hello ${name},</p>
        
        <p>Your booking has been confirmed! Here are your ticket details:</p>
        
        <h3>${movieTitle}</h3>
        <p><strong>Booking ID:</strong> ${bookingId}</p>
        <p><strong>Cinema:</strong> ${cinemaName}</p>
        <p><strong>Showtime:</strong> ${showtimeDate}</p>
        <p><strong>Seats:</strong> ${seats.join(', ')}</p>
        <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
        
        <br>
        <p><strong>Important Information:</strong></p>
        <ul>
          <li>Please arrive at least 30 minutes before the showtime</li>
          <li>Bring a valid ID for verification</li>
          <li>Seats are subject to availability upon arrival</li>
          <li>Contact support for any changes or cancellations</li>
        </ul>
        
        <br>
        <p>Thank you for booking with E-Cinema!</p>
        <p><strong>The E-Cinema Team</strong></p>
        
        <br>
        <p><small>Need help? Contact our support team at support@e-cinema.com</small></p>
        <p><small>This is an automated email, please do not reply directly to this message.</small></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Booking confirmation email sent to ${email} for booking ${bookingId}`);
  } catch (error) {
    console.error("❌ Error sending booking confirmation email:", error.message);
  }
}