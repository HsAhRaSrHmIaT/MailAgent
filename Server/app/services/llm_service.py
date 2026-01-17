import asyncio
import google.generativeai as genai
from typing import AsyncGenerator, Optional
from app.core.config import settings

PERSONA = {
    "name": "MailAgent",
    "role": "AI Email and Chat Assistant",
    "your_info": (
        "You are MailAgent, an intelligent AI assistant developed by Harshit Sharma. "
        "Your purpose is to help users with their communication needs - from casual conversations "
        "to crafting professional emails. You excel at understanding context and adapting to different "
        "communication styles and tones."
    ),
    "chat_instructions": (
        "You are a helpful and conversational AI assistant. "
        "Provide clear, accurate, and concise responses. "
        "Be friendly yet professional. "
        "When users ask about sending emails, politely inform them: "
        "'To send an email, please use the /email command with the recipient's address.' "
        "Focus on being helpful and informative without being overly verbose."
    ),
    "email_instructions": (
        "Generate professional, well-structured emails based on the user's brief message. "
        "Your email should have:\n"
        "1. A clear and relevant subject line\n"
        "2. Appropriate greeting based on context\n"
        "3. Well-organized body with proper paragraphs\n"
        "4. Professional closing\n"
        "5. Signature as 'Harshit Sharma'\n\n"
        "Adapt the formality and tone based on the specified tone preference. "
        "Make the email feel natural and human-written, not robotic."
    ),
}

class LLMService:
    def __init__(self, api_key: Optional[str] = None):
        self.model = None
        self.api_key = api_key or settings.google_api_key
        self.user_preferences = None  # Store user preferences

        try:
            if self.api_key:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-2.5-flash")
                self.max_tokens = settings.max_response_tokens
        except Exception as e:
            print(f"Error initializing model: {e}")

    def is_available(self) -> bool:
        return self.model is not None
    
    def set_user_preferences(self, language: str = "English", default_tone: str = "Professional", 
                           ai_learning: bool = False):
        """Set user preferences for personalized responses."""
        self.user_preferences = {
            "language": language,
            "default_tone": default_tone,
            "ai_learning": ai_learning
        }
    
    def reconfigure(self, api_key: str):
        """Reconfigure the LLM service with a new API key."""
        try:
            self.api_key = api_key
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("gemini-2.5-flash")
            self.max_tokens = settings.max_response_tokens
            return True
        except Exception as e:
            print(f"Error reconfiguring model: {e}")
            return False

    async def chat_with_gemini(self, message: str, tone: str = "", is_email: bool = False, recipient: str = "", user_id: str = None) -> AsyncGenerator[str, None]:
        if not self.is_available():
            yield "I'm sorry, but the AI service is currently unavailable. Please try again later."
            return
        
        # Use user preferences if available
        user_language = self.user_preferences.get("language", "English") if self.user_preferences else "English"
        default_tone = self.user_preferences.get("default_tone", "Professional") if self.user_preferences else "Professional"
        ai_learning_enabled = self.user_preferences.get("ai_learning", False) if self.user_preferences else False
        
        # Use provided tone or fall back to user's default tone
        effective_tone = tone if tone else default_tone
        
        # Language instruction
        language_instruction = ""
        if user_language and user_language != "English":
            language_instruction = f" Respond in {user_language} language."
 
        if is_email:
            # Fetch user's past emails for pattern learning if enabled
            email_examples = ""
            if ai_learning_enabled and user_id:
                try:
                    from app.core.database import db_manager
                    from app.services.email_service import email_service
                    
                    async with db_manager.session_factory() as db:
                        past_emails = await email_service.get_user_emails(
                            db, user_id, status="sent", limit=3
                        )
                    
                    if past_emails:
                        examples_list = []
                        for i, email in enumerate(past_emails, 1):
                            examples_list.append(
                                f"Example {i}:\n"
                                f"Subject: {email.subject}\n"
                                f"{email.body[:500]}..." if len(email.body) > 500 else f"{email.body}"
                            )
                        
                        email_examples = (
                            f"\n\n📧 USER'S PREVIOUS EMAIL WRITING STYLE:\n"
                            f"{'=' * 60}\n"
                            f"{'\n\n'.join(examples_list)}\n"
                            f"{'=' * 60}\n\n"
                            f"IMPORTANT: Analyze the above examples and mimic the user's:\n"
                            f"- Writing style and vocabulary\n"
                            f"- Sentence structure and paragraph organization\n"
                            f"- Level of formality and tone\n"
                            f"- Common phrases and expressions\n"
                            f"- Greeting and closing patterns\n\n"
                        )
                except Exception as e:
                    print(f"Error fetching email patterns: {e}")
                    # Continue without examples if fetch fails
            
            # Improved email generation prompt
            system_prompt = (
                f"You are {PERSONA['name']}, {PERSONA['your_info']}\n\n"
                f"{PERSONA['email_instructions']}"
                f"{email_examples}"
                f"\nContext:\n"
                f"- Recipient: {recipient}\n"
                f"- User's request: {message}\n"
                f"- Required tone: {effective_tone}\n\n"
                f"IMPORTANT FORMAT REQUIREMENTS:\n"
                f"1. Start with 'Subject: [your subject]'\n"
                f"2. Leave one blank line after subject\n"
                f"3. Begin with appropriate greeting (Dear/Hello/Hi based on tone)\n"
                f"4. Write clear, natural email body\n"
                f"5. End with professional closing\n"
                f"6. Sign as 'Harshit Sharma'\n\n"
                f"Tone guidance:\n"
                f"- Professional: Formal, respectful, business-appropriate\n"
                f"- Friendly: Warm, personable, yet professional\n"
                f"- Casual: Relaxed, conversational, informal\n"
                f"- Formal: Very structured, official, ceremonious\n"
                f"- Confident: Assertive, clear, authoritative\n\n"
                f"Generate a complete, natural-sounding email now:"
            )
        else:
            # Improved chat prompt
            system_prompt = (
                f"You are {PERSONA['name']}, {PERSONA['your_info']}\n\n"
                f"{PERSONA['chat_instructions']}\n\n"
                f"User's question: {message}\n"
            )
            
            if effective_tone and effective_tone != "Professional":
                system_prompt += f"\nTone: Keep your response {effective_tone.lower()}.\n"
            
            system_prompt += language_instruction

        response = self.model.generate_content(
                system_prompt,
                stream=True,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=self.max_tokens,
                    top_p=0.9
                )
            )
        
        accumulated_response = ""
        for chunk in response:
            if chunk.text:
                accumulated_response += chunk.text
                yield chunk.text
                await asyncio.sleep(0.05)


    async def generate_response(self, message: str, tone: str = "", user_id: str = None) -> str:
        accumulated_response = ""
        async for chunk in self.chat_with_gemini(message, tone, user_id=user_id):
            accumulated_response += chunk

        return accumulated_response

    async def generate_email(self, prompt: str, tone: str, recipient: str, user_id: str = None) -> dict:
        if not self.is_available():
            return {"error": "I'm sorry, but the AI service is currently unavailable. Please try again later."}

        accumulated_response = ""
        async for chunk in self.chat_with_gemini(prompt, tone, is_email=True, recipient=recipient, user_id=user_id):
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