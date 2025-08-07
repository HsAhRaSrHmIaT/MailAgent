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
    short_message: str
    send_as_draft: bool = False

@app.get("/")
def email():
    return {"message": "Welcome to the Email API. Use POST /send-email to send an email."}

@app.post("/send-email")
def send_email(data: EmailInput):
    try:
        if not data.receiver_email or not is_valid_email(data.receiver_email):
            raise HTTPException(status_code=400, detail="Invalid or missing receiver email. Cannot process the request.")
        
        if data.send_as_draft:
            print(f"[DRAFT] To: {data.receiver_email}, Message: {data.short_message}")
            return {"message": "Draft saved successfully!"}
        
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content((
            f"You are an intelligent email-writing assistant. "
            f"Take the following input and generate a complete, well-structured email for the recipient {data.receiver_email}. "
            f"The input may be a short message, a command, a purpose, or a creative idea. "
            f"Interpret the intent and write an appropriate email including a subject line, greeting, body, and closing. "
            f"Keep the tone friendly and professional. Sign the email as Harshit Sharma."
            f"\n\nInput: {data.short_message}"
        ))

        full_email = response.text.strip()

        # Simulate sending an email
        print(f"Sending email to {data.receiver_email} with message: {full_email}")

        msg = MIMEText(full_email)
        msg['Subject'] = 'AI Generated Email'
        msg['From'] = os.getenv("SENDER_EMAIL")
        msg['To'] = data.receiver_email

        server = smtplib.SMTP_SSL("smtp.gmail.com", 465)
        server.login(os.getenv("SENDER_EMAIL"), os.getenv("EMAIL_PASSWORD"))
        server.sendmail(msg['From'], [msg['To']], msg.as_string())
        server.quit()

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("CREATE TABLE IF NOT EXISTS emails (id INTEGER PRIMARY KEY AUTOINCREMENT, receiver TEXT, message TEXT, status TEXT)")
        cursor.execute("INSERT INTO emails (receiver, message, status) VALUES (?, ?, ?)", (data.receiver_email, full_email, "sent"))
        conn.commit()
        conn.close()

        return {"message": "Email sent successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))