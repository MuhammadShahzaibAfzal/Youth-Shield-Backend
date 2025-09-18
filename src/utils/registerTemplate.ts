import { IUser } from "../models/UserModel";

const LOGO =
  "https://res.cloudinary.com/drgnyidzj/image/upload/v1758220123/logo-colored_bpcvmc.png";

export const getWelcomeTemplate = (user: IUser): { subject: string; html: string } => {
  return {
    subject: "🎉 Welcome to YouthShield!",
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
          🎉 Welcome to YouthShield, ${user.firstName}!
        </h2>
        
        <p style="text-align: center; font-size: 15px; color: #555; line-height: 1.6;">
          We’re thrilled to have you join our <strong>global community</strong> of young leaders 
          dedicated to <strong>empowering teens</strong> and <strong>elevating health</strong> worldwide. 🌍✨
        </p>
        
        <p style="text-align: center; font-size: 15px; color: #555; line-height: 1.6;">
          Explore resources, connect with peers, and make an impact in improving 
          <strong>health literacy</strong> together with passionate youth like you.
        </p>
        
        <p style="text-align: center; font-size: 15px; color: #555; line-height: 1.6;">
          Let’s make a difference together! 💪
        </p>
        
        <p style="margin-top: 20px; text-align: center; color: #746CAD;">
          — The YouthShield Team
        </p>
      </div>
      
      <!-- Footer -->
      <div style="text-align: center; margin-top: 20px; color: #718096; font-size: 12px;">
        <p>© ${new Date().getFullYear()} YouthShield. All rights reserved.</p>
      </div>
    </div>
    `,
  };
};
