import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv
from typing import List, Optional
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=os.getenv("SMTP_USER"),
            MAIL_PASSWORD=os.getenv("SMTP_PASS"),
            MAIL_FROM=os.getenv("SMTP_FROM", os.getenv("SMTP_USER")),
            MAIL_PORT=int(os.getenv("SMTP_PORT", 587)),
            MAIL_SERVER=os.getenv("SMTP_HOST"),
            MAIL_FROM_NAME="ArticuLink",
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
        subject = "ArticuLink - Your Verification Code"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4A90E2; text-align: center;">ArticuLink Verification</h2>
                    <p>Hello,</p>
                    <p>Your verification code for ArticuLink is:</p>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
                        {otp}
                    </div>
                    <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                    <p>Best regards,<br>The ArticuLink Team</p>
                </div>
            </body>
        </html>
        """
        return await self.send_email(subject, [email], body)

    async def send_password_reset(self, email: str, reset_link: str):
        subject = "ArticuLink - Password Reset Request"
        body = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4A90E2; text-align: center;">Password Reset</h2>
                    <p>Hello,</p>
                    <p>We received a request to reset your password for ArticuLink.</p>
                    <p>Click the button below to reset it:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background-color: #4A90E2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">{reset_link}</p>
                    <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
                    <p>Best regards,<br>The ArticuLink Team</p>
                </div>
            </body>
        </html>
        """
        return await self.send_email(subject, [email], body)

email_service = EmailService()
