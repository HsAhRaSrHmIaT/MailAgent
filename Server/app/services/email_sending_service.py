import smtplib
import dns.resolver
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
    
    def send_user_email(
        self, 
        sender_email: str, 
        sender_password: str, 
        recipient_email: str, 
        subject: str, 
        body: str,
        smtp_server: Optional[str] = None,
        smtp_port: Optional[int] = None
    ) -> tuple[bool, Optional[str]]:
        """
        Send a user-generated email using their own SMTP credentials.
        
        Args:
            sender_email: The sender's email address
            sender_password: The sender's email password/app password
            recipient_email: The recipient's email address
            subject: Email subject
            body: Email body (can be HTML or plain text)
            smtp_server: SMTP server address (defaults to Gmail if not provided)
            smtp_port: SMTP port (defaults to 587 if not provided)
            
        Returns:
            Tuple of (success: bool, error_message: Optional[str])
        """
        if not sender_email or not sender_password:
            return False, "Sender email credentials are required"
        
        if not recipient_email:
            return False, "Recipient email is required"
        
        # Use provided SMTP settings or default to Gmail
        server = smtp_server or "smtp.gmail.com"
        port = smtp_port or 587
        
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = sender_email
            message["To"] = recipient_email
            
            # Check if body contains HTML
            if "<html" in body.lower() or "<div" in body.lower():
                # Body is HTML
                part = MIMEText(body, "html")
            else:
                # Body is plain text, but preserve formatting
                part = MIMEText(body, "plain")
            
            message.attach(part)
            
            # Send email
            with smtplib.SMTP(server, port) as smtp:
                smtp.starttls()  # Secure the connection
                smtp.login(sender_email, sender_password)
                smtp.sendmail(sender_email, recipient_email, message.as_string())
            
            print(f"Email sent successfully from {sender_email} to {recipient_email}")
            return True, None
            
        except smtplib.SMTPAuthenticationError:
            error_msg = "Authentication failed. Please check your email and password/app password."
            print(f"SMTP Authentication Error: {error_msg}")
            return False, error_msg
        except smtplib.SMTPRecipientsRefused:
            error_msg = f"Recipient email address '{recipient_email}' was refused by the server."
            print(f"SMTP Recipients Refused: {error_msg}")
            return False, error_msg
        except smtplib.SMTPException as e:
            error_msg = f"SMTP error occurred: {str(e)}"
            print(f"SMTP Exception: {error_msg}")
            return False, error_msg
        except Exception as e:
            error_msg = f"Failed to send email: {str(e)}"
            print(f"General Exception: {error_msg}")
            return False, error_msg
    
    def verify_smtp_mailbox(self, email: str, mx_host: str) -> tuple[bool, Optional[str]]:
        """
        Verify if a mailbox exists by connecting to the MX server directly via SMTP.
        This method doesn't send any email, just checks if the server accepts the recipient.
        
        Args:
            email: The email address to verify
            mx_host: The MX server hostname
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        import socket
        
        try:
            # Remove trailing dot from MX hostname
            mx_host = mx_host.rstrip('.')
            
            print(f"  🔌 Connecting to mail server: {mx_host}")
            
            # Create socket and connect to MX server on port 25
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(10)
            sock.connect((mx_host, 25))
            
            # Receive welcome message
            sock.recv(1024)
            
            # Send HELO
            sock.send(b'HELO verify.local\r\n')
            sock.recv(1024)
            
            # Send MAIL FROM (use a generic sender)
            sock.send(b'MAIL FROM: <verify@verify.local>\r\n')
            sock.recv(1024)
            
            # Send RCPT TO - this is where we check if mailbox exists
            sock.send(f'RCPT TO: <{email}>\r\n'.encode())
            response = sock.recv(1024).decode()
            
            # Send QUIT
            sock.send(b'QUIT\r\n')
            sock.close()
            
            # Check response code
            # 250 = mailbox exists
            # 550/551/553 = mailbox doesn't exist or rejected
            # 450/451/452 = temporary error, assume valid
            if response.startswith('250'):
                print(f"  ✓ Mailbox verified: {email}")
                return True, None
            elif response.startswith(('550', '551', '553')):
                print(f"  ✗ Mailbox rejected: {response.strip()}")
                return False, f"Mailbox '{email}' does not exist or is unavailable"
            elif response.startswith(('450', '451', '452')):
                print(f"  ⚠ Temporary error, assuming valid: {response.strip()}")
                return True, None  # Assume valid on temporary errors
            else:
                print(f"  ⚠ Unexpected response: {response.strip()}")
                return True, None  # Assume valid on unexpected responses
                
        except socket.timeout:
            print(f"  ⚠ SMTP verification timeout for {mx_host}")
            return True, None  # Don't fail on timeout
        except Exception as e:
            print(f"  ⚠ SMTP verification failed: {type(e).__name__} - {str(e)}")
            return True, None  # Don't fail on errors, let actual send try
    
    def validate_email_domain(self, email: str) -> tuple[bool, Optional[str]]:
        """
        Validate email by checking MX records and verifying mailbox existence via SMTP.
        
        Args:
            email: The email address to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            if '@' not in email:
                return False, "Invalid email format"
                
            domain = email.split('@')[1].strip()
            
            if not domain:
                return False, "Invalid email format - missing domain"
            
            # Check for invalid/test domains
            invalid_domains = ['example.com', 'example.org', 'example.net', 
                             'test.com', 'test.org', 'test.net',
                             'localhost', 'invalid', 'local']
            
            if domain.lower() in invalid_domains:
                return False, f"Domain '{domain}' is a reserved/test domain and cannot receive emails"
            
            # Step 1: Check MX records
            print(f"🔍 Validating email: {email}")
            try:
                mx_records = dns.resolver.resolve(domain, 'MX')
                if not mx_records or len(mx_records) == 0:
                    print(f"✗ Domain '{domain}' has no MX records")
                    return False, f"Domain '{domain}' cannot receive emails (no mail server configured)"
                
                # Sort by priority and get the primary MX server
                mx_list = sorted(mx_records, key=lambda x: x.preference)
                primary_mx = str(mx_list[0].exchange)
                
                print(f"✓ Domain '{domain}' has valid MX records (primary: {primary_mx})")
                
                # Step 2: Verify mailbox via SMTP
                is_valid, error = self.verify_smtp_mailbox(email, primary_mx)
                
                if not is_valid:
                    return False, error
                    
                print(f"✓ Email '{email}' validated successfully")
                return True, None
                    
            except dns.resolver.NXDOMAIN:
                print(f"✗ Domain '{domain}' does not exist")
                return False, f"Domain '{domain}' does not exist"
                
            except dns.resolver.NoAnswer:
                print(f"✗ Domain '{domain}' exists but has no MX records")
                return False, f"Domain '{domain}' cannot receive emails (no mail server configured)"
                
            except dns.resolver.Timeout:
                print(f"✗ DNS lookup timeout for '{domain}'")
                return False, f"Cannot verify domain '{domain}': DNS lookup timeout"
                
            except dns.exception.DNSException as e:
                print(f"✗ DNS error for '{domain}': {type(e).__name__} - {str(e)}")
                return False, f"Cannot verify domain '{domain}': DNS lookup failed"
                
        except IndexError:
            return False, "Invalid email format"
        except Exception as e:
            print(f"✗ Unexpected error validating {email}: {type(e).__name__} - {str(e)}")
            return False, f"Email validation error: {str(e)}"
    
    async def send_user_emails_bulk(
        self,
        sender_email: str,
        sender_password: str,
        recipient_emails: list[str],
        subject: str,
        body: str,
        smtp_server: Optional[str] = None,
        smtp_port: Optional[int] = None
    ) -> list[dict]:
        """
        Send emails to multiple recipients using a single SMTP connection (async/optimized).
        
        Args:
            sender_email: The sender's email address
            sender_password: The sender's email password/app password
            recipient_emails: List of recipient email addresses (max 50)
            subject: Email subject
            body: Email body (can be HTML or plain text)
            smtp_server: SMTP server address (defaults to Gmail if not provided)
            smtp_port: SMTP port (defaults to 587 if not provided)
            
        Returns:
            List of dicts with results: [{"email": str, "success": bool, "error": Optional[str]}]
        """
        if not sender_email or not sender_password:
            return [{"email": email, "success": False, "error": "Sender credentials are required"} 
                    for email in recipient_emails]
        
        if not recipient_emails or len(recipient_emails) == 0:
            return []
        
        if len(recipient_emails) > 50:
            return [{"email": email, "success": False, "error": "Maximum 50 recipients allowed"} 
                    for email in recipient_emails]
        
        # Use provided SMTP settings or default to Gmail
        server = smtp_server or "smtp.gmail.com"
        port = smtp_port or 587
        
        results = []
        
        try:
            # Open a single SMTP connection for all emails
            with smtplib.SMTP(server, port) as smtp:
                smtp.starttls()
                
                # Authenticate once
                try:
                    smtp.login(sender_email, sender_password)
                except smtplib.SMTPAuthenticationError:
                    error_msg = "Authentication failed. Please check your email and password/app password."
                    return [{"email": email, "success": False, "error": error_msg} 
                            for email in recipient_emails]
                
                # Send to each recipient through the same connection
                for recipient_email in recipient_emails:
                    try:
                        # Validate domain before attempting to send
                        is_valid, error_msg = self.validate_email_domain(recipient_email)
                        if not is_valid:
                            results.append({
                                "email": recipient_email,
                                "success": False,
                                "error": error_msg
                            })
                            print(f"✗ Failed validation for {recipient_email}: {error_msg}")
                            continue
                        
                        # Create message for this recipient
                        message = MIMEMultipart("alternative")
                        message["Subject"] = subject
                        message["From"] = sender_email
                        message["To"] = recipient_email
                        
                        # Check if body contains HTML
                        if "<html" in body.lower() or "<div" in body.lower():
                            part = MIMEText(body, "html")
                        else:
                            part = MIMEText(body, "plain")
                        
                        message.attach(part)
                        
                        # Send through the existing connection
                        smtp.sendmail(sender_email, recipient_email, message.as_string())
                        
                        results.append({
                            "email": recipient_email,
                            "success": True,
                            "error": None
                        })
                        print(f"✓ Email sent to {recipient_email}")
                        
                    except smtplib.SMTPRecipientsRefused:
                        error_msg = f"Recipient address was refused by the server"
                        results.append({
                            "email": recipient_email,
                            "success": False,
                            "error": error_msg
                        })
                        print(f"✗ Failed to send to {recipient_email}: {error_msg}")
                        
                    except Exception as e:
                        error_msg = str(e)
                        results.append({
                            "email": recipient_email,
                            "success": False,
                            "error": error_msg
                        })
                        print(f"✗ Failed to send to {recipient_email}: {error_msg}")
                
                print(f"Bulk send completed: {len([r for r in results if r['success']])}/{len(recipient_emails)} successful")
                return results
                
        except Exception as e:
            error_msg = f"Failed to establish SMTP connection: {str(e)}"
            print(f"Connection Error: {error_msg}")
            return [{"email": email, "success": False, "error": error_msg} 
                    for email in recipient_emails]

email_sending_service = EmailSendingService()
