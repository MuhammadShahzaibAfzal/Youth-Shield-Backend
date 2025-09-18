import { format } from "date-fns";
import { IUser } from "../models/UserModel";

const LOGO =
  "https://res.cloudinary.com/drgnyidzj/image/upload/v1758220123/logo-colored_bpcvmc.png";

export const getAmbassadorTemplate = (
  user: Partial<IUser>
): { subject: string; html: string } => {
  return {
    subject: "🚀 New Ambassador Joined",
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
          🚀 New Ambassador Registration
        </h2>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; width: 35%; color: #746CAD;">Name:</td>
            <td style="padding: 10px 0;">${user.firstName || ""} ${
      user.lastName || ""
    }</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #746CAD;">Email:</td>
            <td style="padding: 10px 0;">
              <a href="mailto:${
                user.email
              }" style="color: #3DA45D; text-decoration: none;">
                ${user.email}
              </a>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #746CAD;">Gender:</td>
            <td style="padding: 10px 0;">${user.gender || "N/A"}</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #746CAD;">Date of Birth:</td>
            <td style="padding: 10px 0;">${
              user?.dob ? format(user.dob, "dd/MM/yyyy") : "N/A"
            }</td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #746CAD;">High School:</td>
            <td style="padding: 10px 0; text-transform: capitalize;">
              ${
                /* @ts-ignore */
                user.highSchool?.name || "N/A"
              }
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #746CAD;">Country:</td>
            <td style="padding: 10px 0;">${user.country || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #746CAD;">Country Code:</td>
            <td style="padding: 10px 0;">${user.countryCode || "N/A"}</td>
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
