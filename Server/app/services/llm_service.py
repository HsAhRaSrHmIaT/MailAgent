import asyncio
import google.generativeai as genai
from typing import AsyncGenerator
from app.core.config import settings

PERSONA = {
    "name": "MailAgent",
    "role": "assistant",
    "your_info": (
        "Developed by Harshit Sharma. "
        "You are called 'MailAgent' because you provide thoughtful, composed, and supportive responses. "
        "If asked for more details about yourself, reply: "
        "'I may not have all the details, but I'm here to help you as best I can.'"
    ),
    "greeting": "Hello! How can I assist you today?",
    "instructions": (
        "Be concise and clear. "
        "If clarification is needed, ask one specific question. "
        "Always maintain a calm and supportive tone. "
        "If the user asks you to send an email (e.g., says 'send this', 'email it', 'deliver it'), "
        "respond exactly with: 'I can send an email for you, but for that you need to use the `/email` "
        "command and provide the recipient's email address.' Do not generate or draft the email in this chat context. "
        "Simply inform the user to use the `/email` command."
    ),
}

class LLMService:
    def __init__(self):
        self.model = None

        try:
            genai.configure(api_key=settings.google_api_key)
            self.model = genai.GenerativeModel("gemini-2.5-flash")
            self.max_tokens = settings.max_response_tokens
        except Exception as e:
            print(f"Error initializing model: {e}")

    def is_available(self) -> bool:
        return self.model is not None

    async def chat_with_gemini(self, message: str, tone: str, is_email: bool = False, recipient: str = "") -> AsyncGenerator[str, None]:
        if not self.is_available():
            yield "I'm sorry, but the AI service is currently unavailable. Please try again later."
            return
 
        if is_email:
            system_prompt = (
                f"You are {PERSONA['name']}, an AI email assistant. Your info is {PERSONA['your_info']} "
                f"Generate a complete, well-structured email for the recipient {recipient} based on the short message: {message}. "
                f"Format you response exactly like this:\n"
                f"Subject: [Your Subject Line]\n\n"
                f"Dear [Recipient's Name],\n"
                f"[Email Body with greeting, content, and closing]\n\n"
                f"Keep the tone {tone} (if provided, otherwise use a neutral professional tone). Sign the email as Harshit Sharma."
            )
        else:
            system_prompt = (
                f"You are {PERSONA['name']}, a general AI assistant. "
                f"{PERSONA['instructions']} "
                f"User message: {message} "
                f"{'Adjust your tone to be ' + tone + '.' if tone else ''}"
            )

        full_prompt = f"{system_prompt}\n\nUser: {message}\n\nAssistant:"

        response = self.model.generate_content(
                full_prompt,
                stream=True,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=self.max_tokens,
                    top_p=0.9
                )
            )
        
        accumulated_response = ""
        chunk_count = 0
        for chunk in response:
            if chunk.text:
                chunk_count += 1
                accumulated_response += chunk.text
                yield chunk.text

                await asyncio.sleep(0.05)

        # print(f"Chunk Count: {chunk_count}")
        # print(accumulated_response)


    async def generate_response(self, message: str, tone: str = "") -> str:
        accumulated_response = ""
        async for chunk in self.chat_with_gemini(message, tone):
            accumulated_response += chunk

        # print(f"Final accumulated response: {accumulated_response}")
        return accumulated_response

    async def generate_email(self, prompt: str, tone: str, recipient: str) -> dict:
        if not self.is_available():
            return {"error": "I'm sorry, but the AI service is currently unavailable. Please try again later."}

        accumulated_response = ""
        async for chunk in self.chat_with_gemini(prompt, tone, is_email=True, recipient=recipient):
            accumulated_response += chunk
        email_text = accumulated_response.strip()
        subject = "AI Generated Email"
        body = email_text

        lines = email_text.split("\n")
        for i, line in enumerate(lines):
            if line.strip().lower().startswith("subject:"):
                subject = line.split(":", 1)[1].strip()
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
                "to": recipient,
                "body": body
            },
            "success": True
        }

llm_service = LLMService()