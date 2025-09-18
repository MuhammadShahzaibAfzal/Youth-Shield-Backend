import Config from "../config";
import { IUser } from "../models/UserModel";

const LOGO =
  "https://res.cloudinary.com/drgnyidzj/image/upload/v1758220123/logo-colored_bpcvmc.png";

export const getPasswordResetTemplate = (
  user: Partial<IUser>,
  resetToken: string
): { subject: string; html: string } => {
  const resetLink = `${Config.DASHBOARD_DOMAIN}/reset-password/${resetToken}`;

  return {
    subject: "🔐 Password Reset Request",
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

        <!-- Body -->
        <div style="padding: 20px;">
          <h2 style="color: #3DA45D; margin-top: 0;">Password Reset Request</h2>
          <p>Hello <strong>${user.firstName || "User"}</strong>,</p>
          <p>We received a request to reset your password. If this was you, please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" 
              style="background-color: #3DA45D; color: #fff; padding: 12px 24px;
              text-decoration: none; border-radius: 6px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>If the button above does not work, copy and paste the following link into your browser:</p>
          <p><a href="${resetLink}" style="color: #3DA45D;">${resetLink}</a></p>
          <p>If you did not request this password reset, you can safely ignore this email.</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
          <p>© ${new Date().getFullYear()} YouthShield. All rights reserved.</p>
        </div>
      </div>
    `,
  };
};
