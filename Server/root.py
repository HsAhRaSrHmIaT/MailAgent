from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import os

app = FastAPI()

class EmailInput(BaseModel):
    receiver_email: str
    short_message: str

@app.get("/")
def email():
    return {"message": "Welcome to the Email API. Use POST /send-email to send an email."}

@app.post("/send-email")
def send_email(email_input: EmailInput):
    try:
        # Simulate sending an email
        print(f"Sending email to {email_input.receiver_email} with message: {email_input.short_message}")
        return {"message": "Email sent successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))