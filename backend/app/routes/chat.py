from fastapi import APIRouter, Depends, HTTPException
from app.utils.gemini import generate_gemini_reply
from app.models.user_memory import (
    get_user_memory,
    create_or_update_memory
)
from app.utils.authMiddleware import require_auth, get_current_user_id
from typing import List, Dict

router = APIRouter(
    prefix="/api/v1",
    tags=["chat"],
    dependencies=[Depends(require_auth)]
)

@router.post("/message")
async def send_message(
    payload: Dict,
    user_id: str = Depends(get_current_user_id)
):
    """
    Stateless chat endpoint with summary memory
    """

    messages: List[Dict[str, str]] = payload.get("messages")

    if not messages:
        raise HTTPException(status_code=400, detail="Messages required")

    # 1️⃣ Load user memory (summary only)
    memory = await get_user_memory(user_id)
    user_summary = memory["summary"] if memory else None

    # 2️⃣ Generate Gemini reply
    reply = await generate_gemini_reply(
        messages=messages[-8:],  # limit context
        user_summary=user_summary
    )

    # 3️⃣ Occasionally update memory (optional rule)
    if len(messages) % 15 == 0:
        summary_prompt = f"""
Summarize the user's communication needs, struggles,
and goals in 2–3 sentences based on this conversation.
"""
        summary = await generate_gemini_reply(
            messages + [{"role": "assistant", "content": summary_prompt}],
            user_summary
        )

        await create_or_update_memory(user_id, summary)

    return {
        "role": "assistant",
        "content": reply
    }
