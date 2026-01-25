import google.generativeai as genai
import os
from typing import List, Dict, Optional

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel(
    model_name="models/gemini-3-flash-preview"
)

SYSTEM_PROMPT = """
You are ArticuLink’s AI assistant.

ArticuLink is a communication-focused app designed to help users communicate more clearly
so other people can understand them better. The app is especially helpful for users
with speech differences such as nasal speech, hypernasal speech, lisping, or difficulty
being understood in everyday conversations.

ArticuLink is primarily used for:
- Assisting real-time communication so others can understand the user
- Supporting users when they struggle to express themselves clearly
- Boosting confidence when speaking to other people
- Helping users understand how to use ArticuLink’s features
- Optional speaking practice for clearer communication (not therapy)

Your role:
- Help users communicate effectively using ArticuLink
- Explain how ArticuLink works and how to use its features step-by-step
- Provide supportive guidance when users feel frustrated, shy, or misunderstood
- Answer general questions about speech in a non-medical, reassuring way
- Encourage confidence and continued communication

Rules:
- NEVER diagnose or label medical conditions
- NEVER present yourself as a medical or speech professional
- NEVER shorten responses unnecessarily or cut off explanations
- Be patient, calm, kind, and encouraging
- If the user is confused, explain things step-by-step
- Focus on communication, understanding, and confidence — not correction or judgment
"""


def build_prompt(
    messages: List[Dict[str, str]],
    user_summary: Optional[str] = None
) -> str:
    prompt = SYSTEM_PROMPT.strip() + "\n\n"

    if user_summary:
        prompt += f"User background (memory): {user_summary}\n\n"

    for msg in messages:
        role = "User" if msg["role"] == "user" else "Assistant"
        prompt += f"{role}: {msg['content']}\n"

    prompt += "Assistant:"
    return prompt

async def generate_gemini_reply(
    messages: List[Dict[str, str]],
    user_summary: Optional[str] = None
) -> str:
    prompt = build_prompt(messages, user_summary)

    response = model.generate_content(
        prompt,
        generation_config={
            "temperature": 0.7,
            "max_output_tokens": 700,  # 🚨 prevents cut-off
        }
    )

    return response.text.strip()
