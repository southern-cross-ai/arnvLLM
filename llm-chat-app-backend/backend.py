from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Literal
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Change this if your frontend runs elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    from_: Literal['user', 'llm'] = Field(..., alias='from')
    text: str

class ChatRequest(BaseModel):
    messages: List[Message]

@app.post("/api/chat")
async def chat(request: ChatRequest):
    system_prompt = "You are JoeyLLM, an assistant developed by Southern Cross AI."

    api_messages = [
        {"role": "system", "content": system_prompt},
    ]

    for msg in request.messages:
        role = "user" if msg.from_ == "user" else "assistant"
        api_messages.append({"role": role, "content": msg.text})

    llm_api_url = "http://13.239.88.166:8000/v1/chat/completions"

    payload = {
        "model": "Joey",
        "messages": api_messages,
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(llm_api_url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    reply = data.get("choices", [{}])[0].get("message", {}).get("content", "No response")

    return {"reply": reply}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)