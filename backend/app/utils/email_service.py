import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv
from typing import List, Optional
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# ─── Brand Palette ────────────────────────────────────────────────
BRAND = {
    "cream": "#FAF8F4",
    "warmWhite": "#F5F1EA",
    "sandMid": "#DDD6C8",
    "royalBlue": "#1A4480",
    "teal": "#2A8FA0",
    "textDark": "#1C2B3A",
    "textMid": "#4A5A6A",
    "white": "#FFFFFF",
}


def _base_template(content: str) -> str:
    """Wraps email content in a branded Articulink shell."""
    return f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background-color:{BRAND['cream']}; font-family:'Segoe UI',Roboto,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:{BRAND['cream']}; padding:32px 0;">
            <tr><td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px; width:100%; background-color:{BRAND['white']}; border-radius:16px; border:1px solid {BRAND['sandMid']}; overflow:hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="background-color:{BRAND['royalBlue']}; padding:28px 32px; text-align:center;">
                            <h1 style="margin:0; font-size:22px; font-weight:800; color:{BRAND['white']}; letter-spacing:-0.3px;">
                                Articulink
                            </h1>
                            <div style="width:28px; height:3px; background-color:{BRAND['teal']}; border-radius:2px; margin:8px auto 0;"></div>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding:32px 32px 28px;">
                            {content}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:20px 32px; border-top:1px solid {BRAND['sandMid']}; text-align:center;">
                            <p style="margin:0 0 4px; font-size:12px; color:{BRAND['textMid']};">
                                &copy; 2026 Articulink &middot; All rights reserved
                            </p>
                            <p style="margin:0; font-size:11px; color:{BRAND['sandMid']};">
                                Seamless communication, powered by AI
                            </p>
                        </td>
                    </tr>

                </table>
            </td></tr>
        </table>
    </body>
    </html>
    """


class EmailService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=os.getenv("SMTP_USER"),
            MAIL_PASSWORD=os.getenv("SMTP_PASS"),
            MAIL_FROM=os.getenv("SMTP_FROM", os.getenv("SMTP_USER")),
            MAIL_PORT=int(os.getenv("SMTP_PORT", 587)),
            MAIL_SERVER=os.getenv("SMTP_HOST"),
            MAIL_FROM_NAME="Articulink",
            MAIL_STARTTLS=True,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True
        )

    async def send_email(
        self, 
        subject: str, 
        recipients: List[str], 
        body: str, 
        subtype: MessageType = MessageType.html
    ):
        message = MessageSchema(
            subject=subject,
            recipients=recipients,
            body=body,
            subtype=subtype
        )

        fm = FastMail(self.conf)
        try:
            await fm.send_message(message)
            logger.info(f"Email sent successfully to {recipients}")
            return True
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False

    async def send_otp(self, email: str, otp: str):
        subject = "Articulink — Your Verification Code"

        # Build individual digit boxes
        digit_boxes = ""
        for ch in otp:
            digit_boxes += f"""
            <td style="
                width:40px; height:44px;
                background-color:{BRAND['cream']};
                border:1.5px solid {BRAND['teal']};
                border-radius:10px;
                text-align:center;
                vertical-align:middle;
                font-size:22px;
                font-weight:700;
                color:{BRAND['textDark']};
                font-family:'Segoe UI',Roboto,monospace;
            ">{ch}</td>
            """

        content = f"""
        <div style="text-align:center; margin-bottom:24px;">
            <div style="
                display:inline-block;
                width:52px; height:52px;
                line-height:52px;
                background-color:{BRAND['cream']};
                border:1px solid {BRAND['sandMid']};
                border-radius:14px;
                font-size:28px;
                text-align:center;
            ">🛡️</div>
        </div>

        <h2 style="margin:0 0 6px; font-size:18px; font-weight:800; color:{BRAND['textDark']}; text-align:center; letter-spacing:-0.2px;">
            Verify Your Email
        </h2>
        <p style="margin:0 0 20px; font-size:13px; color:{BRAND['textMid']}; text-align:center; line-height:1.5;">
            Use the code below to complete your Articulink registration. It expires in <strong style="color:{BRAND['teal']};">10 minutes</strong>.
        </p>

        <!-- OTP Digit Boxes -->
        <table cellpadding="0" cellspacing="6" style="margin:0 auto 24px;" role="presentation">
            <tr>{digit_boxes}</tr>
        </table>

        <!-- Divider -->
        <div style="height:1px; background-color:{BRAND['sandMid']}; margin:0 8px 20px; opacity:0.5;"></div>

        <p style="margin:0 0 6px; font-size:12px; color:{BRAND['textMid']}; text-align:center; line-height:1.6;">
            If you didn't create an Articulink account, you can safely ignore this email.
        </p>
        <p style="margin:0; font-size:12px; color:{BRAND['sandMid']}; text-align:center;">
            Do not share this code with anyone.
        </p>
        """
        return await self.send_email(subject, [email], _base_template(content))

    async def send_password_reset(self, email: str, reset_link: str):
        subject = "Articulink — Reset Your Password"
        content = f"""
        <div style="text-align:center; margin-bottom:24px;">
            <div style="
                display:inline-block;
                width:52px; height:52px;
                line-height:52px;
                background-color:{BRAND['cream']};
                border:1px solid {BRAND['sandMid']};
                border-radius:14px;
                font-size:28px;
                text-align:center;
            ">🔑</div>
        </div>

        <h2 style="margin:0 0 6px; font-size:18px; font-weight:800; color:{BRAND['textDark']}; text-align:center; letter-spacing:-0.2px;">
            Reset Your Password
        </h2>
        <p style="margin:0 0 24px; font-size:13px; color:{BRAND['textMid']}; text-align:center; line-height:1.5;">
            We received a request to reset the password for your Articulink account. Click the button below to set a new one.
        </p>

        <!-- CTA Button -->
        <div style="text-align:center; margin-bottom:24px;">
            <a href="{reset_link}" style="
                display:inline-block;
                background-color:{BRAND['royalBlue']};
                color:{BRAND['white']};
                padding:14px 36px;
                font-size:14px;
                font-weight:700;
                text-decoration:none;
                border-radius:12px;
                letter-spacing:0.3px;
            ">RESET PASSWORD</a>
        </div>

        <p style="margin:0 0 4px; font-size:12px; color:{BRAND['textMid']}; text-align:center;">
            Or copy this link into your browser:
        </p>
        <p style="margin:0 0 20px; font-size:11px; color:{BRAND['teal']}; text-align:center; word-break:break-all;">
            {reset_link}
        </p>

        <!-- Divider -->
        <div style="height:1px; background-color:{BRAND['sandMid']}; margin:0 8px 20px; opacity:0.5;"></div>

        <p style="margin:0; font-size:12px; color:{BRAND['textMid']}; text-align:center; line-height:1.6;">
            This link expires in <strong style="color:{BRAND['teal']};">1 hour</strong>. If you didn't request this, you can safely ignore this email.
        </p>
        """
        return await self.send_email(subject, [email], _base_template(content))


email_service = EmailService()
