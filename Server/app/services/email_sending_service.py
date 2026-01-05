import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.core.config import settings


class EmailSendingService:
    """Service for sending emails via SMTP."""
    
    def __init__(self):
        self.sender_email = settings.agent_email
        self.email_password = settings.agent_email_password
        self.smtp_server = "smtp.gmail.com"  # Gmail SMTP server
        self.smtp_port = 587  # TLS port
    
    def send_password_reset_email(self, recipient_email: str, reset_token: str) -> bool:
        """
        Send a password reset email to the user.
        
        Args:
            recipient_email: The user's email address
            reset_token: The password reset token
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if not self.sender_email or not self.email_password:
            print("Email credentials not configured")
            return False
        
        try:
            # Create reset link
            reset_link = f"{settings.client_url}/reset-password?token={reset_token}"
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = "Reset Your MailAgent Password"
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            # Create HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background-color: #3B82F6;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }}
                    .content {{
                        background-color: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }}
                    .button {{
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #3B82F6;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 20px;
                        color: #666;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>MailAgent</h1>
                    </div>
                    <div class="content">
                        <h2>Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your password. Click the button below to reset it:</p>
                        <center>
                            <a href="{reset_link}" class="button">Reset Password</a>
                        </center>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #3B82F6;">{reset_link}</p>
                        <p><strong>This link will expire in 1 hour.</strong></p>
                        <p>If you didn't request a password reset, you can safely ignore this email.</p>
                        <div class="footer">
                            <p>This is an automated email from MailAgent. Please do not reply.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create plain text version
            text_content = f"""
            MailAgent - Password Reset Request
            
            Hello,
            
            We received a request to reset your password. Click the link below to reset it:
            
            {reset_link}
            
            This link will expire in 1 hour.
            
            If you didn't request a password reset, you can safely ignore this email.
            
            ---
            This is an automated email from MailAgent. Please do not reply.
            """
            
            # Attach both HTML and plain text versions
            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            message.attach(part1)
            message.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Secure the connection
                server.login(self.sender_email, self.email_password)
                server.sendmail(self.sender_email, recipient_email, message.as_string())
            
            print(f"Password reset email sent to {recipient_email}")
            return True
            
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            return False

    def send_welcome_email(self, recipient_email: str, username: str) -> bool:
        """
        Send a welcome email to the new user.
        
        Args:
            recipient_email: The user's email address
            username: The user's username
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if not self.sender_email or not self.email_password:
            print("Email credentials not configured")
            return False
        
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = "Welcome to MailAgent! 🚀"
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            # Create HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }}
                    .content {{
                        background-color: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }}
                    .button {{
                        display: inline-block;
                        padding: 12px 30px;
                        background-color: #3B82F6;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }}
                    .feature {{
                        background-color: white;
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 5px;
                        border-left: 4px solid #3B82F6;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 20px;
                        color: #666;
                        font-size: 12px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to MailAgent!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi {username}! 👋</h2>
                        <p>Welcome aboard! We're thrilled to have you join the MailAgent family.</p>
                        <p>Your account has been successfully created, and you're all set to start generating professional emails with the power of AI.</p>
                        
                        <h3>What you can do with MailAgent:</h3>
                        <div class="feature">
                            <strong>✨ AI-Powered Email Generation</strong>
                            <p>Create professional emails in seconds with our advanced AI assistant.</p>
                        </div>
                        <div class="feature">
                            <strong>📝 Multiple Tones & Styles</strong>
                            <p>Choose from various tones - formal, casual, friendly, and more.</p>
                        </div>
                        <div class="feature">
                            <strong>🔄 Edit & Regenerate</strong>
                            <p>Fine-tune your emails or regenerate them until they're perfect.</p>
                        </div>
                        <div class="feature">
                            <strong>📊 Track Your Progress</strong>
                            <p>Monitor your usage stats and see how much time you've saved.</p>
                        </div>
                        
                        <center>
                            <a href="{settings.client_url}" class="button">Get Started</a>
                        </center>
                        
                        <p>If you have any questions or need assistance, feel free to reach out. We're here to help!</p>
                        <p>Happy emailing! 🚀</p>
                        
                        <div class="footer">
                            <p>The MailAgent Team</p>
                            <p>This is an automated email from MailAgent. Please do not reply.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create plain text version
            text_content = f"""
            Welcome to MailAgent!
            
            Hi {username}! 👋
            
            Welcome aboard! We're thrilled to have you join the MailAgent family.
            
            Your account has been successfully created, and you're all set to start generating professional emails with the power of AI.
            
            What you can do with MailAgent:
            
            ✨ AI-Powered Email Generation
            Create professional emails in seconds with our advanced AI assistant.
            
            📝 Multiple Tones & Styles
            Choose from various tones - formal, casual, friendly, and more.
            
            🔄 Edit & Regenerate
            Fine-tune your emails or regenerate them until they're perfect.
            
            📊 Track Your Progress
            Monitor your usage stats and see how much time you've saved.
            
            Get Started: {settings.client_url}
            
            If you have any questions or need assistance, feel free to reach out. We're here to help!
            
            Happy emailing! 🚀
            
            ---
            The MailAgent Team
            This is an automated email from MailAgent. Please do not reply.
            """
            
            # Attach both HTML and plain text versions
            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            message.attach(part1)
            message.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Secure the connection
                server.login(self.sender_email, self.email_password)
                server.sendmail(self.sender_email, recipient_email, message.as_string())
            
            print(f"Welcome email sent to {recipient_email}")
            return True
            
        except Exception as e:
            print(f"Failed to send welcome email: {str(e)}")
            return False
    
    def send_otp_email(self, recipient_email: str, username: str, otp: str) -> bool:
        """
        Send OTP verification email to the new user.
        
        Args:
            recipient_email: The user's email address
            username: The user's username
            otp: The 6-digit OTP code
            
        Returns:
            True if email sent successfully, False otherwise
        """
        if not self.sender_email or not self.email_password:
            print("Email credentials not configured")
            return False
        
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = "Verify Your MailAgent Account"
            message["From"] = self.sender_email
            message["To"] = recipient_email
            
            # Create HTML content
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }}
                    .header {{
                        background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 5px 5px 0 0;
                    }}
                    .content {{
                        background-color: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 5px 5px;
                    }}
                    .otp-box {{
                        background-color: white;
                        border: 2px dashed #3B82F6;
                        padding: 30px;
                        margin: 20px 0;
                        text-align: center;
                        border-radius: 5px;
                    }}
                    .otp-code {{
                        font-size: 36px;
                        font-weight: bold;
                        color: #3B82F6;
                        letter-spacing: 8px;
                        font-family: 'Courier New', monospace;
                    }}
                    .footer {{
                        text-align: center;
                        margin-top: 20px;
                        color: #666;
                        font-size: 12px;
                    }}
                    .warning {{
                        background-color: #FEF3C7;
                        border-left: 4px solid #F59E0B;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 5px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Verify Your Email</h1>
                    </div>
                    <div class="content">
                        <h2>Hi {username}! 👋</h2>
                        <p>Welcome to MailAgent! To complete your registration, please verify your email address.</p>
                        
                        <p>Your verification code is:</p>
                        <div class="otp-box">
                            <div class="otp-code">{otp}</div>
                        </div>
                        
                        <div class="warning">
                            <strong>⏰ Important:</strong> This code will expire in 10 minutes.
                        </div>
                        
                        <p>Enter this code on the verification page to activate your account.</p>
                        <p>If you didn't create an account with MailAgent, you can safely ignore this email.</p>
                        
                        <div class="footer">
                            <p>The MailAgent Team</p>
                            <p>This is an automated email from MailAgent. Please do not reply.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Create plain text version
            text_content = f"""
            Verify Your MailAgent Account
            
            Hi {username}! 👋
            
            Welcome to MailAgent! To complete your registration, please verify your email address.
            
            Your verification code is:
            
            {otp}
            
            ⏰ Important: This code will expire in 10 minutes.
            
            Enter this code on the verification page to activate your account.
            
            If you didn't create an account with MailAgent, you can safely ignore this email.
            
            ---
            The MailAgent Team
            This is an automated email from MailAgent. Please do not reply.
            """
            
            # Attach both HTML and plain text versions
            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            message.attach(part1)
            message.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()  # Secure the connection
                server.login(self.sender_email, self.email_password)
                server.sendmail(self.sender_email, recipient_email, message.as_string())
            
            print(f"OTP email sent to {recipient_email}")
            return True
            
        except Exception as e:
            print(f"Failed to send OTP email: {str(e)}")
            return False

email_sending_service = EmailSendingService()
