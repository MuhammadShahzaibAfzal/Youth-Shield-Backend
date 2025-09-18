import { INewsLetter } from "../models/NewsLetterModel";

const LOGO =
  "https://res.cloudinary.com/drgnyidzj/image/upload/v1758220123/logo-colored_bpcvmc.png";

export const getNewsletterTemplate = (
  data: Partial<INewsLetter>
): { subject: string; html: string } => {
  return {
    subject: "📰 New Newsletter Subscription",
    html: `
    <div style="font-family: Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        color: #333;
        background-color: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        padding: 16px;">
      
      <!-- Logo -->
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #3DA45D;">
        <img src="${LOGO}" alt="YouthShield Logo" style="max-width: 180px; height: auto;">
      </div>
      
      <!-- Title -->
      <div style="padding: 20px; border-radius: 8px;">
        <h2 style="color: #3DA45D; margin-top: 0; text-align: center;">
          📰 New Newsletter Subscriber
        </h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #746CAD;">Name:</td>
            <td style="padding: 10px 0;">${data.firstName || ""} ${
      data.lastName || ""
    }</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #746CAD;">Email:</td>
            <td style="padding: 10px 0;">
              <a href="mailto:${
                data.email
              }" style="color: #3DA45D; text-decoration: none;">
                ${data.email}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #746CAD;">Status:</td>
            <td style="padding: 10px 0;">Subscribed ✅</td>
          </tr>
        </table>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
        <p>© ${new Date().getFullYear()} YouthShield. All rights reserved.</p>
      </div>
    </div>
    `,
  };
};
