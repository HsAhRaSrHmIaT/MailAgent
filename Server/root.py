import smtplib
import sqlite3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from email.mime.text import MIMEText
import os
import re
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'Database', 'database.sqlite')

os.makedirs(os.path.join(BASE_DIR, 'Database'), exist_ok=True)

# print("Google Generative AI API Key:", os.getenv("GOOGLE_API_KEY"))

def is_valid_email(email: str) -> bool:
    """Check if the email address is valid."""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_regex, email) is not None

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmailInput(BaseModel):
    receiver_email: str
    email_message: str
    subject: str

class ChatInput(BaseModel):
    message: str
    tone: str = ""

class EmailGenerationRequest(BaseModel):
    receiver_email: str
    prompt: str
    tone: str = ""

@app.get("/api")
def email():
    return {"status": "Email API is running"}

@app.post("/api/send-email")
def send_email(data: EmailInput):
    try:
        if not data.receiver_email or not is_valid_email(data.receiver_email):
            raise HTTPException(status_code=400, detail="Invalid or missing receiver email. Cannot process the request.")
        
        # Simulate sending an email
        print(f"Sending email to {data.receiver_email} with message: {data.email_message}")

        msg = MIMEText(data.email_message)
        msg['Subject'] = data.subject if data.subject else "No Subject"
        msg['From'] = os.getenv("SENDER_EMAIL")
        msg['To'] = data.receiver_email

        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(os.getenv("SENDER_EMAIL"), os.getenv("EMAIL_PASSWORD"))
        server.sendmail(msg['From'], [msg['To']], msg.as_string())
        server.quit()

        # conn = sqlite3.connect(DB_PATH)
        # cursor = conn.cursor()
        # cursor.execute("CREATE TABLE IF NOT EXISTS emails (id INTEGER PRIMARY KEY AUTOINCREMENT, receiver TEXT, message TEXT, status TEXT)")
        # cursor.execute("INSERT INTO emails (receiver, message, status) VALUES (?, ?, ?)", (data.receiver_email, full_email, "sent"))
        # conn.commit()
        # conn.close()

        return {
            "message": "Sent", 
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat_message(data: ChatInput):
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(
            f"You are a chat assistant. Engage in conversation based on the user's message: '{data.message}'. "
            f"Use the tone: {data.tone if data.tone else 'neutral professional'}. "
            f"If the user asks you to send an email (e.g., says 'send this', 'email it', 'deliver it'), "
            f"respond exactly with: 'I can send an email for you, but for that you need to use the `/email` "
            f"command and provide the recipient's email address.' Do not generate or draft the email in this chat context. "
            f"Simply inform the user to use the `/email` command."
        )

        return {
            "message": response.text.strip(),
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-email")
def generate_email(data: EmailGenerationRequest):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content((
            f"You are an intelligent email-writing assistant. "
            f"Generate a complete, well-structured email for the recipient {data.receiver_email} based on the short message: {data.prompt}. "
            f"Format you response exactly like this:\n"
            f"Subject: [Your Subject Line]\n\n"
            f"Dear [Recipient's Name],\n"
            f"[Email Body with greeting, content, and closing]\n\n"
            f"Keep the tone {data.tone} (if provided, otherwise use a neutral professional tone). Sign the email as Harshit Sharma."
        ))

        email_text = response.text.strip()
        subject = "AI Generated Email"  # Default subject
        body = email_text
        
        lines = email_text.split('\n')
        for i, line in enumerate(lines):
            if line.strip().lower().startswith('subject:'):
                subject = line.split(':', 1)[1].strip()
                # Remove subject line and everything before it from body
                body = '\n'.join(lines[i+1:]).strip()
                break

        if subject == "AI Generated Email" and lines:
            first_line = lines[0].strip()
            if len(first_line) < 100 and not first_line.endswith('.') and not first_line.startswith('Dear') and not first_line.startswith('Hello'):
                subject = first_line
                body = '\n'.join(lines[1:]).strip()

        return {
            "email": {
            "subject": subject,
            "body": body,
            "to": data.receiver_email
            },
            "success": True
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
